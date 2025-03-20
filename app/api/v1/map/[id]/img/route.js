import db from "@/lib/db"
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp'
// import fetch from 'node-fetch'
// import fs from 'fs'
// import path from 'path'
// import * as tar from 'tar'
// import * as os from 'os'

// TODO: would be nice if this didn't pin to a version and instead used latest
// const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/latest/download/chromium-v133.0.0-pack.tar'
// const CHROMIUM_DIR = '/tmp/chromium';

// http://localhost:3000/api/v1/map/0195ab1b-46ac-7ab3-a617-f632417e1cda/img?z=5.5

let browser

export async function GET(req) {
  try {
    // const isLocal = !!process.env.CHROME_EXEC_PATH
    // // Temporary directory to store the tar package and unzipped contents
    // const tmpDir = path.join(os.tmpdir(), 'chromium');
    // const chromiumTarPath = path.join(tmpDir, 'chromium-v133.0.0-pack.tar');
  
    // // Ensure the tmpDir exists
    // fs.mkdirSync(tmpDir, { recursive: true });
  
    // // Download the tar file from the URL
    // const response = await fetch(CHROMIUM_URL);
    // const arrayBuffer = await response.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
  
    // // Save the tar file to the temp directory
    // fs.writeFileSync(chromiumTarPath, buffer)
  
    // // Extract the tar package
    // await tar.x({
    //   file: chromiumTarPath,
    //   cwd: tmpDir,
    // })

    // const chromiumExecutablePath = path.join(tmpDir, 'chromium-v133.0.0-pack', 'chrome-linux', 'chrome');

    // console.log("path", chromiumExecutablePath)


    const id = req.nextUrl.pathname.split('/')[4]
    console.log("split", id)
    const map = await db.map.findUnique({
      where: { id },
    })

    const { searchParams } = new URL(req.url);

    const lng = parseInt(searchParams.get('lng'))
    const lat = parseInt(searchParams.get('lat'))
    const z = parseFloat(searchParams.get('z'))

    // Create a URL object
    // const url = new URL(`http://localhost:3000/${map.map}/${id}`);
    const url = new URL(`https://starlazer.vercel.app/${map.map}/${id}`);

    // Set search parameters
    if (z) url.searchParams.set('z', z)
    if (lng) url.searchParams.set('lng', lng)
    if (lat) url.searchParams.set('lat', lat)
    url.searchParams.set('mini', 1)
    // Get the final encoded URL
    console.log("sending req to", url.toString())


    // https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar


    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // const browser = await puppeteer.launch({
    //   args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath(chromiumExecutablePath),
    //   headless: chromium.headless,
    // });

    // browser = await puppeteer.launch({
    //     headless: 'new', // Adjust if needed
    //     args: ['--no-sandbox', '--disable-setuid-sandbox']
    // });

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
