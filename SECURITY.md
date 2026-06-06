# Security And Privacy

## Stored Locally

This MVP stores the following in browser localStorage:

- Recent voice/text conversation entries
- Saved client profile summaries
- Current active client/task context
- Existing UI draft state

Use the **Clear Memory** button in the UI to remove agent memory. Use **Reset** to clear the UI draft state.

## Sent To External Services

This MVP does not call a paid LLM API and does not send client data to OpenAI or another external service. Speech recognition and text-to-speech use the browser's built-in Web Speech APIs, whose behavior depends on the browser/OS.

## Confirmation Rules

The MVP does not send emails, submit tickets, delete files, or control external apps. Anything outside local memory and drafts should require explicit user confirmation before being added later.

## Voice Recording

Voice input only starts when the user presses **Start Listening**. While active, the button changes to **Stop Listening** and the status says **Listening**. Press **Stop Listening**, close the tab/app, or revoke the browser microphone permission to stop it.

There is no wake word or always-listening mode in this MVP.
