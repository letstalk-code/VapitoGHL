require('dotenv').config();
const axios = require('axios');

async function sendTestWebhook() {
    const webhookUrl = process.env.GHL_WEBHOOK_URL;
    console.log('Sending FULL Test Payload to GHL:', webhookUrl);

    if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK_ID_HERE')) {
        console.error('❌ Hook URL is invalid.');
        return;
    }

    try {
        const response = await axios.post(webhookUrl, {
            phone: "+15550000000",
            name: "John Doe",
            email: "john.doe@example.com",
            appointment_time: "Tomorrow at 2:00 PM",
            summary: "John Doe is interested in AI Chatbots for his film business. He wants to see a demo of the $197 plan.",
            timestamp: new Date().toISOString(),
            source: "VAPI AI Caller - FULL TEST"
        });
        console.log('✅ Test Data Sent! Status:', response.status);
        console.log('\n--- NEW MAPPING KEYS ---');
        console.log('1. appointment_time');
        console.log('2. summary');
    } catch (error) {
        console.error('❌ Failed to send:', error.message);
    }
}

sendTestWebhook();
