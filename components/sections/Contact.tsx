"use client";

import SocialLinks from "@/components/ui/SocialLinks";
import RevealHeading from "@/components/motion/RevealHeading";
import ContactMotion from "@/components/contact/ContactMotion";
import LocalTime from "@/components/contact/LocalTime";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, SendHorizontal } from "lucide-react";
import { nav } from "@/data/nav";
import { buttonPrimary } from "@/components/ui/button";
import { profile } from "@/data/profile";

// AWS Lambda function URL (infra/contact). Public by design: it only accepts a validated message.
const CONTACT_URL =
  process.env.NEXT_PUBLIC_CONTACT_URL ?? "https://ngjcjvp4xrm3gnxlbezqr4wfdy0ppuua.lambda-url.us-east-1.on.aws/";

const sectionLabel = nav.find((item) => item.id === "contact")?.label ?? "Contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 1000;

// Quick starts: one tap writes the opening line of the message, so the visitor only fills in details.
const INTENTS = [
  { label: "A role", starter: "Hi Nicolas, I have a backend / AI integration role that could fit you: " },
  { label: "An internship", starter: "Hi Nicolas, we have an internship you might like: " },
  { label: "A freelance project", starter: "Hi Nicolas, I need help building " },
  { label: "Just saying hi", starter: "Hi Nicolas, I saw your portfolio and " },
];

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

function check(values: Record<Field, string>): Errors {
  const next: Errors = {};
  if (!values.name.trim()) next.name = "Add your name.";
  if (!EMAIL_PATTERN.test(values.email.trim())) next.email = "Use a valid email address.";
  if (!values.message.trim()) next.message = "Add a short message.";
  return next;
}

