from flask import Flask, render_template, jsonify
from datetime import datetime
import pytz

app = Flask(__name__)

# Define time zones
TIME_ZONES = {
    'New York': 'America/New_York',
    'London': 'Europe/London',
    'Paris': 'Europe/Paris',
    'Tokyo': 'Asia/Tokyo',
    'Sydney': 'Australia/Sydney',
    'Dubai': 'Asia/Dubai',
    'Singapore': 'Asia/Singapore',
    'Hong Kong': 'Asia/Hong_Kong',
    'Bangkok': 'Asia/Bangkok',
    'Mumbai': 'Asia/Kolkata',
}

@app.route('/')
def index():
    return render_template('index.html', timezones=TIME_ZONES.keys())

@app.route('/api/time')
def get_time():
    """API endpoint that returns current time for all time zones"""
    times = {}
    for city, tz in TIME_ZONES.items():
        tz_obj = pytz.timezone(tz)
        current_time = datetime.now(tz_obj)
        times[city] = {
            'time': current_time.strftime('%H:%M:%S'),
            'date': current_time.strftime('%A, %B %d, %Y'),
            'timezone': tz
        }
    return jsonify(times)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)