import { routeMessage } from "./agents/orchestratorAgent.js";
import { clearMemory, getCurrentContext } from "./services/memoryService.js";
import { createSpeechRecognizer, speakText } from "./services/speechService.js";

const fields = {
  clientName: document.querySelector("#clientName"),
  company: document.querySelector("#company"),
  email: document.querySelector("#email"),
  status: document.querySelector("#status"),
  callNotes: document.querySelector("#callNotes"),
  solution: document.querySelector("#solution"),
  timeline: document.querySelector("#timeline"),
  price: document.querySelector("#price"),
  deliverables: document.querySelector("#deliverables"),
  emailType: document.querySelector("#emailType"),
  nextStep: document.querySelector("#nextStep"),
  emailNotes: document.querySelector("#emailNotes"),
  approvalStatus: document.querySelector("#approvalStatus"),
};

const outputs = {
  intake: document.querySelector("#intakeOutput"),
  offer: document.querySelector("#offerOutput"),
  email: document.querySelector("#emailOutput"),
};

const agentUI = {
  status: document.querySelector("#agentStatus"),
  voiceButton: document.querySelector("#voiceButton"),
  transcript: document.querySelector("#voiceTranscript"),
  response: document.querySelector("#agentResponse"),
  memory: document.querySelector("#memoryContext"),
  toolLog: document.querySelector("#toolLog"),
  sendTyped: document.querySelector("#sendTypedMessage"),
  speakLast: document.querySelector("#speakLastResponse"),
  clearMemory: document.querySelector("#clearAgentMemory"),
};

const storageKey = "profit-delta-client-agent-v1";
let tracker = [];

const starterSummary = `Client Snapshot

Paste call notes, fill in any known fields, then run intake.

The agent will keep unknowns as missing information instead of inventing details.`;

outputs.intake.textContent = starterSummary;
outputs.offer.textContent = "Draft offer will appear here.";
outputs.email.textContent = "Draft email will appear here.";
agentUI.response.textContent = "Say something like: I spoke with a client called Wisdom...";
agentUI.toolLog.textContent = "No tools called yet.";

function getState() {
  return {
    clientName: fields.clientName.value.trim(),
    company: fields.company.value.trim(),
    email: fields.email.value.trim(),
    status: fields.status.value,
    callNotes: fields.callNotes.value.trim(),
    solution: fields.solution.value.trim(),
    timeline: fields.timeline.value.trim(),
    price: fields.price.value.trim(),
    deliverables: fields.deliverables.value.trim(),
    emailType: fields.emailType.value,
    nextStep: fields.nextStep.value.trim(),
    emailNotes: fields.emailNotes.value.trim(),
    approvalStatus: fields.approvalStatus.value,
    intakeOutput: outputs.intake.textContent,
    offerOutput: outputs.offer.textContent,
    emailOutput: outputs.email.textContent,
    tracker,
  };
}

function setState(state) {
  Object.keys(fields).forEach((key) => {
    if (state[key] !== undefined) fields[key].value = state[key];
  });
  outputs.intake.textContent = state.intakeOutput || starterSummary;
  outputs.offer.textContent = state.offerOutput || "Draft offer will appear here.";
  outputs.email.textContent = state.emailOutput || "Draft email will appear here.";
  tracker = Array.isArray(state.tracker) ? state.tracker : [];
  renderTracker();
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(getState()));
  showToast("Saved locally");
}

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    setState(JSON.parse(raw));
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function setAgentStatus(status) {
  agentUI.status.textContent = status;
}

function renderMemoryContext(context = getCurrentContext()) {
  const clients = context.clients.length
    ? context.clients
        .map((client) => {
          const tools = client.tools?.length ? `Tools: ${client.tools.join(", ")}` : "Tools: unknown";
          return `${client.companyName}\nGoal: ${client.goal || "unknown"}\n${tools}`;
        })
        .join("\n\n")
    : "No saved clients yet.";

  agentUI.memory.textContent = `Active client: ${context.activeClient || "none"}
Current task: ${context.currentTask || "none"}

Known clients:
${clients}`;
}

function lines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findSignals(notes, keywords) {
  const rows = notes
    .split(/[.\n]/)
    .map((row) => row.trim())
    .filter(Boolean);
  return rows.filter((row) => keywords.some((word) => row.toLowerCase().includes(word))).slice(0, 4);
}

function fallback(value, placeholder) {
  return value && value.trim() ? value.trim() : placeholder;
}

