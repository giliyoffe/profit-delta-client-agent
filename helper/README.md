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

On first start, the helper creates a local `.helper-token` file. This is ignored by Git.
Share the token with Codex only when you want Codex to call the helper from this thread.

## Endpoints

```text
GET  http://127.0.0.1:17874/health
GET  http://127.0.0.1:17874/git/status
POST http://127.0.0.1:17874/git/push
```

Requests other than `/health` require:

```text
X-Profit-Delta-Helper-Token: <contents of .helper-token>
```

## File Queue

If Codex cannot connect to `127.0.0.1`, it can write request files here:

```text
.helper-requests/
```

Example request:

```json
{
  "id": "push-2026-06-07T09-20-00Z",
  "action": "git-push",
  "createdAt": "2026-06-07T09:20:00Z"
}
```

The helper renames it while processing, then writes either:

```text
.helper-results/*.done.json
.helper-results/*.failed.json
```

## Safety

- Binds only to `127.0.0.1`.
- Runs only inside this project folder.
- Requires a local token for actions.
- Also supports a local file queue for sandboxed Codex runs.
- Currently supports status and push only.
- Does not delete files, rewrite history, or send emails.
