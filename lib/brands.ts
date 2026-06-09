const DOMAIN_MAP: Record<string, string> = {
  // Entertainment
  "Netflix":              "netflix.com",
  "Spotify":              "spotify.com",
  "Viaplay":              "viaplay.com",
  "Disney+":              "disneyplus.com",
  "HBO Max":              "hbomax.com",
  "Apple TV+":            "tv.apple.com",
  "YouTube Premium":      "youtube.com",
  // Software & Cloud
  "Adobe Creative Cloud": "adobe.com",
  "Adobe CC":             "adobe.com",
  "Microsoft 365":        "microsoft.com",
  "Google One":           "one.google.com",
  "iCloud+":              "icloud.com",
  "Dropbox":              "dropbox.com",
  "Notion":               "notion.so",
  "Figma":                "figma.com",
  "GitHub":               "github.com",
  "Slack":                "slack.com",
  // Fitness
  "Elixia Gym":           "elixia.fi",
  "Fitbit Premium":       "fitbit.com",
  "Strava":               "strava.com",
  "MyFitnessPal":         "myfitnesspal.com",
  // News & Media
  "Audible":              "audible.com",
  "Kindle Unlimited":     "amazon.com",
  "Storytel":             "storytel.com",
  "Yle Areena":           "yle.fi",
  // Utilities
  "NordVPN":              "nordvpn.com",
  "ExpressVPN":           "expressvpn.com",
  "1Password":            "1password.com",
  // Finance
  "Revolut":              "revolut.com",
  // Shopping
  "Amazon Prime":         "amazon.com",
};

const KEY = process.env.EXPO_PUBLIC_BRANDFETCH_KEY ?? "";

export function logoUrl(name: string, size = 64): string | null {
  const domain = DOMAIN_MAP[name];
  if (!domain || !KEY) return null;
  return `https://cdn.brandfetch.io/${domain}/w/${size}/h/${size}?c=${KEY}`;
}

export function getDomain(name: string): string | null {
  return DOMAIN_MAP[name] ?? null;
}
