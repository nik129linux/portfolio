"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

const ZONE = "America/Bogota"; // Pasto runs on Colombia time (UTC-5, no daylight saving)

// "3:42 pm in Pasto": a small live clock so a visitor knows when a reply is likely.
// Rendered after mount only, so server and client never disagree about the minute.
export default function LocalTime({ place }: { place: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const time = now ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: ZONE }).format(now) : "--:--";
  const hour = now ? Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: ZONE }).format(now)) : 12;
  const awake = hour >= 8 && hour < 22;

  return (
    <div className="contact-clock inline-flex items-center gap-4 rounded-2xl bg-paper-2 py-3 pl-3 pr-5 shadow-card">
      <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-ink">
        <MapPin aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink-2">{place}</span>
        <span className="block font-display text-xl font-bold tabular-nums text-ink">
          <time suppressHydrationWarning>{time}</time>
          <span className="ml-2 text-sm font-semibold text-accent-strong">{awake ? "usually replies today" : "replies in the morning"}</span>
        </span>
      </span>
    </div>
  );
}
