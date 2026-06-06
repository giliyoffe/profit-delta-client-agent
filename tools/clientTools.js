import { searchMemory, updateClientProfile } from "../services/memoryService.js";

export function saveClientProfile(profile) {
  return updateClientProfile(profile);
}

export function searchClientMemory(clientName) {
  return searchMemory(clientName);
}