function runIntake() {
  const state = getState();
  const notes = state.callNotes || "";
  const pain = findSignals(notes, ["problem", "pain", "manual", "slow", "issue", "stuck", "waste"]);
  const outcome = findSignals(notes, ["goal", "want", "need", "outcome", "success", "improve", "reduce"]);
  const tools = findSignals(notes, ["crm", "sheet", "spreadsheet", "gmail", "email", "zapier", "make", "n8n", "hubspot"]);
  const risks = findSignals(notes, ["privacy", "risk", "legal", "contract", "access", "security"]);

  outputs.intake.textContent = `Client Snapshot

Client: ${fallback(state.clientName, "[CLIENT NAME MISSING]")}
Company: ${fallback(state.company, "[COMPANY MISSING]")}
Email: ${fallback(state.email, "[EMAIL MISSING]")}
Status: ${state.status}

Business Problem
${pain.length ? pain.map((item) => `- ${item}`).join("\n") : "- [Needs confirmation from call notes]"}

Desired Outcome
${outcome.length ? outcome.map((item) => `- ${item}`).join("\n") : "- [Needs confirmation from client]"}

Current Workflow / Tools
${tools.length ? tools.map((item) => `- ${item}`).join("\n") : "- [Tools not captured yet]"}

Automation Opportunity
- Use the intake notes to identify repeatable handoffs, client follow-up steps, and proposal drafting.
- Keep email sending and pricing behind approval.

Risks / Dependencies
${risks.length ? risks.map((item) => `- ${item}`).join("\n") : "- [No specific risk captured yet]"}

Missing Information
${[
    state.clientName ? "" : "- Client name",
    state.company ? "" : "- Company",
    state.email ? "" : "- Email",
    state.solution ? "" : "- Proposed solution",
    state.timeline ? "" : "- Approved timeline",
    state.price ? "" : "- Approved price",
  ]
    .filter(Boolean)
    .join("\n") || "- None obvious from current form"}

Suggested Next Step
- Draft an offer for review, then prepare a short follow-up email.

Approval needed: should this be sent as-is, edited first, or held?`;

  fields.status.value = "Intake complete";
  saveState();
}

function draftOffer() {
  const state = getState();
  const deliverables = lines(state.deliverables);
  const deliverableText = deliverables.length
    ? deliverables.map((item) => `- ${item}`).join("\n")
    : "- [DELIVERABLE 1]\n- [DELIVERABLE 2]\n- [DELIVERABLE 3]";

  outputs.offer.textContent = `Proposal for ${fallback(state.company, "[COMPANY]")}

Summary
Based on our conversation, the main opportunity is to help ${fallback(state.company, "[COMPANY]")} improve ${fallback(state.solution, "[PROCESS / BOTTLENECK]")}.

Proposed Solution
Profit Delta will build ${fallback(state.solution, "[SOLUTION TO APPROVE]")} that helps with:

${deliverableText}

Scope
Included:
${deliverableText}

Not included unless approved separately:
- New external integrations not listed above
- Sending client emails without approval
- Pricing, legal, or contractual changes outside this proposal

Timeline
Estimated timeline: ${fallback(state.timeline, "[TIMELINE TO APPROVE]")}

Investment
Price: ${fallback(state.price, "[PRICE TO APPROVE]")}

Client Responsibilities
- Provide access to the required tools, data, and examples
- Review drafts and approve key decisions
- Confirm final requirements before build starts

Assumptions
- The current scope is based on available intake information
- Any missing access, data, or decision-maker feedback may affect timing

Next Step
Review this draft and confirm what should be edited, approved, or held.

Approval needed: should this be sent as-is, edited first, or held?`;

  fields.status.value = "Offer drafted";
  saveState();
}

function draftEmail() {
  const state = getState();
  const client = fallback(state.clientName, "[CLIENT NAME]");
  const company = fallback(state.company, "[COMPANY]");
  const solution = fallback(state.solution, "[MAIN OUTCOME]");
  let draft = "";

  if (state.emailType === "post-intake") {
    draft = `Draft: Post-intake follow-up

Subject: Next steps from our call

Hi ${client},

Thanks for the conversation. I understood the main opportunity as helping ${company} with ${solution}.

The next step on my side is to turn this into a clear offer with scope, timeline, and investment. I will send that over for review once it is ready.

Best,
Gili`;
  }

  if (state.emailType === "offer") {
    draft = `Draft: Offer send

Subject: Proposal for ${company}

Hi ${client},

I put together the proposal based on our conversation.

The focus is ${solution}, with the goal of helping ${company} move forward with a clearer and more automated workflow.

Please review the offer and let me know what you would like to adjust. If it looks good, we can confirm the next step and timeline.

Best,
Gili`;
  }

  if (state.emailType === "follow-up") {
    draft = `Draft: Follow-up after no reply

Subject: Quick follow-up

Hi ${client},

Just following up on the proposal for ${company}.

Is this still something you want to move forward with, or would it be better to adjust the scope?

Best,
Gili`;
  }

  outputs.email.textContent = `${draft}

Next step: ${fallback(state.nextStep, "[NEXT STEP TO APPROVE]")}
Extra notes: ${fallback(state.emailNotes, "[NO EXTRA NOTES]")}

Approval needed: should this be sent as-is, edited first, or held?`;

  saveState();
}

