export function decode(buffer, encoding) {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}

async function loadText() {
  const locationsText = {};
  const speciesText = await fetch('./resources/text/text_species.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.red = await fetch('./resources/text/text_location_gsc.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-16le').split('\n'));
  locationsText.blue = locationsText.red;
  locationsText.yellow = locationsText.red;
  locationsText.blue_jp = locationsText.red;
  locationsText.gold = locationsText.red;
  locationsText.silver = locationsText.red;
  locationsText.crystal = locationsText.red;
  locationsText.r = await fetch('./resources/text/text_location_rsefrlg.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-16le').split('\n'));
  locationsText.s = locationsText.r;
  locationsText.e = locationsText.r;
  locationsText.fr = locationsText.r;
  locationsText.lg = locationsText.r;
  locationsText.rse_swarm = locationsText.r;
  locationsText.d = await fetch('./resources/text/text_location_hgss.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.p = locationsText.d;
  locationsText.pt = locationsText.d;
  locationsText.hg = locationsText.d;
  locationsText.ss = locationsText.d;
  locationsText.b = await fetch('./resources/text/text_location_bw2.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.w = locationsText.b;
  locationsText.b2 = locationsText.b;
  locationsText.w2 = locationsText.b;
  locationsText.x = await fetch('./resources/text/text_location_xy.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.y = locationsText.x;
  locationsText.or = locationsText.x;
  locationsText.as = locationsText.x;
  locationsText.sn = await fetch('./resources/text/text_location_sm.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.mn = locationsText.sn;
  locationsText.us = locationsText.sn;
  locationsText.um = locationsText.sn;
  locationsText.gp = await fetch('./resources/text/text_location_gg.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.ge = locationsText.gp;
  locationsText.sw_symbol = await fetch('./resources/text/text_location_swsh.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.sw_hidden = locationsText.sw_symbol;
  locationsText.sh_symbol = locationsText.sw_symbol;
  locationsText.sh_hidden = locationsText.sw_symbol;
  locationsText.bd = await fetch('./resources/text/text_location_bdsp.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  locationsText.sp = locationsText.bd;
  locationsText.bd_underground = locationsText.bd;
  locationsText.sp_underground = locationsText.bd;
  locationsText.la = await fetch('./resources/text/text_location_la.txt').then((result) => result.arrayBuffer()).then((result) => decode(result, 'utf-8').split('\n'));
  return {
    locationsText,
    speciesText,
  };
}
export const { locationsText, speciesText } = await loadText();
