# Profit Delta Client Agent

Use this folder as the operating home for client intake, offer drafting, follow-up tracking, and approval-gated client communication.

## What This Agent Does

- Turns intake call notes into a clean client profile.
- Drafts a client-ready offer from the profile.
- Drafts follow-up emails and next-step messages.
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

1. Paste call notes or transcript into this chat.
2. Ask: "Run Profit Delta intake."
3. Review the generated client profile.
4. Ask: "Draft the offer."
5. Approve, edit, or reject the offer.
6. Ask: "Draft the follow-up email."
7. Approve before sending it yourself or connecting an email tool later.

## File Map

- `agent-instructions.md`: the dedicated agent behavior.
- `intake-template.md`: what to capture from calls.
- `offer-template.md`: structure for client offers.
- `email-templates.md`: follow-up and approval-gated email drafts.
- `client-tracker.csv`: simple pipeline tracker.
- `handoff-checklist.md`: what to verify before sending anything.

## Local UI

Open `index.html` in a browser, or run a local server from this folder:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

The UI saves drafts locally in the browser. It does not send emails, call paid APIs, or move client data into external tools.
