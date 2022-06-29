/* eslint-disable no-bitwise */
export function invert(obj) {
  return Object.keys(obj).reduce((_ret, key) => {
    const ret = _ret;
    ret[obj[key]] = key;
    return ret;
  }, {});
}

export const SlotType8 = {
  SymbolMain: 0,
  SymbolMain2: 1,
  SymbolMain3: 2,
  // Both HiddenMain tables include the tree/fishing slots for the area.
  HiddenMain: 3,
  HiddenMain2: 4,

  Surfing: 5,
  Surfing2: 6,
  Sky: 7,
  Sky2: 8,
  Ground: 9,
  Ground2: 10,
  Sharpedo: 11,

  // More restricted hidden table that ignores the weather slots like grass Tentacool.
  OnlyFishing: 12,
  // Shouldn't show up since these tables are not dumped.
  Inaccessible: 13,
};
export const SlotType8Inverted = invert(SlotType8);
export const GameStrings = {
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
export const GameStringsInverted = invert(GameStrings);
export const SlotType = {
  // Default (un-assigned) encounter slot type.
  Any: 0,

  // Slot is encountered via Grass.
  Grass: 1,

  // Slot is encountered via Surfing.
  Surf: 2,

  // Slot is encountered via Old Rod (Fishing).
  Old_Rod: 3,

  // Slot is encountered via Good Rod (Fishing).
  Good_Rod: 4,

  // Slot is encountered via Super Rod (Fishing).
  Super_Rod: 5,

  // Slot is encountered via Rock Smash.
  Rock_Smash: 6,

  // Slot is encountered via Headbutt.
  Headbutt: 7,

  // Slot is encountered via a Honey Tree.
  HoneyTree: 8,

  // Slot is encountered via the Bug Catching Contest.
  BugContest: 9,

  // Slot is encountered via Generation 5 Hidden Grotto.
  HiddenGrotto: 10,

  // GoPark: 11, UNUSED, now EncounterSlot7g

  // Slot is encountered via Generation 6 Friend Safari.
  FriendSafari: 12,

  // Slot is encountered via Generation 6 Horde Battle.
  Horde: 13,

  // Pokeradar: 14, UNUSED, don't need to differentiate Gen4 Radar Slots

  // Slot is encountered via Generation 7 SOS triggers only.
  SOS: 15,

  // Legends: Arceus
  Overworld: 16,
  Distortion: 17,
  Landmark: 18,
  OverworldMass: 19,
  OverworldMMO: 20,

  // Modifiers

  // Used to differentiate the two types of headbutt tree encounters.
  Special: 1 << 6,

  // Used to identify encounters that are triggered via alternate ESV proc calculations.
  Swarm: 1 << 7,
};
export const SlotTypeInverted = invert(SlotType);
