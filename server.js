require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GHL Config from .env
const GHL_TOKEN = process.env.GHL_ACCESS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const CALENDAR_ID = "tTy239HES3GhEtfiJAXq"; // "Strategy Call" Calendar

/**
 * Helper: Fetch Free Slots from GHL
 */
async function getGHLFreeSlots() {
    try {
        const startTime = Date.now();
        const endTime = startTime + (7 * 24 * 60 * 60 * 1000); // 7 days ahead

        const response = await axios.get(`https://services.leadconnectorhq.com/calendars/free-slots`, {
            params: {
                calendarId: CALENDAR_ID,
                startDate: startTime,
                endDate: endTime
            },
            headers: {
                'Authorization': `Bearer ${GHL_TOKEN}`,
                'Version': '2021-04-15'
            }
        });

        const slotsObj = response.data;
        let availableSummary = "I have several slots open. Here are a few: ";

        const days = Object.keys(slotsObj);
        let count = 0;
        for (const day of days) {
            if (slotsObj[day].slots && slotsObj[day].slots.length > 0) {
                const dateLabel = new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                const times = slotsObj[day].slots.slice(0, 3).map(s => {
                    return new Date(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                });
                availableSummary += `${dateLabel} at ${times.join(', ')}. `;
                count++;
            }
            if (count >= 3) break;
        }

        return count > 0 ? availableSummary : "I don't see any open slots this week, but I can have a specialist call you!";
    } catch (err) {
        console.error('Error fetching GHL slots:', err.response?.data || err.message);
        return "I'm having a little trouble seeing the calendar, but let's take your info and I'll have someone call you back!";
    }
}

/**
 * Helper: Book Appointment in GHL
 */
async function bookGHLAppointment(name, email, phone, startTime) {
    try {
        const response = await axios.post(`https://services.leadconnectorhq.com/calendars/appointments`, {
            calendarId: CALENDAR_ID,
            locationId: GHL_LOCATION_ID,
            startTime: startTime,
            title: `AI Booking: ${name}`,
            email: email,
            phone: phone,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || 'Caller',
            description: "Appointment booked by Sarah (AI Assistant). Ready for strategy session."
        }, {
            headers: {
                'Authorization': `Bearer ${GHL_TOKEN}`,
                'Version': '2021-04-15',
                'Content-Type': 'application/json'
            }
        });

        return "Confirmed! I've placed that on my calendar for you. You'll get a confirmation text and email shortly. I look forward to our call!";
    } catch (err) {
        console.error('Error booking GHL appointment:', err.response?.data || err.message);
        return "I've noted that time! There was a small lag in my calendar system, so if you don't see the invite in a few minutes, our team will reach out to confirm manually.";
    }
}

/**
 * BRIDGE: JotForm to GHL
 * This route translates JotForm's internal codes into "Pretty" fields for GHL.
 */
app.post('/webhook/jotform', async (req, res) => {
    try {
        // JotForm can send data as JSON or URL Encoded. bodyParser handles both.
        const data = req.body;

        console.log('📬 [JotForm Bridge] Received data for form:', data.formTitle || data.formID);

        // Helper to find a field by a partial name (in case Q IDs change)
        const findField = (regex) => {
            const key = Object.keys(data).find(k => regex.test(k));
            return key ? data[key] : null;
        };

        // Extract Bride/Groom Name components
        const bride = data.q15_bridesName || findField(/bridesName/i) || {};
        const groom = data.q85_groomsName || findField(/groomsName/i) || {};
        const weddingDate = data.q117_weddingDate || findField(/weddingDate/i) || {};

        const prettyData = {
            form_id: data.formID || "",
            form_title: data.formTitle || "",
            first_name: bride.first || (typeof bride === 'string' ? bride.split(' ')[0] : ""),
            last_name: bride.last || (typeof bride === 'string' ? bride.split(' ').slice(1).join(' ') : ""),
            email: data.q113_email || data.email114 || data.email || findField(/email/i) || "",
            phone: data.q37_phoneNumber || findField(/phone/i) || "",
            brides_first_name: bride.first || "",
            brides_last_name: bride.last || "",
            grooms_first_name: groom.first || "",
            grooms_last_name: groom.last || "",
            event_date: weddingDate.month ? `${weddingDate.month}/${weddingDate.day}/${weddingDate.year}` : (typeof weddingDate === 'string' ? weddingDate : ""),
            venue_location: data.q88_weddingCeremony88 || findField(/ceremony/i) || "",
            reception_location: data.q89_weddingReception || findField(/reception/i) || ""
        };

        console.log('✨ Data cleaned. Forwarding to GHL...');

        // Forward to GHL Master Router
        const ghlWebhookUrl = "https://services.leadconnectorhq.com/hooks/NzbVVSNFa2G2M2oCiRWD/webhook-trigger/403456bf-d309-46ed-85f5-d7e822b62909";
        await axios.post(ghlWebhookUrl, prettyData);

        console.log('✅ Success! Forwarded to GHL for:', prettyData.first_name);
        res.status(200).send({ status: "success" });
    } catch (error) {
        console.error('❌ JotForm Bridge Error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

/**
 * VAPI Webhook Route
 */
app.post('/webhook/vapi', async (req, res) => {
    try {
        const payload = req.body;
        const message = payload.message || payload;

        if (message.type === 'tool-calls') {
            const toolCall = message.toolCalls[0];
            const functionName = toolCall.function.name;
            const args = toolCall.function.arguments || {};

            let result = "";
            if (functionName === 'get_available_slots') {
                result = await getGHLFreeSlots();
            } else if (functionName === 'book_appointment') {
                result = await bookGHLAppointment(args.name, args.email, args.phone, args.time);
            }

            return res.status(200).send({
                results: [{
                    toolCallId: toolCall.id,
                    result: result
                }]
            });
        }

        if (message.type === 'end-of-call-report') {
            const analysis = message.analysis || {};
            const structuredData = analysis.structuredData || {};
            const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;

            if (ghlWebhookUrl) {
                await axios.post(ghlWebhookUrl, {
                    phone: message.call?.customer?.number || message.customer?.number || "Unknown",
                    name: structuredData.customerName || "Unknown contact",
                    email: structuredData.customerEmail || "",
                    appointment_time: structuredData.appointmentTime || "See Calendar",
                    summary: analysis.summary || "No summary",
                    source: "VAPI AI Booking Bot"
                });
            }
        }

        res.status(200).send({ message: "Webhook received" });
    } catch (error) {
        console.error('Vapi Webhook Error:', error.message);
        res.status(500).send({ error: "Internal Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
