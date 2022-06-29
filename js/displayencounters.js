/* eslint-disable linebreak-style */
/* eslint-disable no-console */
function decode(buffer, encoding) {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}

function invert(obj) {
  return Object.keys(obj).reduce((ret, key) => {
    ret[obj[key]] = key;
    return ret;
  }, {});
}
const AreaSlotType8 = {
  SymbolMain: 0,
  SymbolMain2: 1,
  SymbolMain3: 2,

  HiddenMain: 3, // Both HiddenMain tables include the tree/fishing slots for the area.
  HiddenMain2: 4,

  Surfing: 5,
  Surfing2: 6,
  Sky: 7,
  Sky2: 8,
  Ground: 9,
  Ground2: 10,
  Sharpedo: 11,

  OnlyFishing: 12, // More restricted hidden table that ignores the weather slots like grass Tentacool.
  Inaccessible: 13, // Shouldn't show up since these tables are not dumped.
}
// eslint-disable-next-line no-undef
const types = invert(SlotType);
const areaTypes = invert(AreaSlotType8);

const gameConvert = {
  red: 'Red',
  blue: 'Blue INTL/Green',
  yellow: 'Yellow',
  blue_jp: 'Blue JPN',
  gold: 'Gold',
  silver: 'Silver',
  crystal: 'Crystal',
  r: 'Ruby',
  s: 'Sapphire',
  e: 'Emerald',
  fr: 'FireRed',
  lg: 'LeafGreen',
  rse_swarm: 'RSE via swarm',
  d: 'Diamond',
  p: 'Pearl',
  pt: 'Platinum',
  hg: 'HeartGold',
  ss: 'SoulSilver',
  b: 'Black',
  w: 'White',
  b2: 'Black 2',
  w2: 'White 2',
  x: 'X',
  y: 'Y',
  or: 'Omega Ruby',
  as: 'Alpha Sapphire',
  sn: 'Sun',
  mn: 'Moon',
  us: 'Ultra Sun',
  um: 'Ultra Moon',
  gp: 'Let\'s Go Pikachu',
  ge: 'Let\'s Go Eevee',
  sw_symbol: 'Sword via symbol',
  sw_hidden: 'Sword via hidden',
  sh_symbol: 'Shield via symbol',
  sh_hidden: 'Shield via hidden',
  bd: 'Brilliant Diamond',
  sp: 'Shining Pearl',
  bd_underground: 'Brilliant Diamond via underground',
  sp_underground: 'Brilliant Diamond via underground',
  la: 'Legends: Arceus',
};
async function loadText() {
  const locations = {};
  const species = await fetch('./resources/text/text_species.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.red = await fetch('./resources/text/text_location_gsc.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-16le').split('\n'));
  locations.blue = locations.red;
  locations.yellow = locations.red;
  locations.blue_jp = locations.red;
  locations.gold = locations.red;
  locations.silver = locations.red;
  locations.crystal = locations.red;
  locations.r = await fetch('./resources/text/text_location_rsefrlg.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-16le').split('\n'));
  locations.s = locations.r;
  locations.e = locations.r;
  locations.fr = locations.r;
  locations.lg = locations.r;
  locations.rse_swarm = locations.r;
  locations.d = await fetch('./resources/text/text_location_hgss.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.p = locations.d;
  locations.pt = locations.d;
  locations.hg = locations.d;
  locations.ss = locations.d;
  locations.b = await fetch('./resources/text/text_location_bw2.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.w = locations.b;
  locations.b2 = locations.b;
  locations.w2 = locations.b;
  locations.x = await fetch('./resources/text/text_location_xy.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.y = locations.x;
  locations.or = locations.x;
  locations.as = locations.x;
  locations.sn = await fetch('./resources/text/text_location_sm.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.mn = locations.sn;
  locations.us = locations.sn;
  locations.um = locations.sn;
  locations.gp = await fetch('./resources/text/text_location_gg.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.ge = locations.gp;
  locations.sw_symbol = await fetch('./resources/text/text_location_swsh.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.sw_hidden = locations.sw_symbol;
  locations.sh_symbol = locations.sw_symbol;
  locations.sh_hidden = locations.sw_symbol;
  locations.bd = await fetch('./resources/text/text_location_bdsp.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locations.sp = locations.bd;
  locations.bd_underground = locations.bd;
  locations.sp_underground = locations.bd;
  locations.la = await fetch('./resources/text/text_location_la.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  return {
    locations,
    species,
  };
}
function searchSlots(text, allSlots, species) {
  document.getElementById('pokemonImg').src = `https://github.com/kwsch/PKHeX/raw/master/PKHeX.Drawing.PokeSprite/Resources/img/Big%20Pokemon%20Sprites/b_${species}.png`;
  document.getElementById('pokemonImgShiny').src = `https://github.com/kwsch/PKHeX/raw/master/PKHeX.Drawing.PokeSprite/Resources/img/Big%20Shiny%20Sprites/b_${species}s.png`;
  document.getElementById('pokemonName').textContent = text.species[species];
  document.getElementById('pokemonDexNumber').textContent = `#${species}`;
  document.getElementById('pokemonLocations').innerHTML = '';
  const seen = [];
  for (let i = 0; i < allSlots.length; i += 1) {
    const { slots } = allSlots[i];
    for (let j = 0; j < slots.length; j += 1) {
      if (species === slots[j].species) {
        const formatted = `${gameConvert[allSlots[i].game]}: ${types[allSlots[i].type] ? types[allSlots[i].type] : areaTypes[allSlots[i].slots[j].type] ? areaTypes[allSlots[i].slots[j].type] : ''}: ${text.locations[allSlots[i].game][allSlots[i].location]}<br>`;
        if (!seen.includes(formatted)) {
          document.getElementById('pokemonLocations').innerHTML += formatted;
          seen.push(formatted);
        }
      }
    }
  }
}
function displaySlots(res) {
  let allSlots = [];
  for (let i = 0; i < Object.keys(res).length; i += 1) {
    allSlots = allSlots.concat(res[Object.keys(res)[i]]);
  }
  loadText().then((result) => searchSlots(result, allSlots, Math.floor(Math.random() * 899)));
}
// eslint-disable-next-line no-undef
loadEncounters().then((result) => displaySlots(result));
