import SocialLinks from "@/components/ui/SocialLinks";
import { profile } from "@/data/profile";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-none">
        <p className="max-w-none font-display text-7xl leading-[0.9] tracking-tight text-ink sm:text-8xl lg:text-9xl">
          {profile.name}
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-ink-2">
          © {year} {profile.name} · {profile.location}
        </p>

        <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
