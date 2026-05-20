import type { CrmAdapter, Contact, Note, Task, Activity } from "@/lib/crm/types";

// TODO(drift): implement Redtail REST API adapter
// Docs: https://rdtailcrm.com/api/
export class RedtailAdapter implements CrmAdapter {
  constructor(private readonly advisorId: string) {}

  async getContact(_crmContactId: string): Promise<Contact> {
    throw new Error("RedtailAdapter.getContact not implemented");
  }

  async listContacts(): Promise<Contact[]> {
    throw new Error("RedtailAdapter.listContacts not implemented");
  }

  async getNotes(_crmContactId: string): Promise<Note[]> {
    throw new Error("RedtailAdapter.getNotes not implemented");
  }

  async getTasks(_crmContactId: string): Promise<Task[]> {
    throw new Error("RedtailAdapter.getTasks not implemented");
  }

  async getActivities(_crmContactId: string): Promise<Activity[]> {
    throw new Error("RedtailAdapter.getActivities not implemented");
  }

  async createNote(_crmContactId: string, _body: string): Promise<Note> {
    throw new Error("RedtailAdapter.createNote not implemented");
  }
}
