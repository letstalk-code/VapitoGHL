require('dotenv').config();
const axios = require('axios');

async function testKey() {
    const key = process.env.VAPI_PRIVATE_KEY;
    console.log('Testing Key:', key.substring(0, 8) + '...');
    try {
        const response = await axios.get('https://api.vapi.ai/assistant', {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        console.log('✅ Key is VALID! Found', response.data.length, 'assistants.');
    } catch (error) {
        console.error('❌ Key is INVALID or insufficient permissions.');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
    }
}

testKey();
