export interface Service {
  name: string
  brandKey: string
  color: string
  initial: string
}

export const POPULAR_SERVICES: Service[] = [
  { name: 'Spotify',      brandKey: 'spotify',      color: '#1DB954', initial: 'S' },
  { name: 'Netflix',      brandKey: 'netflix',      color: '#E50914', initial: 'N' },
  { name: 'YouTube',      brandKey: 'youtube',      color: '#FF0000', initial: 'Y' },
  { name: 'Amazon Prime', brandKey: 'amazon-prime', color: '#00A8E0', initial: 'A' },
  { name: 'Apple',        brandKey: 'apple',        color: '#111827', initial: 'A' },
  { name: 'Google One',   brandKey: 'google-one',   color: '#4285F4', initial: 'G' },
  { name: 'Adobe',        brandKey: 'adobe',        color: '#FA0F00', initial: 'A' },
  { name: 'Disney+',      brandKey: 'disney-plus',  color: '#113CCF', initial: 'D' },
  { name: 'Notion',       brandKey: 'notion',       color: '#111827', initial: 'N' },
  { name: 'Slack',        brandKey: 'slack',        color: '#4A154B', initial: 'S' },
  { name: 'ChatGPT',      brandKey: 'chatgpt',      color: '#10A37F', initial: 'C' },
  { name: 'Duolingo',     brandKey: 'duolingo',     color: '#58CC02', initial: 'D' },
  { name: 'iCloud',       brandKey: 'icloud',       color: '#3693F3', initial: 'i' },
  { name: 'Microsoft',    brandKey: 'microsoft',    color: '#F25022', initial: 'M' },
  { name: 'HBO',          brandKey: 'hbo',          color: '#991EEB', initial: 'H' },
  { name: 'Dropbox',      brandKey: 'dropbox',      color: '#0061FF', initial: 'D' },
]
