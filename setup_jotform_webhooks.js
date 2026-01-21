require('dotenv').config();
const axios = require('axios');

const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
// This now points to your Render "Bridge" instead of GHL directly
const BRIDGE_URL = "https://vapitoghl.onrender.com/webhook/jotform";

async function setupJotformWebhooks() {
    try {
        console.log('Fetching all JotForms...');
        const formsResponse = await axios.get('https://api.jotform.com/user/forms', {
            headers: { 'APIKEY': JOTFORM_API_KEY }
        });

        const forms = formsResponse.data.content;
        console.log(`Found ${forms.length} forms. Connecting to the Bridge...`);

        for (const form of forms) {
            try {
                // First, check if webhook already exists to avoid duplicates
                const webhooksResponse = await axios.get(`https://api.jotform.com/form/${form.id}/webhooks`, {
                    headers: { 'APIKEY': JOTFORM_API_KEY }
                });

                const existingWebhooks = Object.values(webhooksResponse.data.content || {});
                if (existingWebhooks.includes(BRIDGE_URL)) {
                    console.log(`✅ Form "${form.title}" (ID: ${form.id}) is already bridged.`);
                    continue;
                }

                // Add the webhook
                await axios.post(`https://api.jotform.com/form/${form.id}/webhooks`, `webhookURL=${encodeURIComponent(BRIDGE_URL)}`, {
                    headers: {
                        'APIKEY': JOTFORM_API_KEY,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                console.log(`🚀 Bridged Form: "${form.title}" (ID: ${form.id})`);
            } catch (formErr) {
                console.error(`❌ Could not connect Form "${form.title}":`, formErr.message);
            }
        }

        console.log('\n✨ ALL FORMS CONFIGURED!');
        console.log('Now, when anyone signs a contract, JotForm will send the data to your GHL Master Router.');
    } catch (error) {
        console.error('❌ Setup Error:', error.message);
    }
}

setupJotformWebhooks();
