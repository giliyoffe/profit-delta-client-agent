function findValue(message, patterns) {
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/[.,;:]$/, "");
  }
  return "";
}

function sentenceWith(message, keywords) {
  const sentences = message
    .split(/[.\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return sentences.find((sentence) => keywords.some((keyword) => sentence.toLowerCase().includes(keyword))) || "";
}

function normalizeName(value) {
  return value.trim().replace(/^(is|are|was|were|client|company)\s+/i, "").replace(/[.,;:]$/, "");
}

function extractCompanyDescription(message) {
  const patterns = [
    /(?:they|the company|client|company)\s+(produce|produces|make|makes|manufacture|manufactures|sell|sells|build|builds)\s+([^.,;\n]+)/i,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1] && match?.[2]) {
      return `${match[1].charAt(0).toUpperCase()}${match[1].slice(1).toLowerCase()} ${match[2].trim()}`;
    }
  }
  return sentenceWith(message, ["produce", "produces", "make", "makes", "manufacture", "manufactures", "sell", "sells", "build", "builds"]);
}

function includesAny(message, keywords) {
  const lower = message.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

export function extractClientProfile(message) {
  const companyName = normalizeName(findValue(message, [
    /client name is ([a-z0-9 &'-]+)/i,
    /company name is ([a-z0-9 &'-]+)/i,
    /client is ([a-z0-9 &'-]+)/i,
    /company is ([a-z0-9 &'-]+)/i,
    /client called ([a-z0-9 &'-]+)/i,
    /client named ([a-z0-9 &'-]+)/i,
    /company called ([a-z0-9 &'-]+)/i,
    /company named ([a-z0-9 &'-]+)/i,
    /about ([a-z0-9 &'-]+)/i,
  ]));

  const profile = {
    companyName,
    companyDescription: "",
    location: "",
    companySize: "",
    businessProblem: "",
    manualProcess: "",
    goal: "",
    expectedImpact: "",
    tools: [],
    urgency: "",
    nextRecommendedAction: "",
  };

  profile.companyDescription = extractCompanyDescription(message);
  profile.location = findValue(message, [
    /based in ([a-z '-]+)(?:,|\.| and | size| they|$)/i,
    /in ([a-z '-]+)(?:,|\.| and | size| they|$)/i,
  ]);
  profile.companySize = findValue(message, [
    /size of company[, ]+([0-9,]+ employees?)/i,
    /company size[, ]+([0-9,]+ employees?)/i,
    /([0-9,]+ employees?)/i,
    /team of ([0-9,]+)/i,
  ]);

  if (includesAny(message, ["manual", "spreadsheet", "email", "intake"])) {
    profile.manualProcess = sentenceWith(message, ["manual", "spreadsheet", "email", "intake"]) || "Manual client intake and follow-up";
  }

  if (includesAny(message, ["lost", "slow", "pain", "problem"])) {
    profile.businessProblem = sentenceWith(message, ["lost", "slow", "pain", "problem"]) || "Information gets lost and follow-up is slow";
  }

  if (includesAny(message, ["automate", "automation"])) {
    profile.goal = sentenceWith(message, ["automate", "automation"]) || "Automate client intake and follow-up tracking";
  }

  if (includesAny(message, ["email", "gmail"])) profile.tools.push("email");
  if (includesAny(message, ["spreadsheet", "spreadsheets", "sheet"])) profile.tools.push("spreadsheets");
  if (includesAny(message, ["crm", "hubspot"])) profile.tools.push("CRM");

  profile.expectedImpact = includesAny(message, ["lost", "slow"])
    ? "Reduce lost information and improve response speed"
    : "";
  profile.nextRecommendedAction = profile.manualProcess || profile.goal
    ? "Map the current workflow and define a small POC around the clearest manual handoff."
    : "Clarify the current workflow, pain point, and desired outcome before drafting an offer.";

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
  const details = [
    profile.companyDescription ? `What they do: ${profile.companyDescription}.` : "",
    profile.location ? `Location: ${profile.location}.` : "",
    profile.companySize ? `Company size: ${profile.companySize}.` : "",
  ].filter(Boolean);
  const opportunity = profile.goal || profile.manualProcess || "their current workflow";
  return [
    `Got it. I saved ${profile.companyName || "this client"} as a client.`,
    ...details,
    `Main opportunity: ${opportunity}.`,
    `Suggested next step: ${profile.nextRecommendedAction}`,
  ].join("\n");
}
