export type ContactStatus = "idle" | "sending" | "success" | "error";

export type ContactFormState = {
    name: string;
    email: string;
    subject: string;
    message: string;
    company: string; // honeypot
};

export type TouchedState = Partial<Record<keyof ContactFormState, boolean>>;

export type ErrorState = Partial<Record<keyof Omit<ContactFormState, "company">, string>>;

export type ContactPayload = {
    name: string;
    email: string;
    subject: string;
    message: string;
    userAgent?: string;
    page?: string;
};

export type ApiErrorResponse = {
    message?: string;
};