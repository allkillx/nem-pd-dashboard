// Fetch and display times for all time zones
async function updateClocks() {
    try {
        const response = await fetch('/api/time');
        const times = await response.json();
        
        const clockGrid = document.getElementById('clockGrid');
        
        // Clear existing clocks on first load
        if (clockGrid.children.length === 0) {
            clockGrid.innerHTML = '';
            
            for (const [city, data] of Object.entries(times)) {
                const clockCard = createClockCard(city, data);
                clockGrid.appendChild(clockCard);
            }
        } else {
            // Update existing clocks
            const clockCards = clockGrid.querySelectorAll('.clock-card');
            let index = 0;
            
            for (const [city, data] of Object.entries(times)) {
                if (clockCards[index]) {
                    const timeDisplay = clockCards[index].querySelector('.time-display');
                    const dateDisplay = clockCards[index].querySelector('.date-display');
                    timeDisplay.textContent = data.time;
                    dateDisplay.textContent = data.date;
                }
                index++;
            }
        }
    } catch (error) {
        console.error('Error fetching time data:', error);
    }
}

// Create a clock card element
function createClockCard(city, data) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.innerHTML = `
        <div class="city-name">${city}</div>
        <div class="time-display">${data.time}</div>
        <div class="date-display">${data.date}</div>
        <div class="timezone-label">${data.timezone}</div>
    `;
    return card;
}

// Initialize and update clocks
document.addEventListener('DOMContentLoaded', () => {
    updateClocks(); // Initial load
    setInterval(updateClocks, 1000); // Update every second
});