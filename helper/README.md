# Local Desktop Helper

This helper runs outside the Codex sandbox so Codex can ask it to do project logistics, starting with `git push`.

## Start

Double-click:

```text
helper/start-helper.command
```

Or run:

```bash
cd "/Users/giliyoffe/Documents/AI Business automation costume agent/agents/profit-delta-client-agent"
node helper/local-helper.mjs
```

Keep that terminal window open while working with Codex.

## Endpoints

```text
GET  http://127.0.0.1:17874/health
GET  http://127.0.0.1:17874/git/status
POST http://127.0.0.1:17874/git/push
```

## Safety

- Binds only to `127.0.0.1`.
- Runs only inside this project folder.
- Currently supports status and push only.
- Does not delete files, rewrite history, or send emails.

