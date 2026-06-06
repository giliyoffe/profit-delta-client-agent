const memoryKey = "profit-delta-agent-memory-v1";

function readStore() {
  const fallback = {
    conversations: [],
    clients: {},
    preferences: [],
    summaries: [],
    currentContext: {
      activeClient: "",
      currentTask: "",
    },
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(memoryKey) || "{}") };
  } catch {
    return fallback;
  }
}

function writeStore(store) {
  localStorage.setItem(memoryKey, JSON.stringify(store));
}

export function saveMemory(entry) {
  const store = readStore();
  store.conversations.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  });
  store.conversations = store.conversations.slice(0, 30);
  writeStore(store);
  return store;
}

export function searchMemory(query) {
  const store = readStore();
  const normalized = query.toLowerCase();
  const clients = Object.values(store.clients).filter((client) =>
    JSON.stringify(client).toLowerCase().includes(normalized)
  );
  const conversations = store.conversations.filter((entry) =>
    JSON.stringify(entry).toLowerCase().includes(normalized)
  );
  return { clients, conversations };
}

export function getCurrentContext() {
  const store = readStore();
  return {
    activeClient: store.currentContext.activeClient || "",
    currentTask: store.currentContext.currentTask || "",
    recentMessages: store.conversations.slice(0, 6),
    clients: Object.values(store.clients),
    summaries: store.summaries.slice(0, 6),
  };
}

export function updateClientProfile(profile) {
  const store = readStore();
  const clientName = profile.companyName || profile.clientName;
  if (!clientName) return store;

  const key = clientName.toLowerCase();
  const existing = store.clients[key] || {};
  store.clients[key] = {
    ...existing,
    ...profile,
    companyName: clientName,
    updatedAt: new Date().toISOString(),
  };
  store.currentContext.activeClient = clientName;
  store.currentContext.currentTask = "client-intake";
  writeStore(store);
  return store;
}

export function summarizeConversation(userMessage, agentReply) {
  const store = readStore();
  const summary = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    text: `User asked: ${userMessage.slice(0, 180)} | Agent replied: ${agentReply.slice(0, 180)}`,
  };
  store.summaries.unshift(summary);
  store.summaries = store.summaries.slice(0, 20);
  writeStore(store);
  return summary;
}

export function clearMemory() {
  localStorage.removeItem(memoryKey);
}

