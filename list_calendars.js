require('dotenv').config();
const axios = require('axios');

async function listCalendars() {
    const token = process.env.GHL_ACCESS_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;

    console.log('Fetching Calendars for Location:', locationId);

    try {
        const response = await axios.get(`https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Version': '2021-04-15'
            }
        });

        console.log('\n--- AVAILABLE CALENDARS ---');
        if (response.data.calendars && response.data.calendars.length > 0) {
            response.data.calendars.forEach(cal => {
                console.log(`- NAME: ${cal.name}`);
                console.log(`  ID:   ${cal.id}\n`);
            });
        } else {
            console.log('No calendars found for this location.');
        }
    } catch (error) {
        console.error('❌ Error fetching calendars:', error.response ? error.response.data : error.message);
    }
}

listCalendars();
