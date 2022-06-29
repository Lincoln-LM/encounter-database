/* eslint-disable import/extensions */
/* eslint-disable no-console */
import { GameStrings, SlotType8Inverted, SlotTypeInverted } from './enums.js';
import { slotsAll } from './loadencounters.js';
import { locationsText, speciesText } from './text.js';

function searchSlots(species) {
  const seen = [];
  for (let i = 0; i < Object.keys(slotsAll).length; i += 1) {
    const key = Object.keys(slotsAll)[i];
    for (let j = 0; j < slotsAll[key].length; j += 1) {
      const area = slotsAll[key][j];
      const { slots } = area;
      for (let k = 0; k < slots.length; k += 1) {
        const slot = slots[k];
        if (species === slots[k].species) {
          let type = 'Overworld';
          if (area.type !== undefined) {
            type = SlotTypeInverted[area.type];
          } else if (slot.type !== undefined) {
            type = SlotType8Inverted[area.type];
          }
          const formatted = `${GameStrings[area.game]}: ${type}: ${locationsText[area.game][area.location]}<br>`;
          if (!seen.includes(formatted)) {
            seen.push(formatted);
          }
        }
      }
    }
  }
  return seen;
}
function displaySlots(searchSpecies = null) {
  let species = searchSpecies;
  if (searchSpecies == null) {
    species = Math.floor(Math.random() * 906);
  }
  const data = searchSlots(species);
  document.getElementById('pokemonImg').src = `https://github.com/kwsch/PKHeX/raw/master/PKHeX.Drawing.PokeSprite/Resources/img/Big%20Pokemon%20Sprites/b_${species}.png`;
  document.getElementById('pokemonImgShiny').src = `https://github.com/kwsch/PKHeX/raw/master/PKHeX.Drawing.PokeSprite/Resources/img/Big%20Shiny%20Sprites/b_${species}s.png`;
  document.getElementById('pokemonName').textContent = speciesText[species];
  document.getElementById('pokemonDexNumber').textContent = `#${species}`;
  document.getElementById('pokemonLocations').innerHTML = '';
  for (let i = 0; i < data.length; i += 1) {
    document.getElementById('pokemonLocations').innerHTML += data[i];
  }
}
displaySlots();
