# How to Enable the VAPI MCP Server

To let me (Antigravity) directly control your VAPI account (create assistants, buy numbers, etc.) without you running scripts, you need to add the VAPI MCP server to your configuration.

## 1. Locate your MCP Config File

If you are using **Claude Desktop**, the config file is located at:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

## 2. Add the VAPI Configuration

Open that file and add the `vapi-mcp-server` entry to the `mcpServers` object. 

**Make sure to replace `<your_vapi_token>` with your actual VAPI Private API Key.**

```json
{
  "mcpServers": {
    "vapi-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@vapi-ai/mcp-server"
      ],
      "env": {
        "VAPI_TOKEN": "your_vapi_private_key_starts_with_sk_..."
      }
    }
  }
}
```

## 3. Restart

After saving the file:
1.  **Restart Claude Desktop** (or your IDE).
2.  Start a new chat with me.
3.  I will then have access to tools like `vapi_create_assistant` and `vapi_list_assistants`!

## What Happens Next?

Once the MCP is active, I can:
1.  **Create the Assistant** for you directly (no `node setup_vapi.js` needed).
2.  **Update the Assistant** with your server URL instantly.
3.  **Debug** issues by reading VAPI logs directly.

*Note: You will still need to run `node server.js` locally to receive the call summaries and forward them to GoHighLevel.*
