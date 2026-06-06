import {
  getCurrentContext,
  saveMemory,
  summarizeConversation,
} from "../services/memoryService.js";
import {
  extractClientProfile,
  formatClientSummary,
  shouldHandleClientIntake,
} from "./clientIntakeAgent.js";
import { saveClientProfile, searchClientMemory } from "../tools/clientTools.js";

function extractLookupName(message) {
  const match = message.match(/what do we know about ([a-z0-9 &'-]+)/i);
  return match?.[1]?.trim().replace(/[?.,;:]$/, "") || "";
}

function describeClient(client) {
  return [
    `${client.companyName}:`,
    client.companyDescription ? `What they do: ${client.companyDescription}` : "",
    client.location ? `Location: ${client.location}` : "",
    client.companySize ? `Company size: ${client.companySize}` : "",
    client.businessProblem ? `Problem: ${client.businessProblem}` : "",
    client.manualProcess ? `Current process: ${client.manualProcess}` : "",
    client.goal ? `Goal: ${client.goal}` : "",
    client.tools?.length ? `Tools: ${client.tools.join(", ")}` : "",
    client.nextRecommendedAction ? `Next action: ${client.nextRecommendedAction}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function routeMessage(message) {
  const toolLog = [];
  const lower = message.toLowerCase();

  if (lower.includes("what do we know about")) {
    const clientName = extractLookupName(message);
    toolLog.push(`memoryAgent.searchMemory("${clientName}")`);
    const results = searchClientMemory(clientName);
    const reply = results.clients.length
      ? describeClient(results.clients[0])
      : `I do not have saved client memory for ${clientName || "that client"} yet.`;
    saveMemory({ role: "user", message });
    saveMemory({ role: "agent", message: reply });
    summarizeConversation(message, reply);
    return { reply, toolLog, context: getCurrentContext() };
  }

  if (shouldHandleClientIntake(message)) {
    toolLog.push("orchestrator.route(clientIntakeAgent)");
    const profile = extractClientProfile(message);
    toolLog.push("clientTools.saveClientProfile()");
    saveClientProfile(profile);
    const reply = formatClientSummary(profile);
    saveMemory({ role: "user", message });
    saveMemory({ role: "agent", message: reply });
    summarizeConversation(message, reply);
    return { reply, toolLog, context: getCurrentContext(), profile };
  }

  const reply =
    "I can help with client intake, client memory lookup, offer prep, and safe next actions. Tell me about a client or ask what we know about one.";
  toolLog.push("orchestrator.answerDirectly()");
  saveMemory({ role: "user", message });
  saveMemory({ role: "agent", message: reply });
  summarizeConversation(message, reply);
  return { reply, toolLog, context: getCurrentContext() };
}
