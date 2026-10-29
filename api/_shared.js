// Shared helpers for the WhatsApp share page and card image.
// The URL and publishable key are the same public values used in index.html.
export const SUPABASE_URL  = 'https://xwkiacuprujheggyxldq.supabase.co';
export const SUPABASE_ANON = 'sb_publishable_pEdixshOAX-elMGPIlDBAw_bWZLnp5D';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = v => UUID.test(String(v || ''));

export const FALLBACK_COLORS = {
  RCC:'#7A5C9E', Plaster:'#1D9E75', Plumbing:'#2E7CC4', Electrical:'#C97A16', Tiling:'#C1524A',
  Masonry:'#8A6D4B', Painting:'#D4688A', Waterproofing:'#2A9AA8', Fabrication:'#5B6670', Carpentry:'#A0652D'
};

async function rest(path){
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_ANON } });
  if(!res.ok) throw new Error('Supabase ' + res.status);
  return res.json();
}

// Returns the open, published requirement or null.
export async function getRequirement(id){
  if(!isUuid(id)) return null;
  try{
    const rows = await rest(`public_requirements?id=eq.${id}&select=id,project_name,city,location,building,trade,work_title,work_description,work_quantum,required_count,start_date,duration_months,basis,rate_unit`);
    return rows[0] || null;
  }catch(e){ return null; }
}

export async function getTradeColor(trade){
  try{
    const rows = await rest('trades?select=name,color');
    const hit = rows.find(t => String(t.name).toLowerCase() === String(trade || '').toLowerCase());
    if(hit?.color) return hit.color;
  }catch(e){ /* fall through to defaults */ }
  return FALLBACK_COLORS[trade] || '#C28D2C';
}

export const BASIS_LABEL = {
  labour_rate:'Labour rate basis', with_material:'With material',
  labour_plus_shuttering:'Labour + shuttering', turnkey:'Turnkey'
};
export const UNIT_LABEL = {
  per_sft:'per sft', per_cum:'per cum', per_brass:'per brass', per_rmt:'per rmt',
  per_mt:'per MT', per_flat:'per flat', per_day:'per day', lumpsum:'lumpsum'
};

export function fmtDate(d){
  if(!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function origin(req){
  const host  = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}
