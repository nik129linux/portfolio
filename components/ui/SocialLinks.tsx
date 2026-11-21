import { Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/data/profile";

const isPlaceholder = (v: string) => v.startsWith("[");

const links = [
  { label: "GitHub", href: profile.github, Icon: Github, external: true },
  { label: "LinkedIn", href: profile.linkedin, Icon: Linkedin, external: true },
  { label: "Email", href: `mailto:${profile.email}`, Icon: Mail, external: false, raw: profile.email },
];

// Icon-only social links. The name stays in the DOM for screen readers and tooltips;
// placeholders are not rendered at all.
export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links
        .filter((l) => !isPlaceholder(l.raw ?? l.href))
        .map(({ label, href, Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              title={label}
              className="btn btn-secondary btn-icon"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <Icon aria-hidden className="size-5" strokeWidth={1.75} />
              <span className="sr-only">{label}</span>
            </a>
          </li>
        ))}
    </ul>
  );
}
