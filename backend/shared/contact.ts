export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 2000,
} as const;
export function validateContact(value: unknown): {
  data?: {
    name: string;
    email: string;
    subject: string;
    message: string;
    company: string;
  };
  error?: string;
} {
  if (!value || typeof value !== "object")
    return { error: "Please provide a message." };
  const source = value as Record<string, unknown>;
  const fields: Record<string, string> = {};
  for (const [key, max] of Object.entries(CONTACT_LIMITS)) {
    if (typeof source[key] !== "string")
      return { error: `${key} is required.` };
    const text = source[key].trim();
    if (!text || text.length > max)
      return { error: `${key} must be between 1 and ${max} characters.` };
    fields[key] = text;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    return { error: "Please enter a valid email." };
  if (fields.message.length < 10)
    return { error: "Message must contain at least 10 characters." };
  if (source.company !== undefined && typeof source.company !== "string")
    return { error: "Invalid form." };
  return {
    data: {
      name: fields.name,
      email: fields.email,
      subject: fields.subject,
      message: fields.message,
      company: (source.company as string | undefined)?.trim() ?? "",
    },
  };
}
