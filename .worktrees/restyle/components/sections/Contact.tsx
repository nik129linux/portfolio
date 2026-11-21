"use client";

import SocialLinks from "@/components/ui/SocialLinks";
import ScrubHeading from "@/components/motion/ScrubHeading";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { nav } from "@/data/nav";
import { buttonPrimary } from "@/components/ui/button";

const sectionLabel =
  nav.find((item) => item.id === "contact")?.label ?? "Contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { name?: string; email?: string; message?: string };

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof values) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setSent(false);
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Errors = {};
    if (!values.name.trim()) next.name = "Add your name.";
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      next.email = "Use a valid email address.";
    }
    if (!values.message.trim()) next.message = "Add a short message.";

    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  const messages = [errors.name, errors.email, errors.message].filter(Boolean);

  return (
    <section
      id="contact"
      className="border-t border-line px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">
          <span aria-hidden className="h-px w-10 bg-cobalt" />
          {String(nav.findIndex((item) => item.id === "contact") + 1).padStart(2, "0")} / {sectionLabel}
        </p>
        <p className="mt-8 max-w-none font-display text-5xl leading-[1.05] text-ink sm:text-7xl">
          Have a role or a project in mind? Write me.
        </p>
      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="self-start lg:col-span-5 lg:sticky lg:top-28">
          <ScrubHeading className="text-5xl leading-none text-ink sm:text-6xl lg:text-7xl" text={sectionLabel} />

          <p className="mt-8 max-w-prose text-xl text-ink-2">
            Open to backend and AI integration roles, internships and freelance work.
          </p>
          <SocialLinks className="mt-8" />
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="field-panel rounded-2xl p-5 sm:p-8 lg:col-span-6 lg:col-start-7 lg:mt-24"
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
                className="field rounded-xl px-4 py-3 text-base text-ink placeholder:text-ink-2"
              />
            </div>
          </div>

          {messages.length > 0 ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-coral bg-coral px-4 py-3 text-base text-ink"
            >
              {messages.join(" ")}
            </p>
          ) : null}

          <button
            type="submit"
            className={`mt-5 ${buttonPrimary}`}
          >
            Send message
          </button>

          {sent ? (
            <p
              role="status"
              className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink"
            >
              Thanks, your message is ready. I will reply by email.
            </p>
          ) : null}
        </form>
        </div>
      </div>
    </section>
  );
}
