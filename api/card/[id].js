// /api/card/<requirement id>  →  1200×630 PNG used as the WhatsApp preview image.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getRequirement, getTradeColor, BASIS_LABEL, UNIT_LABEL, fmtDate } from '../_shared.js';
import { DM500, DM700, CORM600 } from '../_fonts.js';

const b64 = s => Uint8Array.from(Buffer.from(s, 'base64')).buffer;
const FONTS = [
  { name:'DM Sans',    data:b64(DM500),  weight:500, style:'normal' },
  { name:'DM Sans',    data:b64(DM700),  weight:700, style:'normal' },
  { name:'Cormorant',  data:b64(CORM600), weight:600, style:'normal' }
];

const MAROON = '#8E1B1B', GOLD = '#C28D2C', INK = '#1C1A18', INK3 = '#7A746D', PAGE = '#FAF8F4', LINE = '#E4DED4';

// tiny helper so the card reads like HTML
const h = (type, style, children, extra = {}) =>
  ({ type, props: { style: { display:'flex', ...style }, children, ...extra } });

const clip = (s, n) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

function fact(label, value){
  return h('div', { flexDirection:'column', background:'#fff', border:`2px solid ${LINE}`, borderRadius:14, padding:'14px 20px', minWidth:150 }, [
    h('div', { fontSize:24, color:INK3, fontWeight:500 }, label),
    h('div', { fontSize:40, color:INK, fontWeight:700, marginTop:2 }, value)
  ]);
}

function card(r, color){
  const facts = [
    fact('Workers needed', r.required_count ?? '—'),
    fact('Starts', fmtDate(r.start_date)),
    r.duration_months ? fact('Duration', `${r.duration_months} months`) : null,
    r.work_quantum ? fact('Work', clip(r.work_quantum, 20)) : null
  ].filter(Boolean).slice(0, 4);

  const where = [r.project_name, r.location].filter(Boolean).join(' · ');

  return h('div', { width:1200, height:630, flexDirection:'column', background:PAGE, fontFamily:'DM Sans' }, [
    // brand bar
    h('div', { height:104, background:MAROON, alignItems:'center', justifyContent:'space-between', padding:'0 56px' }, [
      h('div', { alignItems:'baseline' }, [
        h('div', { fontFamily:'Cormorant', fontSize:56, color:'#fff', fontWeight:600 }, 'Mangalam'),
        h('div', { fontSize:22, color:'#E9C9C9', marginLeft:14, fontWeight:500 }, 'Landmarks')
      ]),
      h('div', { background:GOLD, color:'#3A2806', fontSize:28, fontWeight:700, padding:'8px 24px', borderRadius:99 }, 'Work available now')
    ]),
    // body with trade-colour edge
    h('div', { flex:1, flexDirection:'row' }, [
      h('div', { width:18, background:color }, ''),
      h('div', { flex:1, flexDirection:'column', padding:'30px 56px 0 48px' }, [
        h('div', { alignItems:'center' }, [
          h('div', { background:color, color:'#fff', fontSize:28, fontWeight:700, padding:'6px 22px', borderRadius:10 }, r.trade),
          h('div', { fontSize:28, color:INK3, marginLeft:20, fontWeight:500 }, clip(where, 52))
        ]),
        h('div', { fontSize:clip(r.work_title, 60).length > 36 ? 54 : 66, fontWeight:700, color:INK, lineHeight:1.1, marginTop:22 }, clip(r.work_title, 60)),
        h('div', { fontSize:28, color:INK3, marginTop:12, fontWeight:500 },
          `${BASIS_LABEL[r.basis] || r.basis} · ${UNIT_LABEL[r.rate_unit] || r.rate_unit}`),
        h('div', { gap:18, marginTop:'auto', marginBottom:26 }, facts)
      ])
    ]),
    // call to action
    h('div', { height:84, background:'#fff', borderTop:`2px solid ${LINE}`, alignItems:'center', justifyContent:'space-between', padding:'0 56px' }, [
      h('div', { fontSize:30, fontWeight:700, color:MAROON }, 'Quote your rate  ·  No fee  ·  No login'),
      h('div', { fontSize:28, fontWeight:500, color:INK3 }, 'Site team calls you back')
    ])
  ]);
}

function generic(){
  return h('div', { width:1200, height:630, flexDirection:'column', background:MAROON, color:'#fff', fontFamily:'DM Sans', alignItems:'center', justifyContent:'center' }, [
    h('div', { fontFamily:'Cormorant', fontSize:120, fontWeight:600 }, 'Mangalam'),
    h('div', { fontSize:36, color:'#E9C9C9', marginTop:4 }, 'Landmarks'),
    h('div', { fontSize:48, fontWeight:700, marginTop:40 }, 'Work available at our sites'),
    h('div', { fontSize:30, color:GOLD, marginTop:18, fontWeight:700 }, 'No fee  ·  No login  ·  Site team calls you back')
  ]);
}

export default async function handler(req, res){
  const r = await getRequirement(String(req.query.id || ''));
  const tree = r ? card(r, await getTradeColor(r.trade)) : generic();
  const svg = await satori(tree, { width:1200, height:630, fonts:FONTS });
  const buf = new Resvg(svg, { fitTo:{ mode:'width', value:1200 } }).render().asPng();
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  res.status(200).send(buf);
}