export default function Contact() {
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [intent, setIntent] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const live = check(values);
  const valid = (field: Field) => touched[field] && !live[field];

  function update(field: Field) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValues((current) => ({ ...current, [field]: value }));
      // An error clears as soon as the field is fixed, not on the next submit.
      if (errors[field]) setErrors((current) => ({ ...current, [field]: check({ ...values, [field]: value })[field] }));
      setSent(false);
      setFailed(false);
    };
  }

  const blur = (field: Field) => () => setTouched((t) => ({ ...t, [field]: true }));

  function pickIntent(index: number) {
    const starter = INTENTS[index].starter;
    setValues((current) => {
      // Replace the message only while it is empty or still an untouched starter.
      const untouched = !current.message.trim() || INTENTS.some((i) => i.starter === current.message);
      return untouched ? { ...current, message: starter } : current;
    });
    setIntent(index);
    requestAnimationFrame(() => {
      const el = messageRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next = check(values);
    setErrors(next);
    setTouched({ name: true, email: true, message: true });
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
      setTouched({});
      setIntent(null);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  const messages = [errors.name, errors.email, errors.message].filter(Boolean);

  const fieldState = (field: Field) => (errors[field] ? "error" : valid(field) ? "ok" : undefined);

  return (
    <section id="contact" className="overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealHeading as="h2" text={sectionLabel} className="wordmark wordmark-xl" />

        <ContactMotion className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p data-contact-in className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Have a role or a project in mind? Write me.
            </p>
            <p data-contact-in className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
              Open to backend and AI integration roles, internships and freelance work.
            </p>

            <div data-contact-in className="mt-8">
              <p id="intent-label" className="text-sm font-semibold text-ink-2">
                What is it about?
              </p>
              <div role="group" aria-labelledby="intent-label" className="mt-3 flex flex-wrap gap-2">
                {INTENTS.map((item, i) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-pressed={intent === i}
                    onClick={() => pickIntent(i)}
                    className="contact-chip min-h-11 rounded-full px-4 text-sm font-semibold"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div data-contact-in className="mt-8">
              <LocalTime place={profile.location} />
            </div>
            <SocialLinks className="mt-8" />
          </div>

          <div className="relative lg:col-span-7">
            {/* two sheets under the letter, fanned out by scroll (ContactMotion) */}
            <span aria-hidden data-contact-sheet="back" className="contact-sheet contact-sheet-back absolute inset-0 rounded-[28px]" />
            <span aria-hidden data-contact-sheet="mid" className="contact-sheet contact-sheet-mid absolute inset-0 rounded-[28px]" />

            <form
              noValidate
              onSubmit={handleSubmit}
              data-contact-form
              data-sent={sent ? "" : undefined}
              className="field-panel relative rounded-[28px] p-5 sm:p-8"
            >
              <div className="grid gap-5">
                {(
                  [
                    { field: "name", label: "Name", type: "text", auto: "name" },
                    { field: "email", label: "Email", type: "email", auto: "email" },
                  ] as const
                ).map(({ field, label, type, auto }) => (
                  <div key={field} className="contact-field grid gap-2" data-state={fieldState(field)}>
                    <label htmlFor={`contact-${field}`} className="text-sm font-semibold text-ink-2">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        id={`contact-${field}`}
                        name={field}
                        type={type}
                        autoComplete={auto}
                        required
                        value={values[field]}
                        onChange={update(field)}
                        onBlur={blur(field)}
                        aria-invalid={Boolean(errors[field])}
                        aria-describedby={errors[field] ? `contact-${field}-error` : undefined}
                        className="field min-h-12 w-full rounded-xl px-4 pr-12 text-base text-ink placeholder:text-ink-2"
                      />
                      <span aria-hidden className="contact-ok absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-accent text-accent-ink">
                        <Check className="size-4" strokeWidth={2.5} />
                      </span>
                      <span aria-hidden className="contact-bar absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" />
                    </div>
                    {errors[field] ? (
                      <p id={`contact-${field}-error`} className="contact-err text-sm font-semibold text-accent-strong">
                        {errors[field]}
                      </p>
                    ) : null}
                  </div>
                ))}

                <div className="contact-field grid gap-2" data-state={fieldState("message")}>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="contact-message" className="text-sm font-semibold text-ink-2">
                      Message
                    </label>
                    <span aria-hidden className="text-xs tabular-nums text-ink-2">
                      {values.message.length} / {MESSAGE_MAX}
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      ref={messageRef}
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      maxLength={MESSAGE_MAX}
                      value={values.message}
                      onChange={update("message")}
                      onBlur={blur("message")}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "contact-message-error" : undefined}
                      className="field block min-h-12 w-full rounded-xl px-4 py-3 text-base text-ink placeholder:text-ink-2"
                    />
                    <span aria-hidden className="contact-bar absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" />
                  </div>
                  {errors.message ? (
                    <p id="contact-message-error" className="contact-err text-sm font-semibold text-accent-strong">
                      {errors.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {messages.length > 0 ? (
                <p role="alert" className="contact-pop mt-4 rounded-xl bg-accent-soft px-4 py-3 text-base text-ink">
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
                data-sending={sending ? "" : undefined}
                className={`contact-send mt-6 w-full gap-3 sm:w-auto ${buttonPrimary}`}
              >
                {sending ? "Sending..." : "Send message"}
                <SendHorizontal aria-hidden className="contact-send-icon size-5" strokeWidth={1.75} />
              </button>

              {sent ? (
                <p role="status" className="contact-pop mt-4 flex items-center gap-3 rounded-xl bg-accent-soft px-4 py-3 text-base text-ink">
                  <svg aria-hidden viewBox="0 0 24 24" className="contact-check size-6 shrink-0 text-accent-strong">
                    <circle pathLength={1} cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path pathLength={1} d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Thanks, your message was sent. I will reply by email.
                </p>
              ) : null}

              {failed ? (
                <p role="alert" className="contact-pop mt-4 rounded-xl bg-paper px-4 py-3 text-base text-ink">
                  Could not send it. Email me directly at{" "}
                  <a className="font-semibold underline" href={`mailto:${profile.email}`}>
                    {profile.email}
                  </a>
                  .
                </p>
              ) : null}
            </form>
          </div>
        </ContactMotion>
      </div>
    </section>
  );
}
