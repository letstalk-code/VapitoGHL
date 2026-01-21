# VAPI to GoHighLevel (GHL) Real-Life Integration

This project bridges **VAPI (Voice AI)** and **GoHighLevel (GHL)**. When a call finishes on VAPI:
1.  VAPI sends a summary of the call to this server.
2.  This server forwards the phone number and summary to a GHL Workflow.
3.  GHL notifies the business owner and sends a confirmation SMS to the caller.

## Prerequisites

-   **Node.js** installed.
-   **ngrok** (for local testing) or a deployed server (Heroku, Vercel, Railway).
-   **VAPI Account** with a phone number purchased.
-   **GoHighLevel Account**.

## Setup Guide

### 1. Configure this Server

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start the Server**:
    ```bash
    node server.js
    ```
3.  **Expose to Internet (Locally)**:
    If running locally, use ngrok to get a public URL:
    ```bash
    ngrok http 3000
    ```
    Copy the `https` URL (e.g., `https://1234.ngrok.io`).

### 2. Configure GoHighLevel (GHL) Workflow

1.  **Create a New Workflow** in GHL > Automation.
2.  **Add Trigger**: Select **"Incoming Webhook"**.
    *   Copy the **Webhook URL** provided by GHL.
    *   Paste this URL into your `.env` file as `GHL_WEBHOOK_URL`.
3.  **Add Action 1: Create/Update Contact**:
    *   Field: Phone -> look for "Incoming Webhook" data (you may need to run a test first to map fields). Map `phone` from the webhook to the Contact's Phone field.
4.  **Add Action 2: Internal Notification**:
    *   Type: SMS or Email.
    *   Recipient: User (Business Owner).
    *   Message:
        ```text
        New AI Call Summary:
        {{webhook.summary}}
        
        Caller: {{webhook.phone}}
        ```
5.  **Add Action 3: Send SMS**:
    *   Recipient: Contact.
    *   Message:
        ```text
        Hi! Thanks for speaking with our AI assistant. We've set up your appointment for the free demo. See you then!
        ```
6.  **Publish** the workflow.

### 3. Configure VAPI

1.  Go to your **VAPI Dashboard**.
2.  Select your **Assistant**.
3.  Go to **Server URL** (or Call Reporting / Webhook settings).
4.  Enter your ngrok (or deployed) URL followed by `/webhook/vapi`:
    *   Example: `https://1234.ngrok.io/webhook/vapi`
5.  Ensure **"End of Call Report"** is enabled in the VAPI settings so it sends the summary.

## Testing the "Real-Life Scenario"

1.  Make a call to your VAPI Phone Number.
2.  Talk to the AI assistant.
3.  Hang up.
4.  Check your terminal running `node server.js` - you should see the VAPI JSON payload.
5.  Check your GoHighLevel Workflow History - it should trigger and execute the actions!
