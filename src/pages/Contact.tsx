import { useMemo, useState } from "react";
import "../styles/Contact.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";

type ContactStatus = "idle" | "sending" | "success" | "error";

type ContactFormState = {
    name: string;
    email: string;
    subject: string;
    message: string;
    company: string; // honeypot
};

type TouchedState = Partial<Record<keyof ContactFormState, boolean>>;

type ErrorState = Partial<Record<keyof Omit<ContactFormState, "company">, string>>;

type ContactPayload = {
    name: string;
    email: string;
    subject: string;
    message: string;
    userAgent?: string;
    page?: string;
};

type ApiErrorResponse = {
    message?: string;
};

const INITIAL: ContactFormState = {
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
};

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function Contact() {
    const [form, setForm] = useState<ContactFormState>(INITIAL);
    const [touched, setTouched] = useState<TouchedState>({});
    const [status, setStatus] = useState<ContactStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const errors: ErrorState = useMemo(() => {
        const e: ErrorState = {};

        if (!form.name.trim()) e.name = "Please enter your name.";
        if (!form.email.trim()) e.email = "Please enter your email.";
        else if (!isValidEmail(form.email)) e.email = "Please enter a valid email.";
        if (!form.subject.trim()) e.subject = "Please add a subject.";
        if (!form.message.trim()) e.message = "Please enter a message.";
        else if (form.message.trim().length < 10) e.message = "Message is too short (min 10 chars).";

        return e;
    }, [form]);

    const canSubmit = Object.keys(errors).length === 0 && status !== "sending";

    function onChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void {
        const { name, value } = e.target;

        // Only allow keys that exist in our form state
        if (!(name in form)) return;

        setForm((p) => ({
            ...p,
            [name]: value,
        }));
    }

    function onBlur(
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void {
        const { name } = e.target;

        if (!(name in form)) return;

        setTouched((p) => ({
            ...p,
            [name]: true,
        }));
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        setTouched({
            name: true,
            email: true,
            subject: true,
            message: true,
        });

        // Honeypot filled then it's a bot
        if (form.company.trim()) {
            // Pretend success to avoid tipping off bots
            setStatus("success");
            setErrorMsg("");
            setForm(INITIAL);
            setTouched({});
            return;
        }

        if (!canSubmit) return;

        setStatus("sending");
        setErrorMsg("");

        const payload: ContactPayload = {
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
            userAgent: navigator.userAgent,
            page: window.location.href,
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            let data: ApiErrorResponse = {};
            try {
                data = (await res.json()) as ApiErrorResponse;
            } catch {
                // Ignore if server returns no JSON
            }

            if (!res.ok) {
                throw new Error(data?.message || "Something went wrong. Please try again.");
            }
            setStatus("success");
            setForm(INITIAL);
            setTouched({});
        } catch (err: unknown) {
            setStatus("error");
            const message =
                err instanceof Error ? err.message : "Failed to send. Please try again.";
            setErrorMsg(message);
        }
    }

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="contact-page">
                <header className="contact-hero">
                    <h1 className="contact-title">Contact Me</h1>
                    <p className="contact-subtitle">
                        Shoot me a message!
                    </p>
                </header>
                <section className="contact-card" aria-label="Contact form">
                    {status === "success" ? (
                        <div className="contact-alert success" role="status" aria-live="polite">
                            <h2>Message sent ✅</h2>
                            <p>Thanks for reaching out, I'll email you as soon as I can!</p>
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() => {
                                    setStatus("idle");
                                    setErrorMsg("");
                                }}
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={onSubmit} noValidate>
                            <div className="grid">
                                <div className="field">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        aria-invalid={Boolean(touched.name && errors.name)}
                                        aria-describedby={touched.name && errors.name ? "name-error" : undefined}
                                        placeholder="Your name"
                                    />
                                    {touched.name && errors.name && (
                                        <div className="error" id="name-error">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>
                                <div className="field">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        aria-invalid={Boolean(touched.email && errors.email)}
                                        aria-describedby={touched.email && errors.email ? "email-error" : undefined}
                                        placeholder="you@example.com"
                                    />
                                    {touched.email && errors.email && (
                                        <div className="error" id="email-error">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="field">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    value={form.subject}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    aria-invalid={Boolean(touched.subject && errors.subject)}
                                    aria-describedby={touched.subject && errors.subject ? "subject-error" : undefined}
                                    placeholder="What's this about?"
                                />
                                {touched.subject && errors.subject && (
                                    <div className="error" id="subject-error">
                                        {errors.subject}
                                    </div>
                                )}
                            </div>
                            <div className="field">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={7}
                                    value={form.message}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    aria-invalid={Boolean(touched.message && errors.message)}
                                    aria-describedby={touched.message && errors.message ? "message-error" : undefined}
                                    placeholder="Write your message here..."
                                />
                                <div className="meta-row">
                                    <span className="hint">Minimum 10 characters.</span>
                                    <span className="count">{form.message.trim().length}/2000</span>
                                </div>
                                {touched.message && errors.message && (
                                    <div className="error" id="message-error">
                                        {errors.message}
                                    </div>
                                )}
                            </div>
                            <div className="honeypot" aria-hidden="true">
                                <label htmlFor="company">Company</label>
                                <input
                                    id="company"
                                    name="company"
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={form.company}
                                    onChange={onChange}
                                />
                            </div>
                            {status === "error" && (
                                <div className="contact-alert error" role="alert" aria-live="assertive">
                                    {errorMsg}
                                </div>
                            )}
                            <button className="primary-button" type="submit" disabled={!canSubmit}>
                                {status === "sending" ? "Sending..." : "Send message"}
                            </button>
                            <p className="privacy-note">
                                By sending this, you agree to be contacted back via the email you provided.
                            </p>
                        </form>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Contact;
