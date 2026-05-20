import { z } from "zod";

export const ContactSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firmId: z.string().optional(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const NoteSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  body: z.string(),
  createdAt: z.coerce.date(),
  authorName: z.string().optional(),
});
export type Note = z.infer<typeof NoteSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  title: z.string(),
  dueAt: z.coerce.date().optional(),
  status: z.discriminatedUnion("type", [
    z.object({ type: z.literal("open") }),
    z.object({ type: z.literal("completed"), completedAt: z.coerce.date() }),
    z.object({ type: z.literal("cancelled") }),
  ]),
});
export type Task = z.infer<typeof TaskSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  contactId: z.string(),
  kind: z.enum(["note", "task", "call", "email"]),
  summary: z.string(),
  occurredAt: z.coerce.date(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export interface CrmAdapter {
  getContact(crmContactId: string): Promise<Contact>;
  listContacts(): Promise<Contact[]>;
  getNotes(crmContactId: string): Promise<Note[]>;
  getTasks(crmContactId: string): Promise<Task[]>;
  getActivities(crmContactId: string): Promise<Activity[]>;
  createNote(crmContactId: string, body: string): Promise<Note>;
}
