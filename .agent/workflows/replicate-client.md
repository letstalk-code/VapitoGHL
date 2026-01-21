---
description: Replicate Vapi-GHL Integration for a new client
---

# Vapi-GHL Replication Workflow

Follow these steps to set up a new client:

1. **Collect Client Credentials**
   - GHL Access Token (Private Integration)
   - GHL Location ID
   - Target Calendar ID
   - GHL Workflow Webhook URL
   - Vapi Private Key

2. **Clone the Template**
   - Create a new folder for the client.
   - Copy `server.js`, `setup_vapi.js`, and `package.json` into it.

3. **Configure Environment**
   - Edit `.env` with the client's credentials.

4. **Verify Assistant Personality**
   - Open `setup_vapi.js`.
   - Update the `system` message to reflect the client's business name and services.

// turbo
5. **Initialize Git and Push**
   - `git init`
   - `git add .`
   - `git commit -m "Client setup"`
   - Create a private GitHub repo and push to it.

6. **Deploy to Render**
   - Create a new Web Service on Render.
   - Connect the GitHub repo.
   - Add the `.env` variables to Render.

7. **Final Vapi Sync**
   - Once Render is live, get the URL.
   - Update `SERVER_URL` in the local `.env`.
   - // turbo
   - Run `node setup_vapi.js` to sync the new cloud URL to Vapi.

8. **Live Test**
   - Call the Vapi number and book a test appointment.
