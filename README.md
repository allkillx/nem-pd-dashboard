# Digital Clock - Multiple Time Zones

A web-based digital clock application that displays the current time across multiple time zones in real-time.

## Features

- **Real-time Clock Display**: Updates every second with live time
- **Multiple Time Zones**: Shows time for major cities around the world
- **24-Hour Format**: Displays time in HH:MM:SS format
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean UI**: Modern, easy-to-read interface with color-coded time zones

## Time Zones Included

- New York (EST/EDT)
- London (GMT/BST)
- Paris (CET/CEST)
- Tokyo (JST)
- Sydney (AEDT/AEST)
- Dubai (GST)
- Singapore (SGT)
- Hong Kong (HKT)
- Bangkok (ICT)
- Mumbai (IST)

## Installation

### Requirements
- Python 3.7+
- Flask
- Pytz

### Setup

1. Clone the repository:
```bash
git clone https://github.com/allkillx/nem-pd-dashboard.git
cd nem-pd-dashboard
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
nem-pd-dashboard/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── templates/
    └── index.html        # HTML template
└── static/
    └── style.css         # CSS styling
    └── script.js         # JavaScript for clock logic
```

## Usage

Once the application is running:
1. The clock will automatically update every second
2. Each time zone displays the current time in that region
3. Time zones are arranged by region for easy reference

## Technologies Used

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Time Zone Handling**: Pytz library

## Author

Created for the nem-pd-dashboard project

## License

MIT License