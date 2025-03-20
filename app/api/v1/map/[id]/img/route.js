import db from "@/lib/db"
import puppeteer from 'puppeteer'
import sharp from 'sharp'

let browser;


export async function GET(req) {
  try {
    const id = req.nextUrl.pathname.split('/')[4]
    console.log("split", id)
    const map = await db.map.findUnique({
      where: { id },
    })


    // const { searchParams } = new URL(req.url);
    // const url = searchParams.get('url');

    // if (!url) throw "no URL given"
    const url = `https://starlazer.vercel.app/${map.map}/${id}`


    browser = await puppeteer.launch({
        headless: 'new', // Adjust if needed
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 3840,  // 4K Width
      height: 2160, // 4K Height (16:9 aspect ratio)
      deviceScaleFactor: 2 // Increase rendering scale
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for the map canvas to be ready
    await page.waitForSelector('canvas.maplibregl-canvas', { visible: true });

    // Capture the screenshot
    const screenshotBuffer = await page.screenshot({ type: 'png' });

    // Convert to WebP
    const webpBuffer = await sharp(screenshotBuffer).webp({ quality: 80 }).toBuffer();

    await browser.close();

    return new Response(webpBuffer, {
        status: 200,
        headers: { 'Content-Type': 'image/webp' }
    })
    // return Response.json({ exists: false, published: false })

    
  } catch (error) {
    if (browser) await browser.close()
    console.error(error)
    if (typeof error === 'string') {
      return Response.json({ error }, { status: 400 })
    } else if (typeof error?.message === "string") {
      return Response.json({ error: error.message }, { status: 500 })
    } else {
      return Response.json(error, { status: 500 })
    }
  }
}
