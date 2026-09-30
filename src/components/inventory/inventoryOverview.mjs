const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export function renderInventoryOverview({ companyId = 1, branchId = '', warehouseId = '' } = {}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ERP Portal · Inventory</title>
<style>
body{font-family:system-ui,sans-serif;background:#f6f7f9;color:#17202a;margin:0}main{max-width:1100px;margin:0 auto;padding:32px}h1{margin:0 0 8px}.scope{display:flex;gap:12px;flex-wrap:wrap;background:#fff;padding:16px;border:1px solid #dfe3e8;border-radius:10px}.scope label{display:flex;flex-direction:column;gap:4px;font-size:13px}.scope input{padding:8px;border:1px solid #b8c0ca;border-radius:6px}.scope button{align-self:end;padding:9px 16px;border:0;border-radius:6px;background:#166534;color:#fff;cursor:pointer}.state{margin:16px 0;padding:12px;border-radius:8px;background:#eef2ff}.state.denied{background:#fff1f2;color:#9f1239}.state.transport{background:#fff7ed;color:#9a3412}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.card{background:#fff;border:1px solid #dfe3e8;border-radius:10px;padding:16px}.muted{color:#667085}.error{font-weight:600}
</style></head><body><main>
<h1>Inventory Overview</h1><p class="muted">Scoped availability through the ERP Portal gateway.</p>
<form id="inventory-scope" class="scope">
<label>Company ID<input name="companyId" type="number" min="1" value="${escapeHtml(companyId)}" required></label>
<label>Branch ID<input name="branchId" type="number" min="1" value="${escapeHtml(branchId)}" required></label>
<label>Warehouse ID<input name="warehouseId" type="number" min="1" value="${escapeHtml(warehouseId)}"></label>
<button type="submit">Load availability</button>
</form>
<section id="inventory-state" class="state" aria-live="polite">Enter a branch scope and load Inventory.</section>
<section id="inventory-items" class="cards" aria-label="Inventory availability"></section>
<script>
const form=document.getElementById('inventory-scope');
const state=document.getElementById('inventory-state');
const items=document.getElementById('inventory-items');
const setState=(text,kind='')=>{state.textContent=text;state.className='state '+kind};
const escape=(value)=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
form.addEventListener('submit',async(event)=>{
 event.preventDefault(); items.replaceChildren(); setState('Loading availability…');
 const data=new FormData(form); const correlationId=crypto.randomUUID();
 const payload={companyId:Number(data.get('companyId')),branchId:Number(data.get('branchId')),correlationId};
 const warehouseId=String(data.get('warehouseId')||'').trim(); if(warehouseId) payload.warehouseId=Number(warehouseId);
 try {
  const response=await fetch('/api/inventory/availability',{method:'POST',headers:{'content-type':'application/json','x-correlation-id':correlationId},body:JSON.stringify(payload)});
  if(response.status===401||response.status===403){setState('Access denied for this company/branch/warehouse scope.','denied');return;}
  if(!response.ok){setState('Inventory gateway is unavailable. Try again later.','transport');return;}
  const body=await response.json(); const rows=Array.isArray(body.items)?body.items:[];
  if(!rows.length){setState('No availability rows returned.');return;}
  setState('Availability loaded.'); items.innerHTML=rows.map((row)=>'<article class="card"><strong>'+escape(row.productCode)+' / '+escape(row.variantCode)+'</strong><p>On hand: '+escape(row.onHand)+'</p><p>Available: '+escape(row.available ?? (Number(row.onHand)-Number(row.reserved)))+'</p><p>Reorder point: '+escape(row.reorderPoint ?? 0)+'</p>'+(row.belowReorderPoint?'<p class="error">Below reorder point</p>':'')+'</article>').join('');
 } catch { setState('Inventory gateway is unavailable. Try again later.','transport'); }
});
</script></main></body></html>`;
}
