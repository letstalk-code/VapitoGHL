require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

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

app.post('/webhook/vapi', async (req, res) => {
    try {
        const payload = req.body;
        const message = payload.message || payload;

        // --- TOOL CALLS ---
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

        // --- END OF CALL ---
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
        console.error('Webhook Error:', error.message);
        res.status(500).send({ error: "Internal Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
