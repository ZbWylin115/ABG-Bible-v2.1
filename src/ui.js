import { DATA } from '../data/archetypes.js';
import { VENUES } from '../data/venues.js';
import { PLATS } from '../data/platforms.js';
import { ETH } from '../data/ethnicity.js';
import { SIG } from '../data/signals.js';
import { EDGY } from '../data/edgy.js';

import { CITIES } from '../data/cities/la.js';
import { CITY_VEGAS } from '../data/cities/vegas.js';
import { CITY_HOUSTON } from '../data/cities/houston.js';
import { CITY_SLC } from '../data/cities/slc.js';
import { CITY_NYC } from '../data/cities/nyc.js';
import { CITY_BAY } from '../data/cities/bayarea.js';
import { CITY_SEA } from '../data/cities/seattle.js';

import { generatePlan } from './generator.js';

const cityMap = { la:CITIES, vegas:CITY_VEGAS, houston:CITY_HOUSTON, slc:CITY_SLC, nyc:CITY_NYC, bayarea:CITY_BAY, seattle:CITY_SEA };

function $(id){ return document.getElementById(id); }
function populateSelect(el, arr, includeNone=false){
  el.innerHTML = '';
  if(includeNone){ const o=document.createElement('option'); o.value=''; o.textContent='(none)'; el.appendChild(o); }
  arr.forEach(it=>{
    const opt = document.createElement('option');
    opt.value = it.id || it.name;
    opt.textContent = it.label || it.name;
    el.appendChild(opt);
  });
}
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
}

export function initUI(){
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));

  // Selects
  populateSelect($('archetype'), DATA.archetypes);
  populateSelect($('venue'), VENUES.venues);
  populateSelect($('platform'), PLATS.platforms);
  populateSelect($('city'), [
    {id:'la',label:'Los Angeles'},{id:'vegas',label:'Las Vegas'},{id:'houston',label:'Houston'},
    {id:'slc',label:'Salt Lake City'},{id:'nyc',label:'New York City'},
    {id:'bayarea',label:'Bay Area'},{id:'seattle',label:'Seattle'}
  ]);
  populateSelect($('ethnicity'), ETH.list, true);

  // Signals reference
  const fill = (ul, arr)=>{ ul.innerHTML = arr.map(x=>`<li>${x}</li>`).join(''); };
  fill($('signals-irl-baseline'), SIG.irl.baseline);
  fill($('signals-irl-green'), SIG.irl.green);
  fill($('signals-irl-yellow'), SIG.irl.yellow);
  fill($('signals-irl-red'), SIG.irl.red);
  fill($('signals-vir-baseline'), SIG.virtual.baseline);
  fill($('signals-vir-green'), SIG.virtual.green);
  fill($('signals-vir-yellow'), SIG.virtual.yellow);
  fill($('signals-vir-red'), SIG.virtual.red);

  // Edgy list
  $('edgy-list').innerHTML = EDGY.moves.map(m=>`
    <div class="card">
      <h3>${m.label} <span class="badge edgy">EDGY</span></h3>
      <p>${m.summary}</p>
      <p><strong>Why it works:</strong> ${m.why}</p>
      <p><strong>Risk:</strong> ${m.risk}</p>
      <p><strong>Edge:</strong> ${m.edge}</p>
      <p><strong>Safe:</strong> ${m.safe}</p>
    </div>
  `).join('');

  // City packs
  const clist = document.getElementById('cities-list');
  const renderCity = (key,title)=>{
    const pack = cityMap[key];
    const main = pack.main.map(s=>`<li><strong>${s.name}</strong> — ${s.desc}</li>`).join('');
    const alt  = pack.alt.map(s=>`<li>${s.name} — ${s.desc}</li>`).join('');
    return `<div class="card"><h3>${title}</h3><h4>Main Spots</h4><ul>${main}</ul><h4>Alt Spots</h4><ul>${alt}</ul></div>`;
  };
  clist.innerHTML = [
    renderCity('la','Los Angeles'), renderCity('vegas','Las Vegas'), renderCity('houston','Houston'),
    renderCity('slc','Salt Lake City Metro'), renderCity('nyc','New York City'),
    renderCity('bayarea','Bay Area (SF/SJ/Oakland)'), renderCity('seattle','Seattle')
  ].join('');

  // Channel toggle
  $('channel').addEventListener('change', ()=>{
    const showVirtual = $('channel').value==='Virtual';
    $('platform-field').hidden = !showVirtual;
    $('venue-field').hidden = showVirtual;
  });
  $('channel').dispatchEvent(new Event('change'));

  // Actions
  $('generate').addEventListener('click', onGenerate);
  $('shuffle').addEventListener('click', onShuffle);
  $('copy').addEventListener('click', onCopy);
  $('save').addEventListener('click', onSave);
  $('viewSaved').addEventListener('click', onViewSaved);
  $('closeSaved').addEventListener('click', ()=>$('savedDialog').close());
  $('clearSaved').addEventListener('click', onClearSaved);
}

