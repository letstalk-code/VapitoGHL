require('dotenv').config();
const axios = require('axios');

const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/NzbVVSNFa2G2M2oCiRWD/webhook-trigger/403456bf-d309-46ed-85f5-d7e822b62909";

async function setupJotformWebhooks() {
    try {
        console.log('Fetching all JotForms...');
        const formsResponse = await axios.get('https://api.jotform.com/user/forms', {
            headers: { 'APIKEY': JOTFORM_API_KEY }
        });

        const forms = formsResponse.data.content;
        console.log(`Found ${forms.length} forms. Connecting to GHL Master Router...`);

        for (const form of forms) {
            try {
                // First, check if webhook already exists to avoid duplicates
                const webhooksResponse = await axios.get(`https://api.jotform.com/form/${form.id}/webhooks`, {
                    headers: { 'APIKEY': JOTFORM_API_KEY }
                });

                const existingWebhooks = Object.values(webhooksResponse.data.content || {});
                if (existingWebhooks.includes(GHL_WEBHOOK_URL)) {
                    console.log(`✅ Form "${form.title}" (ID: ${form.id}) is already connected.`);
                    continue;
                }

                // Add the webhook
                await axios.post(`https://api.jotform.com/form/${form.id}/webhooks`, `webhookURL=${encodeURIComponent(GHL_WEBHOOK_URL)}`, {
                    headers: {
                        'APIKEY': JOTFORM_API_KEY,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                console.log(`🚀 Connected Form: "${form.title}" (ID: ${form.id})`);
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
