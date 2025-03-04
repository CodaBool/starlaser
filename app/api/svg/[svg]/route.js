import * as svgs from '@/components/svg.js';

export async function GET(req, { params }) {
  try {
    const { svg } = await params
    const icon = svgs[svg]
    if (!icon) throw "no icon for " + svg + " found"
    return new Response(icon, {
      headers: { "Content-Type": "image/svg+xml" }
    })
  } catch (err) {
    console.error(err)
    if (typeof err === 'string') {
      return Response.json({ err }, { status: 400 })
    } else if (typeof err?.message === "string") {
      return Response.json({ err: err.message }, { status: 500 })
    } else {
      return Response.json(err, { status: 500 })
    }
  }
}
