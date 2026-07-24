// Master brand catalog for MySubList. Source of truth for the logo download
// script and the generated src/constants/services.ts. `domain` is used only to
// fetch the favicon logo (Google favicon service); `color` is the fallback
// initial-badge color when a logo is missing. Sub-brands use a specific
// subdomain where possible so their favicon differs from the parent company.
export const BRANDS = [
  // 1. Streaming
  { name: 'Netflix', key: 'netflix', domain: 'netflix.com', category: 'Streaming', color: '#E50914' },
  { name: 'Disney+', key: 'disney-plus', domain: 'disneyplus.com', category: 'Streaming', color: '#113CCF' },
  { name: 'Prime Video', key: 'prime-video', domain: 'primevideo.com', category: 'Streaming', color: '#00A8E1' },
  { name: 'HBO Max', key: 'hbo-max', domain: 'max.com', category: 'Streaming', color: '#002BE7' },
  { name: 'Apple TV+', key: 'apple-tv-plus', domain: 'tv.apple.com', category: 'Streaming', color: '#000000' },
  { name: 'Paramount+', key: 'paramount-plus', domain: 'paramountplus.com', category: 'Streaming', color: '#0064FF' },
  { name: 'YouTube Premium', key: 'youtube-premium', domain: 'youtube.com', category: 'Streaming', color: '#FF0000' },
  { name: 'Crunchyroll', key: 'crunchyroll', domain: 'crunchyroll.com', category: 'Streaming', color: '#F47521' },
  { name: 'DAZN', key: 'dazn', domain: 'dazn.com', category: 'Streaming', color: '#0A0A0A' },
  { name: 'NOW', key: 'now-tv', domain: 'nowtv.com', category: 'Streaming', color: '#101820' },
  { name: 'SkyShowtime', key: 'skyshowtime', domain: 'skyshowtime.com', category: 'Streaming', color: '#5A2D9C' },
  { name: 'MUBI', key: 'mubi', domain: 'mubi.com', category: 'Streaming', color: '#000000' },

  // 2. Music
  { name: 'Spotify', key: 'spotify', domain: 'spotify.com', category: 'Music', color: '#1DB954' },
  { name: 'Apple Music', key: 'apple-music', domain: 'music.apple.com', category: 'Music', color: '#FA243C' },
  { name: 'YouTube Music', key: 'youtube-music', domain: 'music.youtube.com', category: 'Music', color: '#FF0000' },
  { name: 'Amazon Music', key: 'amazon-music', domain: 'music.amazon.com', category: 'Music', color: '#00C8D6' },
  { name: 'Tidal', key: 'tidal', domain: 'tidal.com', category: 'Music', color: '#000000' },
  { name: 'Deezer', key: 'deezer', domain: 'deezer.com', category: 'Music', color: '#A238FF' },
  { name: 'Audible', key: 'audible', domain: 'audible.com', category: 'Music', color: '#FF9910' },

  // 3. Cloud storage
  { name: 'iCloud+', key: 'icloud', domain: 'icloud.com', category: 'Cloud Storage', color: '#3693F3' },
  { name: 'Google One', key: 'google-one', domain: 'one.google.com', category: 'Cloud Storage', color: '#4285F4' },
  { name: 'Dropbox', key: 'dropbox', domain: 'dropbox.com', category: 'Cloud Storage', color: '#0061FF' },
  { name: 'Microsoft OneDrive', key: 'onedrive', domain: 'onedrive.live.com', category: 'Cloud Storage', color: '#0078D4' },
  { name: 'MEGA', key: 'mega', domain: 'mega.nz', category: 'Cloud Storage', color: '#D9272E' },
  { name: 'Proton Drive', key: 'proton-drive', domain: 'proton.me', category: 'Cloud Storage', color: '#6D4AFF' },

  // 4. Productivity & work
  { name: 'Notion', key: 'notion', domain: 'notion.so', category: 'Productivity', color: '#000000' },
  { name: 'Microsoft 365', key: 'microsoft-365', domain: 'microsoft365.com', category: 'Productivity', color: '#D83B01' },
  { name: 'Google Workspace', key: 'google-workspace', domain: 'workspace.google.com', category: 'Productivity', color: '#4285F4' },
  { name: 'Slack', key: 'slack', domain: 'slack.com', category: 'Productivity', color: '#4A154B' },
  { name: 'Zoom', key: 'zoom', domain: 'zoom.us', category: 'Productivity', color: '#2D8CFF' },
  { name: 'Trello', key: 'trello', domain: 'trello.com', category: 'Productivity', color: '#0079BF' },
  { name: 'Asana', key: 'asana', domain: 'asana.com', category: 'Productivity', color: '#F06A6A' },
  { name: 'Todoist', key: 'todoist', domain: 'todoist.com', category: 'Productivity', color: '#E44332' },
  { name: 'Grammarly', key: 'grammarly', domain: 'grammarly.com', category: 'Productivity', color: '#15C39A' },
  { name: 'Miro', key: 'miro', domain: 'miro.com', category: 'Productivity', color: '#FFD02F' },
  { name: 'Calendly', key: 'calendly', domain: 'calendly.com', category: 'Productivity', color: '#006BFF' },
  { name: 'Adobe Acrobat', key: 'adobe-acrobat', domain: 'acrobat.adobe.com', category: 'Productivity', color: '#EB1000' },

  // 5. AI
  { name: 'ChatGPT', key: 'chatgpt', domain: 'chatgpt.com', category: 'AI', color: '#10A37F' },
  { name: 'Claude', key: 'claude', domain: 'claude.ai', category: 'AI', color: '#CC785C' },
  { name: 'Gemini', key: 'gemini', domain: 'gemini.google.com', category: 'AI', color: '#4285F4' },
  { name: 'Microsoft Copilot', key: 'microsoft-copilot', domain: 'microsoft.com', category: 'AI', color: '#0078D4' },
  { name: 'Perplexity', key: 'perplexity', domain: 'perplexity.ai', category: 'AI', color: '#20808D' },
  { name: 'Grok', key: 'grok', domain: 'grok.com', category: 'AI', color: '#000000' },
  { name: 'Midjourney', key: 'midjourney', domain: 'midjourney.com', category: 'AI', color: '#000000' },
  { name: 'GitHub Copilot', key: 'github-copilot', domain: 'github.com', category: 'AI', color: '#24292E' },
  { name: 'Cursor', key: 'cursor', domain: 'cursor.com', category: 'AI', color: '#000000' },

  // 6. Design & creative
  { name: 'Adobe Creative Cloud', key: 'adobe-creative-cloud', domain: 'adobe.com', category: 'Design', color: '#FA0F00' },
  { name: 'Canva', key: 'canva', domain: 'canva.com', category: 'Design', color: '#00C4CC' },
  { name: 'Figma', key: 'figma', domain: 'figma.com', category: 'Design', color: '#F24E1E' },
  { name: 'CapCut', key: 'capcut', domain: 'capcut.com', category: 'Design', color: '#000000' },
  { name: 'Adobe Lightroom', key: 'adobe-lightroom', domain: 'lightroom.adobe.com', category: 'Design', color: '#31A8FF' },
  { name: 'Picsart', key: 'picsart', domain: 'picsart.com', category: 'Design', color: '#C209C1' },
  { name: 'Sketch', key: 'sketch', domain: 'sketch.com', category: 'Design', color: '#FDB300' },
  { name: 'Framer', key: 'framer', domain: 'framer.com', category: 'Design', color: '#0055FF' },
  { name: 'Envato Elements', key: 'envato-elements', domain: 'elements.envato.com', category: 'Design', color: '#87B040' },

  // 7. Development & technology
  { name: 'GitHub', key: 'github', domain: 'github.com', category: 'Development', color: '#24292E' },
  { name: 'GitLab', key: 'gitlab', domain: 'gitlab.com', category: 'Development', color: '#FC6D26' },
  { name: 'JetBrains', key: 'jetbrains', domain: 'jetbrains.com', category: 'Development', color: '#000000' },
  { name: 'Vercel', key: 'vercel', domain: 'vercel.com', category: 'Development', color: '#000000' },
  { name: 'Netlify', key: 'netlify', domain: 'netlify.com', category: 'Development', color: '#00C7B7' },
  { name: 'DigitalOcean', key: 'digitalocean', domain: 'digitalocean.com', category: 'Development', color: '#0080FF' },
  { name: 'Docker', key: 'docker', domain: 'docker.com', category: 'Development', color: '#2496ED' },
  { name: 'Namecheap', key: 'namecheap', domain: 'namecheap.com', category: 'Development', color: '#DE3910' },

  // 8. Gaming
  { name: 'Xbox Game Pass', key: 'xbox-game-pass', domain: 'xbox.com', category: 'Gaming', color: '#107C10' },
  { name: 'PlayStation Plus', key: 'playstation-plus', domain: 'playstation.com', category: 'Gaming', color: '#0070D1' },
  { name: 'Nintendo Switch Online', key: 'nintendo-switch-online', domain: 'nintendo.com', category: 'Gaming', color: '#E60012' },
  { name: 'Apple Arcade', key: 'apple-arcade', domain: 'apple.com', category: 'Gaming', color: '#F94C57' },
  { name: 'EA Play', key: 'ea-play', domain: 'ea.com', category: 'Gaming', color: '#FF4040' },
  { name: 'Ubisoft+', key: 'ubisoft-plus', domain: 'ubisoft.com', category: 'Gaming', color: '#000000' },
  { name: 'GeForce NOW', key: 'geforce-now', domain: 'nvidia.com', category: 'Gaming', color: '#76B900' },
  { name: 'Discord Nitro', key: 'discord-nitro', domain: 'discord.com', category: 'Gaming', color: '#5865F2' },
  { name: 'Roblox Premium', key: 'roblox-premium', domain: 'roblox.com', category: 'Gaming', color: '#E2231A' },
  { name: 'Fortnite Crew', key: 'fortnite-crew', domain: 'fortnite.com', category: 'Gaming', color: '#9147FF' },
  { name: 'Minecraft Realms', key: 'minecraft-realms', domain: 'minecraft.net', category: 'Gaming', color: '#3AAA35' },

  // 9. News, books & reading
  { name: 'The New York Times', key: 'nyt', domain: 'nytimes.com', category: 'News & Reading', color: '#000000' },
  { name: 'The Wall Street Journal', key: 'wsj', domain: 'wsj.com', category: 'News & Reading', color: '#000000' },
  { name: 'The Economist', key: 'economist', domain: 'economist.com', category: 'News & Reading', color: '#E3120B' },
  { name: 'Financial Times', key: 'financial-times', domain: 'ft.com', category: 'News & Reading', color: '#990F3D' },
  { name: 'Bloomberg', key: 'bloomberg', domain: 'bloomberg.com', category: 'News & Reading', color: '#000000' },
  { name: 'Medium', key: 'medium', domain: 'medium.com', category: 'News & Reading', color: '#000000' },
  { name: 'Substack', key: 'substack', domain: 'substack.com', category: 'News & Reading', color: '#FF6719' },
  { name: 'Blinkist', key: 'blinkist', domain: 'blinkist.com', category: 'News & Reading', color: '#22C55E' },
  { name: 'Kindle Unlimited', key: 'kindle-unlimited', domain: 'amazon.com', category: 'News & Reading', color: '#FF9900' },
  { name: 'Readly', key: 'readly', domain: 'readly.com', category: 'News & Reading', color: '#FF3B5C' },
  { name: 'Everand', key: 'everand', domain: 'everand.com', category: 'News & Reading', color: '#1A7B88' },

  // 10. Fitness & health
  { name: 'Strava', key: 'strava', domain: 'strava.com', category: 'Fitness', color: '#FC4C02' },
  { name: 'Apple Fitness+', key: 'apple-fitness-plus', domain: 'apple.com', category: 'Fitness', color: '#30D158' },
  { name: 'Peloton', key: 'peloton', domain: 'onepeloton.com', category: 'Fitness', color: '#E31F26' },
  { name: 'Calm', key: 'calm', domain: 'calm.com', category: 'Fitness', color: '#4A7DFF' },
  { name: 'Headspace', key: 'headspace', domain: 'headspace.com', category: 'Fitness', color: '#FF6E40' },
  { name: 'MyFitnessPal Premium', key: 'myfitnesspal', domain: 'myfitnesspal.com', category: 'Fitness', color: '#0070E0' },
  { name: 'Fitbit Premium', key: 'fitbit-premium', domain: 'fitbit.com', category: 'Fitness', color: '#00B0B9' },
  { name: 'WHOOP', key: 'whoop', domain: 'whoop.com', category: 'Fitness', color: '#000000' },
  { name: 'Freeletics', key: 'freeletics', domain: 'freeletics.com', category: 'Fitness', color: '#FF4800' },

  // 11. Education
  { name: 'Duolingo Super', key: 'duolingo', domain: 'duolingo.com', category: 'Education', color: '#58CC02' },
  { name: 'Coursera Plus', key: 'coursera', domain: 'coursera.org', category: 'Education', color: '#0056D2' },
  { name: 'Udemy', key: 'udemy', domain: 'udemy.com', category: 'Education', color: '#A435F0' },
  { name: 'Skillshare', key: 'skillshare', domain: 'skillshare.com', category: 'Education', color: '#00A88E' },
  { name: 'MasterClass', key: 'masterclass', domain: 'masterclass.com', category: 'Education', color: '#000000' },
  { name: 'LinkedIn Learning', key: 'linkedin-learning', domain: 'linkedin.com', category: 'Education', color: '#0A66C2' },
  { name: 'Babbel', key: 'babbel', domain: 'babbel.com', category: 'Education', color: '#FF6E00' },
  { name: 'Brilliant', key: 'brilliant', domain: 'brilliant.org', category: 'Education', color: '#26D07C' },
  { name: 'Codecademy Pro', key: 'codecademy', domain: 'codecademy.com', category: 'Education', color: '#1F4056' },

  // 12. VPN & security
  { name: 'NordVPN', key: 'nordvpn', domain: 'nordvpn.com', category: 'VPN & Security', color: '#4687FF' },
  { name: 'ExpressVPN', key: 'expressvpn', domain: 'expressvpn.com', category: 'VPN & Security', color: '#E7442E' },
  { name: 'Surfshark', key: 'surfshark', domain: 'surfshark.com', category: 'VPN & Security', color: '#0FB6B6' },
  { name: 'Proton VPN', key: 'proton-vpn', domain: 'protonvpn.com', category: 'VPN & Security', color: '#6D4AFF' },
  { name: 'Mullvad VPN', key: 'mullvad-vpn', domain: 'mullvad.net', category: 'VPN & Security', color: '#294D73' },
  { name: '1Password', key: '1password', domain: '1password.com', category: 'VPN & Security', color: '#3B66BC' },
  { name: 'Malwarebytes', key: 'malwarebytes', domain: 'malwarebytes.com', category: 'VPN & Security', color: '#0071BC' },
  { name: 'Bitdefender', key: 'bitdefender', domain: 'bitdefender.com', category: 'VPN & Security', color: '#ED1C24' },

  // 13. Social & lifestyle
  { name: 'Amazon Prime', key: 'amazon-prime', domain: 'amazon.com', category: 'Social & Lifestyle', color: '#00A8E1' },
  { name: 'Uber One', key: 'uber-one', domain: 'uber.com', category: 'Social & Lifestyle', color: '#000000' },
  { name: 'Deliveroo Plus', key: 'deliveroo-plus', domain: 'deliveroo.com', category: 'Social & Lifestyle', color: '#00CCBC' },
  { name: 'Wolt+', key: 'wolt-plus', domain: 'wolt.com', category: 'Social & Lifestyle', color: '#00C2E8' },
  { name: 'HelloFresh', key: 'hellofresh', domain: 'hellofresh.com', category: 'Social & Lifestyle', color: '#99CC33' },
  { name: 'Patreon', key: 'patreon', domain: 'patreon.com', category: 'Social & Lifestyle', color: '#000000' },
  { name: 'Tinder', key: 'tinder', domain: 'tinder.com', category: 'Social & Lifestyle', color: '#FD5564' },
  { name: 'Bumble', key: 'bumble', domain: 'bumble.com', category: 'Social & Lifestyle', color: '#FFC629' },
  { name: 'X Premium', key: 'x-premium', domain: 'x.com', category: 'Social & Lifestyle', color: '#000000' },
  { name: 'Reddit Premium', key: 'reddit-premium', domain: 'reddit.com', category: 'Social & Lifestyle', color: '#FF4500' },
  { name: 'Telegram Premium', key: 'telegram-premium', domain: 'telegram.org', category: 'Social & Lifestyle', color: '#26A5E4' },
]
