// /api/r/<requirement id>
// This is the link that gets shared on WhatsApp. WhatsApp reads the preview
// tags below and shows the card image. People who tap the link are sent on
// to the board, scrolled to this requirement.
import { getRequirement, esc, fmtDate, origin } from '../_shared.js';

export default async function handler(req, res){
  const id   = String(req.query.id || '');
  const base = origin(req);
  const r    = await getRequirement(id);

  const title = r
    ? `${r.trade} work at ${r.project_name} · ${r.required_count ?? ''} workers needed`.replace(' ·  workers needed', '')
    : 'Work available at Mangalam Landmarks sites';
  const desc = r
    ? `${r.work_title}. Starts ${fmtDate(r.start_date)}. Quote your rate. No fee, no login.`
    : 'Live contractor and labour requirements across our Pune and PCMC sites. No fee, no login.';
  const image = r ? `${base}/api/card/${id}` : `${base}/api/card/none`;
  const target = r ? `${base}/?r=${id}` : `${base}/`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Mangalam Landmarks">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(base + '/api/r/' + id)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
<script>location.replace(${JSON.stringify(target)});</script>
</head><body style="font-family:system-ui,sans-serif;padding:24px">
<p>Opening the board… <a href="${esc(target)}">Tap here if nothing happens</a>.</p>
</body></html>`);
}
