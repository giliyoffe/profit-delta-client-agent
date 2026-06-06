function findValue(message, patterns) {
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/[.,;:]$/, "");
  }
  return "";
}

function includesAny(message, keywords) {
  const lower = message.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

export function extractClientProfile(message) {
  const companyName = findValue(message, [
    /client called ([a-z0-9 &'-]+)/i,
    /client named ([a-z0-9 &'-]+)/i,
    /company called ([a-z0-9 &'-]+)/i,
    /company named ([a-z0-9 &'-]+)/i,
    /about ([a-z0-9 &'-]+)/i,
  ]);

  const profile = {
    companyName,
    businessProblem: "",
    manualProcess: "",
    goal: "",
    expectedImpact: "",
    tools: [],
    urgency: "",
    nextRecommendedAction: "",
  };

  if (includesAny(message, ["manual", "spreadsheet", "email", "intake"])) {
    profile.manualProcess = "Manual client intake and follow-up";
  }

  if (includesAny(message, ["lost", "slow", "pain", "problem"])) {
    profile.businessProblem = "Information gets lost and follow-up is slow";
  }

  if (includesAny(message, ["automate", "automation"])) {
    profile.goal = "Automate client intake and follow-up tracking";
  }

  if (includesAny(message, ["email", "gmail"])) profile.tools.push("email");
  if (includesAny(message, ["spreadsheet", "spreadsheets", "sheet"])) profile.tools.push("spreadsheets");
  if (includesAny(message, ["crm", "hubspot"])) profile.tools.push("CRM");

  profile.expectedImpact = "Reduce lost information and improve response speed";
  profile.nextRecommendedAction =
    "Map the current intake flow and define a small POC that captures incoming requests, extracts key fields, and creates follow-up tasks.";

  return profile;
}

export function shouldHandleClientIntake(message) {
  return includesAny(message, [
    "client",
    "company",
    "intake",
    "manual process",
    "spreadsheets",
    "follow-up",
    "follow up",
    "what do we know",
  ]);
}

export function formatClientSummary(profile) {
  const opportunity = profile.goal || "client intake and follow-up tracking";
  return `Got it. I saved ${profile.companyName || "this client"} as a client. The main automation opportunity is to ${
    opportunity.charAt(0).toLowerCase() + opportunity.slice(1)
  }. Suggested next step: ${profile.nextRecommendedAction}`;
}
