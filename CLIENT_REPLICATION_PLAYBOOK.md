# 🚀 Vapi -> GHL Integration Replication Playbook
This document outlines the exact steps to recreate this AI Booking System for a new client in under 30 minutes.

---

## 🏗 Phase 1: GoHighLevel (GHL) Setup
1. **Create a Private Integration**:
   - Go to Client GHL Settings > Private Integrations > Create New.
   - **Scopes Required**: `calendars.readonly`, `calendars.write`, `contacts.readonly`, `contacts.write`, `locations.readonly`.
   - Copy the `GHL_ACCESS_TOKEN` and `GHL_LOCATION_ID`.
2. **Setup the Booking Workflow**:
   - Create a new Workflow triggered by "Incoming Webhook".
   - Copy the Webhook URL (this will be your `GHL_WEBHOOK_URL`).
   - Add actions to create/update contact and send notifications.
3. **Get Calendar ID**:
   - Go to Calendars > Calendar Settings.
   - Copy the ID of the calendar you want the AI to book into.

---

## 🎙 Phase 2: Vapi Setup
1. **The Assistant**:
   - Use `setup_vapi.js` to define the AI personality.
   - **Structured Data**: Ensure `customerName`, `customerEmail`, and `appointmentTime` are in the schema.
2. **The Tools**:
   - Define `get_available_slots` (connected to `/webhook/vapi`)
   - Define `book_appointment` (connected to `/webhook/vapi`)

---

## 💻 Phase 3: The Server (Cloud Bridge)
1. **Repository**:
   - Use the `server.js` from this project. It handles:
     - Real-time free slot fetching.
     - Booking verification.
     - End-of-call data extraction (fallback regex logic).
2. **Environment Variables**:
   - Every new client gets their own `GHL_ACCESS_TOKEN` and `CALENDAR_ID`.

---

## ☁️ Phase 4: Deployment
1. **GitHub**: Create a private repo for the client.
2. **Render**: 
   - Deploy as a **Web Service**.
   - Input the client's unique `.env` variables.
   - Grab the Live URL and update `SERVER_URL` in Vapi.

---

## 🔨 Phase 5: Claude MCP (Optional Service)
*If you want to give your client a "Command Center" in Claude:*
1. Clone the `ghl-mcp` repo to their local machine.
2. Build it (`npm install && npm run build`).
3. Add the JSON config to their Claude Desktop `mcp_settings.json`.

---

## 📝 Maintenance & Scaling
- **To update the AI script**: Edit `setup_vapi.js` and run it locally.
- **To fix bugs**: Check Render logs first.
- **To add new calendars**: Just update the `CALENDAR_ID` in `server.js` or the `.env`.

**Created by Antigravity AI** 🦾⚖️🎥
