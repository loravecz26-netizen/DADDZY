import type { CrmAdapter, Contact, Note, Task, Activity } from "@/lib/crm/types";

// TODO(drift): implement Orion Connect API adapter
export class OrionAdapter implements CrmAdapter {
  constructor(private readonly advisorId: string) {}

  async getContact(_crmContactId: string): Promise<Contact> {
    throw new Error("OrionAdapter.getContact not implemented");
  }

  async listContacts(): Promise<Contact[]> {
    throw new Error("OrionAdapter.listContacts not implemented");
  }

  async getNotes(_crmContactId: string): Promise<Note[]> {
    throw new Error("OrionAdapter.getNotes not implemented");
  }

  async getTasks(_crmContactId: string): Promise<Task[]> {
    throw new Error("OrionAdapter.getTasks not implemented");
  }

  async getActivities(_crmContactId: string): Promise<Activity[]> {
    throw new Error("OrionAdapter.getActivities not implemented");
  }

  async createNote(_crmContactId: string, _body: string): Promise<Note> {
    throw new Error("OrionAdapter.createNote not implemented");
  }
}