async function copyText(source) {
  await navigator.clipboard.writeText(source.textContent);
  showToast("Copied");
}

function addToTracker() {
  const state = getState();
  tracker.unshift({
    client: fallback(state.clientName, "[Client missing]"),
    company: fallback(state.company, "[Company missing]"),
    status: state.status,
    lastContact: new Date().toISOString().slice(0, 10),
    nextAction: fallback(state.nextStep, "Review next step"),
    approval: state.approvalStatus,
  });
  renderTracker();
  saveState();
}

function applyAgentProfile(profile) {
  if (!profile) return;
  if (profile.companyName) {
    fields.clientName.value = profile.companyName;
    fields.company.value = profile.companyName;
  }
  if (profile.manualProcess || profile.businessProblem || profile.goal) {
    fields.callNotes.value = [
      profile.businessProblem ? `Problem: ${profile.businessProblem}` : "",
      profile.manualProcess ? `Manual process: ${profile.manualProcess}` : "",
      profile.goal ? `Goal: ${profile.goal}` : "",
      profile.tools?.length ? `Tools: ${profile.tools.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (profile.goal) fields.solution.value = profile.goal;
  if (profile.nextRecommendedAction) fields.nextStep.value = profile.nextRecommendedAction;
  fields.status.value = "Intake complete";
  runIntake();
}

async function handleAgentMessage(message) {
  if (!message.trim()) {
    showToast("Add a message first");
    return;
  }

  setAgentStatus("Thinking");
  agentUI.toolLog.textContent = "Routing...";
  const result = await routeMessage(message.trim());
  agentUI.response.textContent = result.reply;
  agentUI.toolLog.textContent = result.toolLog.join("\n");
  renderMemoryContext(result.context);
  applyAgentProfile(result.profile);
  saveState();
  setAgentStatus("Speaking");
  speakText(result.reply);
  window.setTimeout(() => setAgentStatus("Idle"), 1200);
}

let recognizer = null;

function setupVoice() {
  recognizer = createSpeechRecognizer({
    onStart: () => setAgentStatus("Listening"),
    onResult: (transcript) => {
      agentUI.transcript.value = transcript;
      handleAgentMessage(transcript);
    },
    onEnd: () => {
      if (agentUI.status.textContent === "Listening") setAgentStatus("Idle");
    },
    onError: (error) => {
      setAgentStatus("Voice unavailable");
      showToast(String(error));
    },
  });

  if (!recognizer) {
    agentUI.voiceButton.disabled = true;
    agentUI.voiceButton.textContent = "Mic Unsupported";
    setAgentStatus("Type fallback");
  }
}

function renderTracker() {
  const body = document.querySelector("#trackerRows");
  body.innerHTML = "";
  if (!tracker.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">No clients added yet.</td>`;
    body.appendChild(row);
    return;
  }
  tracker.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.client)}</td>
      <td>${escapeHtml(item.company)}</td>
      <td>${escapeHtml(item.status)}</td>
      <td>${escapeHtml(item.lastContact)}</td>
      <td>${escapeHtml(item.nextAction)}</td>
      <td>${escapeHtml(item.approval)}</td>
    `;
    body.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}View`).classList.add("active");
    document.querySelector("#viewTitle").textContent = button.textContent;
  });
});

document.querySelector("#runIntake").addEventListener("click", runIntake);
document.querySelector("#draftOffer").addEventListener("click", draftOffer);
document.querySelector("#draftEmail").addEventListener("click", draftEmail);
document.querySelector("#addToTracker").addEventListener("click", addToTracker);
document.querySelector("#copySummary").addEventListener("click", () => copyText(outputs.intake));
document.querySelector("#copyOffer").addEventListener("click", () => copyText(outputs.offer));
document.querySelector("#copyEmail").addEventListener("click", () => copyText(outputs.email));
document.querySelector("#saveClient").addEventListener("click", saveState);
document.querySelector("#resetWorkspace").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  window.location.reload();
});
agentUI.sendTyped.addEventListener("click", () => handleAgentMessage(agentUI.transcript.value));
agentUI.voiceButton.addEventListener("click", () => recognizer?.start());
agentUI.speakLast.addEventListener("click", () => speakText(agentUI.response.textContent));
agentUI.clearMemory.addEventListener("click", () => {
  clearMemory();
  renderMemoryContext();
  showToast("Memory cleared");
});

Object.values(fields).forEach((field) => {
  field.addEventListener("change", saveState);
});

loadState();
setupVoice();
renderMemoryContext();
