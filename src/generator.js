import { DATA } from '../data/archetypes.js';
import { VENUES } from '../data/venues.js';
import { PLATS } from '../data/platforms.js';
import { ETH } from '../data/ethnicity.js';
import { EDGY } from '../data/edgy.js';

import { CITIES } from '../data/cities/la.js';
import { CITY_VEGAS } from '../data/cities/vegas.js';
import { CITY_HOUSTON } from '../data/cities/houston.js';
import { CITY_SLC } from '../data/cities/slc.js';
import { CITY_NYC } from '../data/cities/nyc.js';
import { CITY_BAY } from '../data/cities/bayarea.js';
import { CITY_SEA } from '../data/cities/seattle.js';

const CITY_MAP = { la:CITIES, vegas:CITY_VEGAS, houston:CITY_HOUSTON, slc:CITY_SLC, nyc:CITY_NYC, bayarea:CITY_BAY, seattle:CITY_SEA };

function pick(arr, seed){
  if(!arr || !arr.length) return '';
  if(!seed) return arr[Math.floor(Math.random()*arr.length)];
  const h = [...seed].reduce((a,c)=>a+c.charCodeAt(0),0);
  return arr[h % arr.length];
}

export function generatePlan(opts){
  const { channel, archetype, venue, platform, city, edgy, includeEth, ethnicity, seed } = opts;

  const arch = DATA.archetypes.find(a=>a.id===archetype) || DATA.archetypes[0];
  const ven  = VENUES.venues.find(v=>v.id===venue) || VENUES.venues[0];
  const plat = PLATS.platforms.find(p=>p.id===platform) || PLATS.platforms[0];
  const cityPack = CITY_MAP[city];
  const eth  = ETH.list.find(e=>e.id===ethnicity);

  const isVirtual = channel==='Virtual';
  let scene='', plays=[], pivot='', doList=[], dontList=[], cityNote='', ethNote='';

  if(isVirtual){
    scene = `${plat.label}: keep it short and specific. Reference her content.`;
    const entry = pick(plat.sample.safe, seed) || 'Open light and context-specific.';
    plays = [entry];
    doList = ['Be specific','Use platform norms','Offer 2 time options'];
    dontList = ['Don’t spam','Don’t send paragraphs'];
    pivot = 'Suggest a quick call or 2 clear IRL options.';
  }else{
    scene = `${ven.scene_setup} Tone: ${arch.tone.energy}/${arch.tone.pace}.`;
    const opener = pick([...(arch.openers||[]), ...(ven.openers||[])], seed) || 'Open with a short observation.';
    const pivotLine = pick(ven.pivots || ['Pivot to a quieter spot or short walk.'], seed);
    plays = [opener];
    pivot = pivotLine;
    doList = [...(ven.do||[]), ...(arch.safe_topics? ['Hit topics: '+arch.safe_topics.slice(0,3).join(', ')] : [])];
    dontList = [...(ven.dont||[]), ...(arch.pitfalls||[]).slice(0,1)];
  }

  if(cityPack){
    const spot = pick(cityPack.main, seed);
    const alt  = pick(cityPack.alt, seed);
    cityNote = `Try ${spot?.name}${spot? ' — '+spot.desc:''}. Alt: ${alt?.name}.`;
  }

  if(edgy){
    const m = pick(EDGY.moves, seed);
    if(m) plays.push({edge:m.edge, safe:m.safe});
  }

  if(includeEth && eth){
    ethNote = `${eth.vibe} Easy pivot: ${eth.pivot}. Avoid: ${eth.pitfall}.`;
  }

  const signalTag = '⚪ Baseline • Build comfort';
  return { scene, plays, pivot, do: doList, dont: dontList, cityNote, ethNote, signalTag };
}
