export type NowData = {
  intro: string;
  items: { label: string; value: string }[];
};

export const now: NowData = {
  intro: "[One or two sentences about what you are focused on right now]",
  items: [
    { label: "[Focus 1]", value: "[What you are building]" },
    { label: "[Focus 2]", value: "[What you are learning]" },
    { label: "[Focus 3]", value: "[What you are reading]" },
  ],
};
