# NEM PD Dashboard

一个轻量级电力市场 dashboard，展示 AEMO NEM 5 个 region 的 30-min 价格、需求、可用发电，附带机器学习预测和异常检测。

## 架构

```
┌────────────────────┐      ┌─────────────┐      ┌──────────────────┐
│  fetch_nem.py      │ ───> │  data/*.json │ ───> │ nem_dashboard.html│
│  (cron / GH Action)│      │  (atomic)    │      │ (静态托管)        │
└────────────────────┘      └─────────────┘      └──────────────────┘
   OpenElectricity API           5 个 JSON              浏览器 fetch
```

Dashboard 是单文件 HTML，没有构建步骤。看到 `./data/*.json` 就用真实数据，找不到就用内置合成数据（演示模式）。

## 安装

```bash
pip install -r requirements.txt
export OPENELECTRICITY_API_KEY=your-key-here
# 可选：自定义输出目录（默认 ./data）
export NEM_DATA_DIR=./data
```

## 运行管线

三种模式，按需调度：

```bash
# 仅刷新 ticker（最近 1 天，跳过重训预测）— 推荐 5 分钟一次
python fetch_nem.py --mode latest

# 完整刷新（7 天历史 + 预测 + 异常）— 推荐 30 分钟一次
python fetch_nem.py --mode full

# 回填 30 天历史 — 每天跑一次即可（如 04:00 AEST 之后）
python fetch_nem.py --mode backfill
```

输出文件（原子写入，dashboard 永远不会读到半截文件）：
- `data/latest.json` — 每个 region 的最新 interval + Δ%
- `data/history_30d.json` — 30 天 × 5 region × 48 interval
- `data/forecast.json` — 未来 12 小时（24 个 interval）预测 + 80% 置信区间
- `data/anomalies.json` — z-score > 2.5 的价格异常事件
- `data/meta.json` — 时间戳和状态

## 调度示例

### crontab

```cron
*/5  * * * *  cd /path/to/dashboard && /usr/bin/python fetch_nem.py --mode latest    >> logs/cron.log 2>&1
*/30 * * * *  cd /path/to/dashboard && /usr/bin/python fetch_nem.py --mode full      >> logs/cron.log 2>&1
0 14 * * *    cd /path/to/dashboard && /usr/bin/python fetch_nem.py --mode backfill  >> logs/cron.log 2>&1
```

(注意 cron 是 UTC，AEST 04:00 ≈ UTC 18:00 前一天，AEDT 04:00 ≈ UTC 17:00 前一天；上面 `0 14` 是 AEST 00:00。按你的服务器时区调。)

### GitHub Actions（免费托管）

`.github/workflows/refresh.yml`:

```yaml
name: NEM data refresh
on:
  schedule:
    - cron: '*/30 * * * *'
  workflow_dispatch:
jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - env:
          OPENELECTRICITY_API_KEY: ${{ secrets.OPENELECTRICITY_API_KEY }}
        run: python fetch_nem.py --mode full
      - run: |
          git config user.name 'github-actions'
          git config user.email 'actions@github.com'
          git add data/
          git diff --staged --quiet || git commit -m "data: refresh $(date -u +%FT%TZ)"
          git push
```

之后启用 GitHub Pages 指向 repo 根目录，dashboard 就跑起来了 — 完全免费、零运维。

## 模型说明

`fetch_nem.py` 里的预测是 **Gradient Boosting Regression**，三模型组合：
- 点预测：标准 GBR
- 下界（10 分位）：quantile GBR, α=0.1
- 上界（90 分位）：quantile GBR, α=0.9

特征：
- 时间循环编码（sin/cos of TOD）、星期、是否周末
- 价格 lag: t-1, t-2, t-6 (3hr), t-48 (1day), t-336 (7day)
- 需求 lag: t-1, t-48
- 滚动均值（8 期）、滚动 std（48 期）

递归预测 24 个 interval（12 小时）。需要换更强的模型（LightGBM/XGBoost/TFT），改 `forecast_region()` 即可，输出 JSON schema 不变，dashboard 不用动。

异常检测用 robust MAD z-score（比 σ 抗尖峰污染），阈值 z=2.5。

## 本地预览

```bash
# 静态服务（任何静态服务器都行）
python -m http.server 8000
# 浏览器打开 http://localhost:8000/nem_dashboard.html
```

不能直接双击 HTML 打开 — `file://` 协议下 `fetch('./data/*.json')` 会被浏览器拦截，会回退到合成数据。

## 文件清单

| 文件 | 作用 |
|---|---|
| `nem_dashboard.html` | 单文件前端 |
| `fetch_nem.py` | 数据管线 |
| `requirements.txt` | Python 依赖 |
| `data/` | JSON 输出（自动生成） |
| `README.md` | 本文件 |

## 后续可加

- 5-min dispatch 视图（现在是 30-min trading 间隔）
- 燃料结构堆积图（`get_network_data` + `secondary_grouping='fueltech'`）
- Interconnector 流向
- 把模型换成 LightGBM 并加入天气特征（BOM API）
- 飞涨价格 webhook 推送（Slack / Discord / 邮件）
