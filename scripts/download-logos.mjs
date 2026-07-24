// Downloads a favicon PNG for every brand in brands.data.mjs into
// assets/brands/<key>.png using the Google favicon service (full-color, PNG).
// Prints a report of successes, failures, and low-res icons. Run: node scripts/download-logos.mjs
import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { BRANDS } from './brands.data.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'assets', 'brands')
const SIZE = 256

/** Read PNG width/height from the IHDR chunk (bytes 16-24). */
function pngDimensions(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function tryFetch(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' })
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        const dim = pngDimensions(buf) // only accept real PNGs (skip .ico)
        if (dim && buf.length >= 100) return { buf, px: Math.min(dim.w, dim.h) }
      }
    } catch {
      // fall through to retry
    }
    if (i < retries) await sleep(400 * (i + 1))
  }
  return null
}

/** Google favicon first; only reach for icon.horse to upgrade a weak/missing one. */
async function fetchBest(domain) {
  const fav = await tryFetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${SIZE}`)
  if (fav && fav.px >= 64) return fav
  const horse = await tryFetch(`https://icon.horse/icon/${encodeURIComponent(domain)}`)
  const best = [fav, horse].filter(Boolean).sort((a, b) => b.px - a.px)[0]
  if (!best) throw new Error('no PNG from any source')
  return best
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // Clean out the old inconsistent SVGs — we're standardising on PNG.
  for (const f of await readdir(OUT_DIR)) {
    if (f.endsWith('.svg')) await unlink(join(OUT_DIR, f))
  }

  const ok = []
  const lowRes = []
  const failed = []

  for (const b of BRANDS) {
    try {
      const { buf, px } = await fetchBest(b.domain)
      await writeFile(join(OUT_DIR, `${b.key}.png`), buf)
      ok.push(b.key)
      if (px < 64) lowRes.push(`${b.key} (${px}px)`)
    } catch (e) {
      failed.push(`${b.key} <${b.domain}> — ${e.message}`)
    }
    await sleep(150) // be gentle with the favicon services
  }

  console.log(`\n✅ downloaded: ${ok.length}/${BRANDS.length}`)
  if (lowRes.length) console.log(`\n⚠️  low-res (<64px), may want manual upgrade:\n  ${lowRes.join('\n  ')}`)
  if (failed.length) console.log(`\n❌ failed (${failed.length}):\n  ${failed.join('\n  ')}`)
  // Emit the successful keys so the generator only requires files that exist.
  await writeFile(join(__dirname, 'logo-report.json'), JSON.stringify({ ok, lowRes, failed }, null, 2))
  console.log(`\nReport written to scripts/logo-report.json`)
}

main().catch((e) => { console.error(e); process.exit(1) })
