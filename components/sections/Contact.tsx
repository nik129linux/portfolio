"use client";

import SocialLinks from "@/components/ui/SocialLinks";
import RevealHeading from "@/components/motion/RevealHeading";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { nav } from "@/data/nav";
import { buttonPrimary } from "@/components/ui/button";
import { profile } from "@/data/profile";

// AWS Lambda function URL (infra/contact). Public by design: it only accepts a validated message.
const CONTACT_URL =
  process.env.NEXT_PUBLIC_CONTACT_URL ?? "https://ngjcjvp4xrm3gnxlbezqr4wfdy0ppuua.lambda-url.us-east-1.on.aws/";

const sectionLabel = nav.find((item) => item.id === "contact")?.label ?? "Contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { name?: string; email?: string; message?: string };

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  function update(field: keyof typeof values) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setSent(false);
      setFailed(false);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Errors = {};
    if (!values.name.trim()) next.name = "Add your name.";
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      next.email = "Use a valid email address.";
    }
    if (!values.message.trim()) next.message = "Add a short message.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    setFailed(false);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch(CONTACT_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, website: form.get("website") ?? "" }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setSent(true);
      setValues({ name: "", email: "", message: "" });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  const messages = [errors.name, errors.email, errors.message].filter(Boolean);

  return (
    <section id="contact" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealHeading
          as="h2"
          text={sectionLabel}
          className="wordmark wordmark-xl"
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Have a role or a project in mind? Write me.
            </p>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
              Open to backend and AI integration roles, internships and freelance work.
            </p>
            <SocialLinks className="mt-8" />
          </div>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="field-panel rounded-[28px] p-5 sm:p-8 lg:col-span-7"
          >
            <div className="grid gap-5">
              <div className="grid gap-2">
                <label
                  htmlFor="contact-name"
                  className="text-sm font-semibold text-ink-2"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={values.name}
                  onChange={update("name")}
                  aria-invalid={Boolean(errors.name)}
                  className="field min-h-12 rounded-xl px-4 text-base text-ink placeholder:text-ink-2"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="contact-email"
                  className="text-sm font-semibold text-ink-2"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={update("email")}
                  aria-invalid={Boolean(errors.email)}
                  className="field min-h-12 rounded-xl px-4 text-base text-ink placeholder:text-ink-2"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-semibold text-ink-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  value={values.message}
                  onChange={update("message")}
                  aria-invalid={Boolean(errors.message)}
                  className="field min-h-12 rounded-xl px-4 py-3 text-base text-ink placeholder:text-ink-2"
                />
              </div>
            </div>

            {messages.length > 0 ? (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-base text-ink"
              >
                {messages.join(" ")}
              </p>
            ) : null}

            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Leave this empty
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button
              type="submit"
              disabled={sending}
              className={`mt-6 w-full sm:w-auto ${buttonPrimary}`}
            >
              {sending ? "Sending..." : "Send message"}
            </button>

            {sent ? (
              <p
                role="status"
                className="mt-4 rounded-xl bg-paper px-4 py-3 text-base text-ink"
              >
                Thanks, your message was sent. I will reply by email.
              </p>
            ) : null}

            {failed ? (
              <p role="alert" className="mt-4 rounded-xl bg-paper px-4 py-3 text-base text-ink">
                Could not send it. Email me directly at{" "}
                <a className="font-semibold underline" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                .
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
