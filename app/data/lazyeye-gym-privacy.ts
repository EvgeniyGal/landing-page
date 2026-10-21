export const LAZYEYE_GYM = {
  appName: "LazyEye Gym",
  packageName: "com.lazyeyegym.app",
  developerName: "Yevgen Galamaga",
  contactEmail: "yevgengalamaga@gmail.com",
  websiteUrl: "https://aiautomations.work",
  lastUpdated: "October 21, 2026",
  googlePrivacyUrl: "https://policies.google.com/privacy",
  googlePlayTermsUrl: "https://play.google.com/about/play-terms/",
} as const;

export type OnDeviceDataRow = {
  type: string;
  examples: string;
  purpose: string;
};

export const onDeviceDataRows: OnDeviceDataRow[] = [
  {
    type: "App preferences",
    examples:
      "Display name shown in the App, language, theme, anaglyph/glasses colour settings, dichoptic intensity, sound/haptics, reminder schedule",
    purpose: "Make the App work as you configured it",
  },
  {
    type: "Training / play data",
    examples: "Session history, playtime per game, scores/records stored by the App",
    purpose: "Show your local progress and history",
  },
  {
    type: "Local flags",
    examples: "UI preferences related to the App",
    purpose: "App behaviour",
  },
];
