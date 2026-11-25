export type NavItem = { id: string; label: string };

export type Profile = {
  name: string;
  role: string;
  location: string;
  heroLine: string;
  heroSub: string;
  photo: string; // path under /public
  cvUrl: string; // public Google Drive link
  about: string[];
  hobbies: string[];
  stack: { group: string; items: string[] }[];
  email: string;
  github: string;
  linkedin: string;
};

export type Screen = { src: string; caption: string };

export type Project = {
  slug: string;
  title: string;
  kind: "Desktop" | "Mobile" | "Smartwatch" | "Video game" | "Web" | "Tool";
  summary: string;
  proof?: string[]; // verified engineering facts shown in the detail panel (deploys, tests, security, AI)
  stack: string[];
  github: string;
  demo?: string; // live link (Vercel) when it can run in a browser
  download?: string; // .exe/.AppImage/.apk on GitHub Releases
  media: string; // image or poster under /public/projects
  collaboration?: boolean;
  screens?: Screen[]; // clean app screens, in visitor order
  deviceScreens?: Screen[]; // screens cropped to the device (e.g. the watch face)
  device?: "laptop" | "phone" | "watch" | "monitor";
};

export type Testimonial = { name: string; role: string; quote: string; highlight?: string; photo?: string }; // highlight: exact substring of quote that gets the marker

export type ExperienceItem = { type: "academic" | "work"; title: string; place: string; start: string; end: string; detail: string; projects?: string[] }; // projects: slugs from data/projects.ts shown when the entry is opened
