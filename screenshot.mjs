import puppeteer from 'puppeteer-core'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const url = process.argv[2] || 'http://localhost:5173'
const label = process.argv[3]

const screenshotDir = join(__dirname, 'temporary screenshots')
if (!existsSync(screenshotDir)) mkdirSync(screenshotDir, { recursive: true })

const existing = readdirSync(screenshotDir).filter(f => f.endsWith('.png'))
const indices = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(n => !isNaN(n))
const nextIndex = indices.length ? Math.max(...indices) + 1 : 1

const filename = label ? `screenshot-${nextIndex}-${label}.png` : `screenshot-${nextIndex}.png`
const outputPath = join(screenshotDir, filename)

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

// Scroll through the page so IntersectionObserver fires for all reveal elements
await page.evaluate(async () => {
  const totalHeight = document.body.scrollHeight
  const step = 200
  for (let y = 0; y <= totalHeight; y += step) {
    window.scrollTo(0, y)
    await new Promise(r => setTimeout(r, 80))
  }
  window.scrollTo(0, 0)
})
await new Promise(r => setTimeout(r, 2000))
await page.screenshot({ path: outputPath, fullPage: true })
await browser.close()

console.log(`Saved: ${outputPath}`)
