import RevealHeading from "@/components/motion/RevealHeading";
import BuildChapter from "@/components/build/BuildChapter";
import { profile } from "@/data/profile";

// The first full-bleed cobalt chapter. On desktop the four stack groups take the stage one at a
// time while their logos fly through in 3D; on phones and with reduced motion they simply stack.
export default function Build() {
  return (
    <section id="build" className="bg-accent px-4 pt-24 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <RevealHeading as="h2" text="What I build" className="wordmark wordmark-section !text-accent-ink lg:col-span-8" />
          <p className="max-w-sm text-lg text-accent-ink lg:col-span-4 lg:justify-self-end">
            Four layers, from the API to the model behind it.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-[1500px] pb-20 sm:pb-24">
        <BuildChapter groups={profile.stack} />
      </div>
    </section>
  );
}
