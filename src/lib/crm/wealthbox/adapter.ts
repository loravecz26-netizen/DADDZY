import { db } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import type { CrmAdapter, Contact, Note, Task, Activity } from "@/lib/crm/types";
import { ContactSchema, NoteSchema, TaskSchema, ActivitySchema } from "@/lib/crm/types";

const BASE_URL = "https://api.crmworkspace.com/v1";
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  advisorId: string
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - start;
      console.info("[crm/wealthbox]", {
        vendor: "wealthbox",
        endpoint: url,
        advisorId,
        latencyMs,
        status: res.status,
      });

      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`Wealthbox ${res.status}`);
        await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
    }
  }

  throw lastError ?? new Error("Wealthbox fetch failed");
}

async function getAccessToken(advisorId: string): Promise<string> {
  const token = await db.crmToken.findUnique({
    where: { advisorId_vendor: { advisorId, vendor: "wealthbox" } },
  });
  if (!token) throw new Error("No Wealthbox token for advisor");
  return decrypt(token.accessTokenEnc);
}

function makeHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export class WealthboxAdapter implements CrmAdapter {
  constructor(private readonly advisorId: string) {}

  async getContact(crmContactId: string): Promise<Contact> {
    const token = await getAccessToken(this.advisorId);
    const res = await fetchWithRetry(
      `${BASE_URL}/contacts/${crmContactId}`,
      { headers: makeHeaders(token) },
      this.advisorId
    );
    const data: unknown = await res.json();
    return ContactSchema.parse(data);
  }

  async listContacts(): Promise<Contact[]> {
    const token = await getAccessToken(this.advisorId);
    const res = await fetchWithRetry(
      `${BASE_URL}/contacts`,
      { headers: makeHeaders(token) },
      this.advisorId
    );
    const data: unknown = await res.json();
    return ContactSchema.array().parse(data);
  }

  async getNotes(crmContactId: string): Promise<Note[]> {
    const token = await getAccessToken(this.advisorId);
    const res = await fetchWithRetry(
      `${BASE_URL}/contacts/${crmContactId}/notes`,
      { headers: makeHeaders(token) },
      this.advisorId
    );
    const data: unknown = await res.json();
    return NoteSchema.array().parse(data);
  }

  async getTasks(crmContactId: string): Promise<Task[]> {
    const token = await getAccessToken(this.advisorId);
    const res = await fetchWithRetry(
      `${BASE_URL}/contacts/${crmContactId}/tasks`,
      { headers: makeHeaders(token) },
      this.advisorId
    );
    const data: unknown = await res.json();
    return TaskSchema.array().parse(data);
  }

  async getActivities(crmContactId: string): Promise<Activity[]> {
    const token = await getAccessToken(this.advisorId);
    const res = await fetchWithRetry(
      `${BASE_URL}/contacts/${crmContactId}/activities`,
      { headers: makeHeaders(token) },
      this.advisorId
    );
    const data: unknown = await res.json();
    return ActivitySchema.array().parse(data);
  }

  async createNote(crmContactId: string, body: string): Promise<Note> {
    const token = await getAccessToken(this.advisorId);
    const res = await fetchWithRetry(
      `${BASE_URL}/contacts/${crmContactId}/notes`,
      {
        method: "POST",
        headers: makeHeaders(token),
        body: JSON.stringify({ body }),
      },
      this.advisorId
    );
    const data: unknown = await res.json();
    return NoteSchema.parse(data);
  }
}
