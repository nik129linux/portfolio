import SocialLinks from "@/components/ui/SocialLinks";
import { nav } from "@/data/nav";
import { profile } from "@/data/profile";

// The page ends on one call to action: a full-bleed arch of light that fades to cream at the top, a heavy
// statement and a tilted glass button, then one quiet row of links and the year.
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cta-footer px-4 pb-10 pt-20 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="cta-arch">
          <h2 className="cta-title">
            <span className="block">Let&rsquo;s build</span>
            <span className="block">something</span>
          </h2>
          <a href={`mailto:${profile.email}`} className="cta-hi">
            Say hi!
          </a>
        </div>

        <div className="mt-16 flex flex-col items-start gap-8 border-t border-white/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex min-h-11 items-center text-base font-semibold text-accent-ink transition-opacity duration-200 hover:opacity-70"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            <SocialLinks />
            <p className="text-sm text-accent-ink">
              © {year} {profile.name}
            </p>
            <a
              href="#top"
              className="inline-flex min-h-11 items-center text-base font-semibold text-accent-ink transition-opacity duration-200 hover:opacity-70"
            >
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
