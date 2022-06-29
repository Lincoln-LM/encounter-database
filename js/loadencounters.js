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
// TODO: be more dry
const EncounterArea1List = jBinary.Type({
  correctIdentifier: 'g1',
  EncounterArea1: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
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
      read() {
        const result = this.baseRead();
        result.game = this.game;
        delete result.unused;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      areas.push(this.binary.read([this.EncounterArea1, slotCount, this.game]));
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
      setParams(areaSize, game) {
        this.areaSize = areaSize;
        this.game = game;
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
          game: this.game,
        };
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      areas.push(this.binary.read([this.EncounterArea2, areaSize, this.game]));
    }
    return areas;
  },
});

const EncounterArea3List = jBinary.Type({
  correctIdentifiers: ['ru', 'sa', 'em', 'fr', 'lg'],
  EncounterArea3: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
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
      read() {
        const result = this.baseRead();
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      areas.push(this.binary.read([this.EncounterArea3, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 10);
    }
    return areas;
  },
});

const EncounterArea3SwarmList = jBinary.Type({
  correctIdentifiers: ['ru', 'sa', 'rs', 'em', 'fr', 'lg'],
  EncounterArea3Swarm: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
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
      read() {
        const result = this.baseRead();
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      areas.push(this.binary.read([this.EncounterArea3Swarm, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 14);
    }
    return areas;
  },
});

const EncounterArea4List = jBinary.Type({
  correctIdentifiers: ['da', 'pe', 'pt', 'hg', 'ss'],
  EncounterArea4: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
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
      read() {
        const result = this.baseRead();
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      areas.push(this.binary.read([this.EncounterArea4, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 10);
    }
    return areas;
  },
});

const EncounterArea5List = jBinary.Type({
  correctIdentifiers: ['51', '52'],
  EncounterArea5: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
        this.baseType = {
          location: u16,
          type: u8,
          unused: u8,
          slots: [
            'array',
            {
              species: u16,
              min: u8,
              max: u8,
            },
            slotCount,
          ],
        };
      },
      read() {
        const result = this.baseRead();
        for (let i = 0; i < result.slots.length; i += 1) {
          result.slots[i].form = result.slots[i].species >>> 11;
          result.slots[i].species &= 0x3FF;
        }
        delete result.unused;
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      const slotCount = Math.floor(areaSizes[i] / 4);
      areas.push(this.binary.read([this.EncounterArea5, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 4);
    }
    return areas;
  },
});

const EncounterArea6List = jBinary.Type({
  correctIdentifiers: ['xy', 'ao'],
  EncounterArea6: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
        this.baseType = {
          location: u16,
          type: u8,
          unused: u8,
          slots: [
            'array',
            {
              species: u16,
              min: u8,
              max: u8,
            },
            slotCount,
          ],
        };
      },
      read() {
        const result = this.baseRead();
        for (let i = 0; i < result.slots.length; i += 1) {
          result.slots[i].form = result.slots[i].species >>> 11;
          result.slots[i].species &= 0x3FF;
        }
        delete result.unused;
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      const slotCount = Math.floor(areaSizes[i] / 4);
      areas.push(this.binary.read([this.EncounterArea6, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 4);
    }
    return areas;
  },
});

const EncounterAreaFriendSafari = {
  species: [
    2, 5, 8, 12, 14, 16, 21, 25, 27, 35,
    38, 39, 43, 44, 46, 49, 49, 51, 56, 58,
    61, 63, 67, 77, 82, 83, 84, 87, 89, 91,
    95, 96, 98, 101, 105, 112, 113, 114, 125, 126,
    127, 130, 131, 132, 133, 148, 163, 165, 168, 175,
    178, 184, 190, 191, 194, 195, 202, 203, 205, 206,
    209, 213, 214, 215, 215, 216, 218, 219, 221, 222,
    224, 225, 227, 231, 235, 236, 247, 262, 267, 268,
    274, 281, 284, 286, 290, 294, 297, 299, 302, 303,
    303, 307, 310, 313, 314, 317, 323, 326, 328, 332,
    336, 342, 352, 353, 356, 357, 359, 361, 363, 372,
    375, 400, 404, 415, 417, 419, 423, 426, 437, 442,
    444, 447, 452, 454, 459, 506, 510, 511, 513, 515,
    517, 520, 523, 525, 527, 530, 531, 536, 538, 539,
    541, 544, 548, 551, 556, 557, 561, 569, 572, 575,
    578, 581, 586, 587, 596, 597, 600, 608, 611, 614,
    618, 619, 621, 623, 624, 627, 629, 636, 651, 654,
    657, 660, 662, 662, 668, 673, 674, 677, 682, 684,
    686, 689, 694, 701, 702, 702, 705, 707, 708, 710,
    712, 714,
  ],
  read(game) {
    const data = {
      location: 148,
      type: SlotType.FriendSafari,
      slots: [],
      game,
    };
    for (let i = 0; i < this.species.length; i += 1) {
      data.slots.push({
        species: this.species[i],
        form: 0,
        min: 30,
        max: 30,
      });
    }
    // Floette R/B/Y
    data.slots.push({
      species: 670,
      form: 0,
      min: 30,
      max: 30,
    });
    data.slots.push({
      species: 670,
      form: 1,
      min: 30,
      max: 30,
    });
    data.slots.push({
      species: 670,
      form: 3,
      min: 30,
      max: 30,
    });
    // Vivillon
    data.slots.push({
      species: 666,
      form: 30,
      min: 30,
      max: 30,
    });
    return [data];
  },
};

const EncounterArea7List = jBinary.Type({
  correctIdentifiers: ['sm', 'uu'],
  EncounterArea7: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
        this.baseType = {
          location: u16,
          type: u8,
          unused: u8,
          slots: [
            'array',
            {
              species: u16,
              min: u8,
              max: u8,
            },
            slotCount,
          ],
        };
      },
      read() {
        const result = this.baseRead();
        for (let i = 0; i < result.slots.length; i += 1) {
          result.slots[i].form = result.slots[i].species >>> 11;
          result.slots[i].species &= 0x3FF;
        }
        delete result.unused;
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      const slotCount = Math.floor(areaSizes[i] / 4);
      areas.push(this.binary.read([this.EncounterArea7, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 4);
    }
    return areas;
  },
});

const EncounterArea7bList = jBinary.Type({
  correctIdentifier: 'gg',
  EncounterArea7b: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
        this.baseType = {
          location: u16,
          slots: [
            'array',
            {
              species: u16,
              min: u8,
              max: u8,
            },
            slotCount,
          ],
        };
      },
      read() {
        const result = this.baseRead();
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
  read() {
    const identifier = this.binary.read(identifierType);
    if (this.correctIdentifier !== identifier) {
      console.error(identifier, '!=', this.correctIdentifier);
    }
    const areaCount = this.binary.read(u16);
    const areaSizes = [];
    const areas = [];
    let bound0 = this.binary.read(u32);
    for (let i = 0; i < areaCount; i += 1) {
      const bound1 = this.binary.read(u32);
      areaSizes.push((bound1 - bound0 - 2));
      bound0 = bound1;
    }
    for (let i = 0; i < areaSizes.length; i += 1) {
      const slotCount = Math.floor(areaSizes[i] / 4);
      areas.push(this.binary.read([this.EncounterArea7b, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 4);
    }
    return areas;
  },
});

const EncounterArea8List = jBinary.Type({
  correctIdentifiers: ['sw', 'sh'],
  EncounterArea8: jBinary.Type(
    {
      read() {
        const location = this.binary.read(u8);
        const slotCount = this.binary.read(u8);
        const slots = [];
        let ctr = 0;
        do {
          const weather = this.binary.read(u16);
          const min = this.binary.read(u8);
          const max = this.binary.read(u8);
          const count = this.binary.read(u8);
          const type = this.binary.read(u8);
          for (let i = 0; i < count; i += 1, ctr += 1) {
            let species = this.binary.read(u16);
            const form = species >>> 11;
            species &= 0x3FF;
            slots.push({
              species,
              form,
              min,
              max,
              weather,
              type,
            });
          }
        } while (ctr !== slotCount);
        return {
          location,
          slots,
          game: this.game,
        };
      },
      setParams(game) {
        this.game = game;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
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
      const start = this.binary.tell();
      areas.push(this.binary.read([this.EncounterArea8, this.game]));
      this.binary.skip(areaSizes[i] + 4 - (this.binary.tell() - start));
    }
    return areas;
  },
});

const EncounterArea8bList = jBinary.Type({
  correctIdentifier: 'bs',
  EncounterArea8b: jBinary.Template(
    {
      setParams(slotCount, game) {
        this.game = game;
        this.baseType = {
          location: u16,
          type: u8,
          unused: u8,
          slots: [
            'array',
            {
              species: u16,
              min: u8,
              max: u8,
            },
            slotCount,
          ],
        };
      },
      read() {
        const result = this.baseRead();
        for (let i = 0; i < result.slots.length; i += 1) {
          result.slots[i].form = result.slots[i].species >>> 11;
          result.slots[i].species &= 0x3FF;
        }
        delete result.unused;
        result.game = this.game;
        return result;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
  read() {
    const identifier = this.binary.read(identifierType);
    if (this.correctIdentifier !== identifier) {
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
      const slotCount = Math.floor(areaSizes[i] / 4);
      areas.push(this.binary.read([this.EncounterArea8b, slotCount, this.game]));
      this.binary.skip(areaSizes[i] - slotCount * 4);
    }
    return areas;
  },
});

const EncounterArea8aList = jBinary.Type({
  correctIdentifier: 'la',
  EncounterArea8a: jBinary.Type(
    {
      read() {
        const locationCount = this.binary.read(u8);
        const locations = this.binary.read(['array', u8, locationCount]);
        const location = locations[0];

        if ((locationCount & 0b1) === 0) {
          this.binary.read(u8);
        }
        const type = this.binary.read(u8) + SlotType.Overworld;
        const count = this.binary.read(u8);
        const slots = this.binary.read([
          'array',
          {
            species: u16,
            form: u8,
            alpha: u8,
            min: u8,
            max: u8,
            gender: u8,
            flawless: u8,
          },
          count,
        ]);
        return {
          locations,
          location,
          type,
          slots,
          game: this.game,
        };
      },
      setParams(game) {
        this.game = game;
      },
    },
  ),
  setParams(game) {
    this.game = game;
  },
  read() {
    const identifier = this.binary.read(identifierType);
    if (this.correctIdentifier !== identifier) {
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
      const start = this.binary.tell();
      areas.push(this.binary.read([this.EncounterArea8a, this.game]));
      this.binary.skip(areaSizes[i] + 4 - (this.binary.tell() - start));
    }
    return areas;
  },
});

const EncounterAreaGen = {
  1: EncounterArea1List,
  2: EncounterArea2List,
  3: EncounterArea3List,
  4: EncounterArea4List,
  5: EncounterArea5List,
  6: EncounterArea6List,
  7: EncounterArea7List,
  7.5: EncounterArea7bList,
  8: EncounterArea8List,
  8.5: EncounterArea8bList,
  8.75: EncounterArea8aList,
  131: EncounterArea3SwarmList,
};

function load(binary, type) {
  return binary.read(type);
}

async function loadFile(filename, encounterArea) {
  return jBinary.load(filename)
    .then((binary) => load(binary, encounterArea))
    .then();
}

async function loadGen(gen, name) {
  // & 0xF corrects gen 3 swarms and lgpe/bdsp/pla to use the correct folders
  return loadFile(`resources/Gen${gen & 0xF}/encounter_${name}.pkl`, [EncounterAreaGen[gen], name]);
}

async function loadEncounters() {
  return {
    slotsRD: await loadGen(1, 'red'),
    slotsGN: await loadGen(1, 'blue'),
    slotsYW: await loadGen(1, 'yellow'),
    slotsBU: await loadGen(1, 'blue_jp'),
    // slotsRBY: [].concat(slotsRD, slotsGN, slotsYW),
    // slotsRGBY: [].concat(slotsRBY, slotsBU),

    slotsGD: await loadGen(2, 'gold'),
    slotsSV: await loadGen(2, 'silver'),
    slotsC: await loadGen(2, 'crystal'),
    // slotsGS: [].concat(slotsGD, slotsSV),
    // slotsGSC: [].concat(slotsGS, slotsC),

    slotsSwarmRSE: await loadGen(SlotType.Swarm | 3, 'rse_swarm'),
    slotsR: await loadGen(3, 'r'),
    slotsS: await loadGen(3, 's'),
    slotsE: await loadGen(3, 'e'),
    slotsFR: await loadGen(3, 'fr'),
    slotsLG: await loadGen(3, 'lg'),
    // slotsRS: [].concat(slotsR, slotsS),
    // slotsRSE: [].concat(slotsRS, slotsE),
    // slotsFRLG: [].concat(slotsFR, slotsLG),
    // slotsRSEFRLG: [].concat(slotsFRLG, slotsRSE),

    slotsD: await loadGen(4, 'd'),
    slotsP: await loadGen(4, 'p'),
    slotsPT: await loadGen(4, 'pt'),
    slotsHG: await loadGen(4, 'hg'),
    slotsSS: await loadGen(4, 'ss'),
    // slotsDP: [].concat(slotsP, slotsD),
    // slotsDPPT: [].concat(slotsDP, slotsPT),
    // slotsHGSS: [].concat(slotsHG, slotsSS),
    // slotsDPPTHGSS: [].concat(slotsDPPT, slotsHGSS),

    slotsB: await loadGen(5, 'b'),
    slotsW: await loadGen(5, 'w'),
    slotsB2: await loadGen(5, 'b2'),
    slotsW2: await loadGen(5, 'w2'),
    // slotsBW: [].concat(slotsB, slotsW),
    // slotsB2W2: [].concat(slotsB2, slotsW2),
    // slotsBWB2W2: [].concat(slotsBW, slotsB2W2),

    slotsX: [].concat(await loadGen(6, 'x'), EncounterAreaFriendSafari.read('x')),
    slotsY: [].concat(await loadGen(6, 'y'), EncounterAreaFriendSafari.read('y')),
    slotsOR: await loadGen(6, 'or'),
    slotsAS: await loadGen(6, 'as'),
    // slotsXY: [].concat(slotsX, slotsY),
    // slotsORAS: [].concat(slotsOR, slotsAS),
    // slotsXYORAS: [].concat(slotsXY, slotsORAS),

    slotsSN: await loadGen(7, 'sn'),
    slotsMN: await loadGen(7, 'mn'),
    slotsUS: await loadGen(7, 'us'),
    slotsUM: await loadGen(7, 'um'),
    // slotsSNMN: [].concat(slotsSN, slotsMN),
    // slotsUSUM: [].concat(slotsUS, slotsUM),
    // slotsSNMNUSUM: [].concat(slotsSNMN, slotsUSUM),

    slotsGP: await loadGen(7.5, 'gp'),
    slotsGE: await loadGen(7.5, 'ge'),
    // slotsGPGE: [].concat(slotsGP, slotsGE),

    slotsSWSymbol: await loadGen(8, 'sw_symbol'),
    slotsSWHidden: await loadGen(8, 'sw_hidden'),
    slotsSHSymbol: await loadGen(8, 'sh_symbol'),
    slotsSHHidden: await loadGen(8, 'sh_hidden'),
    // slotsSW: [].concat(slotsSWSymbol, slotsSWHidden),
    // slotsSH: [].concat(slotsSHSymbol, slotsSHHidden),
    // slotsSWSH: [].concat(slotsSW, slotsSH),

    slotsBDOW: await loadGen(8.5, 'bd'),
    slotsSPOW: await loadGen(8.5, 'sp'),
    slotsBDUG: await loadGen(8.5, 'bd_underground'),
    slotsSPUG: await loadGen(8.5, 'sp_underground'),
    // slotsBD: [].concat(slotsBDOW, slotsBDUG),
    // slotsSP: [].concat(slotsSPOW, slotsSPUG),
    // slotsBDSP: [].concat(slotsBD, slotsSP),

    slotsLA: await loadGen(8.75, 'la'),
  };
}
