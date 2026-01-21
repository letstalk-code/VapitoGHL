require('dotenv').config();
const axios = require('axios');

const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;

async function testJotform() {
    try {
        console.log('Testing JotForm API Key...');
        const response = await axios.get('https://api.jotform.com/user', {
            headers: { 'APIKEY': JOTFORM_API_KEY }
        });

        if (response.data.responseCode === 200) {
            console.log('✅ Success! Connected to JotForm account:', response.data.content.username);

            console.log('Fetching forms...');
            const formsResponse = await axios.get('https://api.jotform.com/user/forms', {
                headers: { 'APIKEY': JOTFORM_API_KEY }
            });
            console.log(`Found ${formsResponse.data.content.length} forms:`);
            formsResponse.data.content.forEach(form => {
                console.log(`- ID: ${form.id} | Name: ${form.title}`);
            });
        } else {
            console.error('❌ API Error:', response.data.message);
        }
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

testJotform();
