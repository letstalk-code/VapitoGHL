require('dotenv').config();
const axios = require('axios');

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const SERVER_URL = process.env.SERVER_URL;
// This is your "Sarah 2 GHL Booking Assistant" ID from the logs
const EXISTING_ASSISTANT_ID = "a9346f71-74fd-4dfe-bfb4-dd10761de745";

const assistantConfig = {
    name: "Sarah 2 GHL Booking Assistant (Pro)",
    transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US"
    },
    model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are Sarah, a professional, friendly, and confident AI voice assistant for Creatively Grow, specializing in Smart Websites, AI Chatbots, SEO, and Voice AI solutions.

CORE ROLE:
- Greet callers professionally and understand why they’re calling.
- Educate them clearly (without jargon).
- Qualify interest and guide them toward a strategy call.
- Collect Name, Email, and Phone number.

VOICE & PERSONALITY:
- Warm, confident, slightly witty, and consultative.
- Sound calm and natural. Never rush.
- Never mention you are an AI. 

TALKING POINTS:
- Smart websites/AI chatbots capture leads 24/7.
- Professional Plan: $197/mo (discounted from $297).

CALENDAR BOOKING FLOW (CRITICAL):
1. Once you have their info, you MUST call 'get_available_slots' to see real-time availability.
2. Read out the available days/times Sarah.
3. If they pick one, use 'book_appointment' to finalize it in GHL.
4. If booking is confirmed: “Perfect. You’ll receive a confirmation shortly with all the details.”`
            }
        ],
        tools: [
            {
                type: "function",
                messages: [
                    { type: "request-start", content: "Let me check our calendar availability..." },
                    { type: "request-complete", content: "I've found some slots." }
                ],
                function: {
                    name: "get_available_slots",
                    description: "Checks real-time GHL calendar availability.",
                    parameters: { type: "object", properties: {} }
                },
                server: { url: SERVER_URL }
            },
            {
                type: "function",
                messages: [
                    { type: "request-start", content: "Booking that call for you now..." },
                    { type: "request-complete", content: "Great, you are booked!" }
                ],
                function: {
                    name: "book_appointment",
                    description: "Books the appointment in GHL.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" },
                            phone: { type: "string" },
                            time: { type: "string" }
                        },
                        required: ["name", "email", "phone", "time"]
                    }
                },
                server: { url: SERVER_URL }
            }
        ]
    },
    voice: {
        provider: "vapi",
        voiceId: "Leah"
    },
    serverUrl: SERVER_URL,
    serverMessages: ["end-of-call-report", "hang"],
    analysisPlan: {
        structuredDataSchema: {
            type: "object",
            properties: {
                customerName: { type: "string" },
                customerEmail: { type: "string" },
                appointmentTime: { type: "string" }
            }
        }
    }
};

async function updateAssistant() {
    try {
        console.log(`🚀 Updating your original "Sarah 2" Assistant (ID: ${EXISTING_ASSISTANT_ID})...`);

        // We use PATCH to update the existing one instead of POSTing a new one
        const response = await axios.patch(`https://api.vapi.ai/assistant/${EXISTING_ASSISTANT_ID}`, assistantConfig, {
            headers: {
                'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ UPDATE SUCCESSFUL!');
        console.log('Your bot is now upgraded with Calendar power, but kept her personality.');
        console.log('No need to change IDs in the dashboard!');
    } catch (error) {
        console.error('❌ Update failed:', error.response ? error.response.data : error.message);
    }
}

updateAssistant();
