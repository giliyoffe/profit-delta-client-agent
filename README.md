# Profit Delta Client Agent

Use this folder as the operating home for client intake, offer drafting, follow-up tracking, and approval-gated client communication.

## What This Agent Does

- Turns intake call notes into a clean client profile.
- Lets the user speak a one-turn message through the browser microphone.
- Routes voice/text messages through a simple orchestrator agent.
- Drafts a client-ready offer from the profile.
- Drafts follow-up emails and next-step messages.
- Saves useful client memory locally in the browser.
- Maintains a simple client pipeline tracker.
- Stops before sensitive actions, especially sending emails, changing prices, or committing client promises.

## Human Approval Gates

The agent must ask for approval before:

- Sending or scheduling any email.
- Sharing pricing, guarantees, timelines, or contractual language.
- Marking a deal as won, lost, paused, or invoiced.
- Adding private client data to any external service.
- Deleting or overwriting client information.

## Basic Workflow

1. Run the local UI.
2. Press **Start Listening** or type a message in the transcript box.
3. Say something like: "I spoke with a client called Wisdom. They want to automate their manual client intake process. They use emails and spreadsheets. The main pain is that information gets lost and follow-up is slow."
4. Review the spoken/written agent response.
5. Ask: "What do we know about Wisdom?"
6. Use the existing intake, offer, email, and tracker screens for approval-gated follow-up.

## Current Architecture

```text
.
├── agents
│   ├── orchestratorAgent.js
│   └── clientIntakeAgent.js
├── services
│   ├── memoryService.js
│   └── speechService.js
├── tools
│   └── clientTools.js
├── app.js
├── index.html
└── styles.css
```

- `orchestratorAgent`: receives user messages and decides whether to answer directly, route to client intake, or search memory.
- `clientIntakeAgent`: extracts simple structured client information from natural language.
- `memoryService`: stores conversation memory, client profiles, summaries, and active context in browser localStorage.
- `clientTools`: safe tool layer for client memory actions.
- `speechService`: browser speech-to-text and text-to-speech helpers.
- `app.js`: connects the existing UI to the agent modules.

## File Map

- `agent-instructions.md`: the dedicated agent behavior.
- `intake-template.md`: what to capture from calls.
- `offer-template.md`: structure for client offers.
- `email-templates.md`: follow-up and approval-gated email drafts.
- `client-tracker.csv`: simple pipeline tracker.
- `handoff-checklist.md`: what to verify before sending anything.

## Local UI

Run a local server from this folder:

```bash
python3 -m http.server 4174
```

Then open:

```text
http://localhost:4174
```

The UI saves drafts and memory locally in the browser. It does not send emails, call paid APIs, or move client data into external tools.

## Install As A Local App

The UI is now a PWA. After opening `http://localhost:4174`, install it from the browser:

- Chrome / Edge: click the install icon in the address bar, or use **Save and share > Install page as app**.
- Safari: use **File > Add to Dock**.

Keep the local server running when using the installed app:

```bash
cd "/Users/giliyoffe/Documents/AI Business automation costume agent/agents/profit-delta-client-agent"
python3 -m http.server 4174
```

The app shell is cached for offline loading, but voice recognition may still depend on browser/OS support.

Mic behavior: the microphone is off unless the status says **Listening**. Press **Stop Listening** or close the app window to stop browser speech recognition.

## MVP Demo Script

1. Click **Start Listening**.
2. Say: "I spoke with a client called Wisdom. They want to automate their manual client intake process. They use emails and spreadsheets. The main pain is that information gets lost and follow-up is slow."
3. The agent should respond out loud and save Wisdom in memory.
4. Click **Start Listening** again.
5. Say: "What do we know about Wisdom?"
6. The agent should retrieve and summarize the saved client memory.

## Implemented

- Push-to-talk browser voice input where supported
- Clear start/stop microphone toggle
- Typed fallback when speech recognition is unavailable
- Browser text-to-speech responses
- Main orchestrator agent
- Client-intake agent
- Local memory service
- Safe client tool layer
- Memory/context panel
- Tool log panel
- Approval-gated offer and email drafts

## Next Recommended Steps

- Add optional OpenAI LLM support behind `OPENAI_API_KEY`
- Add better extraction for more varied call transcripts
- Add export/import for memory
- Add draft email file creation after explicit confirmation
- Add continuous conversation mode
- Add wake-word support only after privacy review
