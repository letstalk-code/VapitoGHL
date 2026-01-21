require('dotenv').config();
const axios = require('axios');

/**
 * CONFIGURATION
 * These are pulled from your .env file
 */
const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const GHL_ACCESS_TOKEN = process.env.GHL_ACCESS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

/**
 * Function to send JotForm submission data to GHL
 */
async function sendToGHL(contactData) {
    try {
        console.log(`Pushing ${contactData.firstName} ${contactData.lastName} to GHL...`);

        const response = await axios.post(`https://services.leadconnectorhq.com/contacts/`, {
            locationId: GHL_LOCATION_ID,
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            email: contactData.email,
            phone: contactData.phone,
            source: 'JotForm Integration',
            tags: ['JotFormSubmission']
        }, {
            headers: {
                'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
                'Version': '2021-04-15',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Success! Contact created/updated in GHL ID:', response.data.contact.id);
        return response.data;
    } catch (error) {
        console.error('❌ Error sending to GHL:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Function to fetch submissions from a specific JotForm
 * @param {string} formId 
 */
async function syncJotFormSubmissions(formId) {
    try {
        console.log(`Fetching submissions for Form ID: ${formId}...`);
        const response = await axios.get(`https://api.jotform.com/form/${formId}/submissions`, {
            headers: { 'APIKEY': JOTFORM_API_KEY },
            params: { limit: 10, order_by: 'created_at' }
        });

        const submissions = response.data.content;
        console.log(`Found ${submissions.length} recent submissions.`);

        for (const submission of submissions) {
            // Mapping JotForm fields to GHL fields
            // Note: Field IDs (q1, q2) vary by form. Edit these to match your form.
            const answers = submission.answers;

            // Example mapping (Commonly q1 is Name, q2 is Email, q3 is Phone)
            // You can find your specific field IDs by running test_jotform.js and logging the submission response
            const nameField = Object.values(answers).find(a => a.name?.toLowerCase().includes('name'))?.answer || {};
            const emailField = Object.values(answers).find(a => a.name?.toLowerCase().includes('email'))?.answer;
            const phoneField = Object.values(answers).find(a => a.name?.toLowerCase().includes('phone'))?.answer;

            const contactData = {
                firstName: nameField.first || 'New',
                lastName: nameField.last || 'Submission',
                email: emailField || '',
                phone: phoneField || ''
            };

            if (contactData.email || contactData.phone) {
                await sendToGHL(contactData);
            } else {
                console.log('⚠️ Skipping submission with no email or phone.');
            }
        }
    } catch (error) {
        console.error('❌ JotForm Sync Error:', error.response?.data || error.message);
    }
}

/**
 * MAIN EXECUTION
 * You can run this script periodically or set up a real JotForm Webhook to call your server.
 */
const args = process.argv.slice(2);
const formId = args[0];

if (!formId) {
    console.log('Please provide a JotForm ID. Usage: node jotform_to_ghl.js YOUR_FORM_ID');
    process.exit(1);
}

syncJotFormSubmissions(formId);
