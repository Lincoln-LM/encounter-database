/* eslint-disable linebreak-style */
/* eslint-disable no-bitwise */
/* eslint-disable no-console */

const SlotType = {
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

const u8 = 'uint8';
const u16 = ['uint16', true];
const u32 = ['uint32', true];
const identifierType = ['string', 2];
const EncounterArea1List = jBinary.Type({
  correctIdentifier: 'g1',
  EncounterArea1: jBinary.Template(
    {
      setParams(slotCount) {
        this.baseType = {
          location: u8,
          unused: u8,
          type: u8,
          rate: u8,
          slots: [
            'array',
            {
              species: u8,
              slotNum: u8,
              min: u8,
              max: u8,
            },
            slotCount,
          ],
        };
      },
    },
  ),
  read() {
    const identifier = this.binary.read(identifierType);
    if (identifier !== this.correctIdentifier) {
      console.error(identifier, '!=', this.correctIdentifier);
    }
    const areaCount = this.binary.read(u16);
    const areaSizes = [];
    const areas = [];
    let bound0 = this.binary.read(u32);
    for (let i = 0; i < areaCount; i += 1) {
      const bound1 = this.binary.read(u32);
      areaSizes.push((bound1 - bound0 - 4));
      bound0 = bound1;
    }
    for (let i = 0; i < areaSizes.length; i += 1) {
      const slotCount = areaSizes[i] / 4;
      areas.push(this.binary.read([this.EncounterArea1, slotCount]));
    }
    return areas;
  },
});

const EncounterArea2List = jBinary.Type({
  correctIdentifier: 'g2',
  EncounterArea2: jBinary.Type(
    {
      BCC_SlotRates: [20, 20, 10, 10, 5, 5, 10, 10, 5, 5],
      RatesGrass: [30, 30, 20, 10, 5, 4, 1],
      RatesSurf: [60, 30, 10],
      setParams(areaSize) {
        this.areaSize = areaSize;
      },
      read() {
        const start = this.binary.tell();
        const location = this.binary.read(u8);
        const time = this.binary.read(u8);
        const type = this.binary.read(u8);
        const rate = this.binary.read(u8);
        let rates = [];
        let slotCount = -1;
        const typeLow = type & 0xF;
        if (typeLow > SlotType.Surf && typeLow !== SlotType.BugContest) { // Not Grass/Surf/BCC
          slotCount = Math.floor(this.areaSize / 5);
          rates = this.binary.read(['array', u8, slotCount]);
        } else {
          slotCount = this.areaSize / 4;
          if (typeLow === SlotType.BugContest) {
            rates = this.BCC_SlotRates;
          } else if (typeLow === SlotType.Grass) {
            rates = this.RatesGrass;
          } else {
            rates = this.RatesSurf;
          }
        }
        const slots = this.binary.read(
          [
            'array',
            {
              species: u8,
              slotNum: u8,
              min: u8,
              max: u8,
            },
            slotCount,
          ],
        );
        const end = this.binary.tell();
        this.binary.skip(this.areaSize + 4 - (end - start));
        return {
          location,
          time,
          type,
          rate,
          rates,
          slots,
        };
      },
    },
  ),
  read() {
    const identifier = this.binary.read(identifierType);
    if (identifier !== this.correctIdentifier) {
      console.error(identifier, '!=', this.correctIdentifier);
    }
    const areaCount = this.binary.read(u16);
    const areaSizes = [];
    const areas = [];
    let bound0 = this.binary.read(u32);
    for (let i = 0; i < areaCount; i += 1) {
      const bound1 = this.binary.read(u32);
      areaSizes.push((bound1 - bound0 - 4));
      bound0 = bound1;
    }
    for (let i = 0; i < areaSizes.length; i += 1) {
      const areaSize = areaSizes[i];
      areas.push(this.binary.read([this.EncounterArea2, areaSize]));
    }
    return areas;
  },
});

const EncounterArea3List = jBinary.Type({
  correctIdentifiers: ['ru', 'sa', 'em', 'fr', 'lg'],
  EncounterArea3: jBinary.Template(
    {
      setParams(slotCount) {
        this.baseType = {
          location: u16,
          type: u8,
          rate: u8,
          slots: [
            'array',
            {
              species: u16,
              form: u8,
              slotNum: u8,
              min: u8,
              max: u8,
              magnetPullIndex: u8,
              magnetPullCount: u8,
              staticIndex: u8,
              staticCount: u8,
            },
            slotCount,
          ],
        };
      },
    },
  ),
  read() {
    const identifier = this.binary.read(identifierType);
    if (!this.correctIdentifiers.includes(identifier)) {
      console.error(identifier, '!=', this.correctIdentifiers);
    }
    const areaCount = this.binary.read(u16);
    const areaSizes = [];
    const areas = [];
    let bound0 = this.binary.read(u32);
    for (let i = 0; i < areaCount; i += 1) {
      const bound1 = this.binary.read(u32);
      areaSizes.push((bound1 - bound0 - 4));
      bound0 = bound1;
    }
    for (let i = 0; i < areaSizes.length; i += 1) {
      const slotCount = Math.floor(areaSizes[i] / 10);
      areas.push(this.binary.read([this.EncounterArea3, slotCount]));
      this.binary.skip(areaSizes[i] - slotCount * 10);
    }
    return areas;
  },
});

const EncounterArea3SwarmList = jBinary.Type({
  correctIdentifiers: ['ru', 'sa', 'rs', 'em', 'fr', 'lg'],
  EncounterArea3: jBinary.Template(
    {
      setParams(slotCount) {
        this.baseType = {
          location: u16,
          type: u8,
          rate: u8,
          slots: [
            'array',
            {
              species: u16,
              form: u8,
              slotNum: u8,
              min: u8,
              max: u8,
              moves: ['array', u16, 4],
            },
            slotCount,
          ],
        };
      },
    },
  ),
  read() {
    const identifier = this.binary.read(identifierType);
    if (!this.correctIdentifiers.includes(identifier)) {
      console.error(identifier, '!=', this.correctIdentifiers);
    }
    const areaCount = this.binary.read(u16);
    const areaSizes = [];
    const areas = [];
    let bound0 = this.binary.read(u32);
    for (let i = 0; i < areaCount; i += 1) {
      const bound1 = this.binary.read(u32);
      areaSizes.push((bound1 - bound0 - 4));
      bound0 = bound1;
    }
    for (let i = 0; i < areaSizes.length; i += 1) {
      const slotCount = Math.floor(areaSizes[i] / 14);
      areas.push(this.binary.read([this.EncounterArea3, slotCount]));
      this.binary.skip(areaSizes[i] - slotCount * 14);
    }
    return areas;
  },
});

const EncounterArea4List = jBinary.Type({
  correctIdentifiers: ['da', 'pe', 'pt', 'hg', 'ss'],
  EncounterArea4: jBinary.Template(
    {
      setParams(slotCount) {
        this.baseType = {
          location: u16,
          type: u8,
          rate: u8,
          groundTile: u16,
          slots: [
            'array',
            {
              species: u16,
              form: u8,
              slotNum: u8,
              min: u8,
              max: u8,
              magnetPullIndex: u8,
              magnetPullCount: u8,
              staticIndex: u8,
              staticCount: u8,
            },
            slotCount,
          ],
        };
      },
    },
  ),
  read() {
    const identifier = this.binary.read(identifierType);
    if (!this.correctIdentifiers.includes(identifier)) {
      console.error(identifier, '!=', this.correctIdentifiers);
    }
    const areaCount = this.binary.read(u16);
    const areaSizes = [];
    const areas = [];
    let bound0 = this.binary.read(u32);
    for (let i = 0; i < areaCount; i += 1) {
      const bound1 = this.binary.read(u32);
      areaSizes.push((bound1 - bound0 - 6));
      bound0 = bound1;
    }
    for (let i = 0; i < areaSizes.length; i += 1) {
      const slotCount = Math.floor(areaSizes[i] / 10);
      areas.push(this.binary.read([this.EncounterArea4, slotCount]));
      this.binary.skip(areaSizes[i] - slotCount * 10);
    }
    return areas;
  },
});

const EncounterAreaGen = {
  1: EncounterArea1List,
  2: EncounterArea2List,
  3: EncounterArea3List,
  4: EncounterArea4List,
  131: EncounterArea3SwarmList,
};

let slotsRD;
let slotsGN;
let slotsYW;
let slotsBU;
let slotsRBY;
let slotsRGBY;

let slotsGD;
let slotsSV;
let slotsC;
let slotsGS;
let slotsGSC;

let slotsSwarmRSE;
let slotsR;
let slotsS;
let slotsE;
let slotsFR;
let slotsLG;
let slotsRS;
let slotsRSE;
let slotsFRLG;
let slotsRSEFRLG;

let slotsD;
let slotsP;
let slotsPT;
let slotsHG;
let slotsSS;
let slotsDP;
let slotsDPPT;
let slotsHGSS;
let slotsDPPTHGSS;

function load(binary, type) {
  return binary.read(type);
}

async function loadFile(filename, encounterArea) {
  return jBinary.load(filename)
    .then((binary) => load(binary, encounterArea))
    .then();
}

async function loadGen(gen, name) {
  return loadFile(`resources/Gen${gen & 0xF}/encounter_${name}.pkl`, EncounterAreaGen[gen]);
}

async function loadEncounters() {
  slotsRD = await loadGen(1, 'red');
  slotsGN = await loadGen(1, 'blue');
  slotsYW = await loadGen(1, 'yellow');
  slotsBU = await loadGen(1, 'blue_jp');
  slotsRBY = [].concat(slotsRD, slotsGN, slotsYW);
  slotsRGBY = [].concat(slotsRBY, slotsBU);

  slotsGD = await loadGen(2, 'gold');
  slotsSV = await loadGen(2, 'silver');
  slotsC = await loadGen(2, 'crystal');
  slotsGS = [].concat(slotsGD, slotsSV);
  slotsGSC = [].concat(slotsGS, slotsC);

  slotsSwarmRSE = await loadGen(SlotType.Swarm | 3, 'rse_swarm');
  slotsR = [].concat(slotsSwarmRSE, await loadGen(3, 'r'));
  slotsS = [].concat(slotsSwarmRSE, await loadGen(3, 's'));
  slotsE = [].concat(slotsSwarmRSE, await loadGen(3, 'e'));
  slotsFR = await loadGen(3, 'fr');
  slotsLG = await loadGen(3, 'lg');
  slotsRS = [].concat(slotsR, slotsS);
  slotsRSE = [].concat(slotsRS, slotsE);
  slotsFRLG = [].concat(slotsFR, slotsLG);
  slotsRSEFRLG = [].concat(slotsFRLG, slotsRSE);

  slotsD = await loadGen(4, 'd');
  slotsP = await loadGen(4, 'p');
  slotsPT = await loadGen(4, 'pt');
  slotsHG = await loadGen(4, 'hg');
  slotsSS = await loadGen(4, 'ss');
  slotsDP = [].concat(slotsP, slotsD);
  slotsDPPT = [].concat(slotsDP, slotsPT);
  slotsHGSS = [].concat(slotsHG, slotsSS);
  slotsDPPTHGSS = [].concat(slotsDPPT, slotsHGSS);

  // const searchSpecies = 69;
  // for (let i = 0; i < slotsDPPTHGSS.length; i += 1) {
  //   const area = slotsDPPTHGSS[i];
  //   const { slots } = area;
  //   for (let slot = 0; slot < slots.length; slot += 1) {
  //     if (slots[slot].species === searchSpecies) {
  //       console.log(area, slot);
  //     }
  //   }
  // }
}
loadEncounters();