function getOpts(){ return {
  channel:$('channel').value, archetype:$('archetype').value, venue:$('venue').value, platform:$('platform').value,
  city:$('city').value, time:$('timeOfDay').value, interest:$('interest').value,
  edgy:$('edgy').checked, includeEth:$('includeEth').checked, ethnicity:$('ethnicity').value
};}

function onGenerate(){ renderOutput(generatePlan(getOpts())); }
function onShuffle(){ renderOutput(generatePlan({...getOpts(), seed: Math.random().toString(36).slice(2)})); }

function renderOutput(plan){
  const out = document.getElementById('output');
  out.classList.add('output');
  out.innerHTML = `
<h3>Scene Setup</</h3><p>${plan.scene}</p>
<h3>Plays</h3><ul>${plan.plays.map(p=>typeof p==='string'
  ? `<li>${p}</li>` : `<li><span class="badge edgy">EDGY</span> ${p.edge}<div class="small">Safe: ${p.safe}</div></li>`).join('')}</ul>
${plan.pivot?`<h3>Pivot</h3><p>${plan.pivot}</p>`:''}
<h3>Do</h3><ul>${plan.do.map(x=>`<li>${x}</li>`).join('')}</ul>
<h3>Don’t</h3><ul>${plan.dont.map(x=>`<li>${x}</li>`).join('')}</ul>
${plan.cityNote?`<h3>Local Note</h3><p>${plan.cityNote}</p>`:''}
${plan.ethNote?`<h3>Context</h3><p>${plan.ethNote}</p>`:''}
<h3>Signals</h3><p><strong>${plan.signalTag}</strong></p>`;
  out.dataset.plan = JSON.stringify(plan);
}

async function onCopy(){
  try{ await navigator.clipboard.writeText(document.getElementById('output').innerText);
       alert('Copied plan to clipboard.'); }
  catch{ alert('Copy failed. Select text and copy manually.'); }
}

function onSave(){
  const out = document.getElementById('output');
  if(!out.dataset.plan){ alert('Generate a plan first.'); return; }
  const list = JSON.parse(localStorage.getItem('abg_saved')||'[]');
  const plan = JSON.parse(out.dataset.plan);
  plan.savedAt = new Date().toISOString();
  list.push(plan);
  localStorage.setItem('abg_saved', JSON.stringify(list));
  alert('Saved.');
}

function onViewSaved(){
  const list = JSON.parse(localStorage.getItem('abg_saved')||'[]');
  const c = document.getElementById('savedList');
  c.innerHTML = !list.length ? '<p class="small">No saved plans yet.</p>' :
    list.map(p=>`<div class="card"><div class="small">${new Date(p.savedAt).toLocaleString()}</div><div>${p.scene}</div></div>`).join('');
  document.getElementById('savedDialog').showModal();
}
function onClearSaved(){
  if(confirm('Clear all saved plans?')){
    localStorage.removeItem('abg_saved');
    document.getElementById('savedList').innerHTML = '<p class="small">Cleared.</p>';
  }
}
