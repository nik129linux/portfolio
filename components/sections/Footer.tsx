import SocialLinks from "@/components/ui/SocialLinks";
import { nav } from "@/data/nav";
import { profile } from "@/data/profile";

// The page ends the way it opened: a giant wordmark, here as a three-line
// statement, then one quiet row of links and the year.
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-accent px-4 pb-10 pt-20 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p aria-hidden className="wordmark text-[clamp(3.5rem,15vw,14rem)] !text-paper-2">
          <span className="block">Backend.</span>
          <span className="block">AI.</span>
          <span className="block">Shipped.</span>
        </p>

        <div className="mt-16 flex flex-col items-start gap-8 border-t border-ink/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex min-h-11 items-center text-base font-semibold text-ink transition-opacity duration-200 hover:opacity-70"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            <SocialLinks />
            <p className="text-sm text-ink">
              © {year} {profile.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
