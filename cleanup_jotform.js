require('dotenv').config();
const axios = require('axios');

const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const BRIDGE_URL = "https://vapitoghl.onrender.com/webhook/jotform";
const OLD_GHL_URL = "https://services.leadconnectorhq.com/hooks/NzbVVSNFa2G2M2oCiRWD/webhook-trigger/403456bf-d309-46ed-85f5-d7e822b62909";

async function cleanupWebhooks() {
    try {
        const formsResponse = await axios.get('https://api.jotform.com/user/forms', {
            headers: { 'APIKEY': JOTFORM_API_KEY }
        });

        const forms = formsResponse.data.content;
        console.log(`Cleaning up ${forms.length} forms...`);

        for (const form of forms) {
            const webhooksResponse = await axios.get(`https://api.jotform.com/form/${form.id}/webhooks`, {
                headers: { 'APIKEY': JOTFORM_API_KEY }
            });

            const webhooks = webhooksResponse.data.content || {};

            for (const [webhookId, url] of Object.entries(webhooks)) {
                // If it's the old direct GHL URL, delete it
                if (url === OLD_GHL_URL) {
                    await axios.delete(`https://api.jotform.com/form/${form.id}/webhooks/${webhookId}`, {
                        headers: { 'APIKEY': JOTFORM_API_KEY }
                    });
                    console.log(`🗑 Removed old direct GHL link from: ${form.title}`);
                }
            }

            // Ensure the Bridge is added if missing
            const currentUrls = Object.values(webhooks);
            if (!currentUrls.includes(BRIDGE_URL)) {
                await axios.post(`https://api.jotform.com/form/${form.id}/webhooks`, `webhookURL=${encodeURIComponent(BRIDGE_URL)}`, {
                    headers: {
                        'APIKEY': JOTFORM_API_KEY,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                console.log(`✅ Added Bridge to: ${form.title}`);
            }
        }
        console.log('\n✨ CLEANUP COMPLETE. Only the Bridge remains!');
    } catch (error) {
        console.error('Cleanup Error:', error.message);
    }
}

cleanupWebhooks();
