import { createSpellRegistry } from "./systems/spellRegistry.js";
import { createSpellbookSystem } from "./systems/spellbookSystem.js";
import { createSpellUnlockRegistry } from "./systems/spellUnlockRegistry.js";

export const SPELLS = Object.freeze([
  Object.freeze({
    id: "fireball",
    name: "Fireball",
    description: "Launches a ball of fire at the target.",
    manaCost: 20,
    cooldown: 10,
    spellSpritePath: "fireball_red",
    isDefault: true,
    unlockRequirements: []
  }),
  Object.freeze({
    id: "blizzard",
    name: "Blizzard",
    description: "Creates a furious blizzard!",
    manaCost: 45,
    cooldown: 20,
    spellSpritePath: "fireball_blue",
    unlockRequirements: [
      {
        type: "attributeLevel",
        attribute: "intelligence",
        minimum: 12
      }
    ]
  }),
  Object.freeze({
    id: "thunder",
    name: "Thunder",
    description: "Thunder!!!",
    manaCost: 10,
    cooldown: 5,
    spellSpritePath: "fireball_purple",
    unlockRequirements: [
      {
        type: "inventoryItem",
        itemId: "moonsteel_ingot",
        quantity: 1
      }
    ]
  }),
  Object.freeze({
    id: "skeleton_rot",
    name: "Skeleton Rot",
    description: "Inflicts rot on the target, causing damage over time.",
    manaCost: 10,
    cooldown: 5,
    spellSpritePath: "fireball_grey",
    unlockRequirements: [
      {
        type: "consumeItem",
        itemId: "necrotic_tome",
        quantity: 1
      }
    ]
  })
]);

const spellRegistry = createSpellRegistry({ spells: SPELLS });
const spellbookSystem = createSpellbookSystem({ spellRegistry });
const spellUnlockRegistry = createSpellUnlockRegistry({ spells: SPELLS });

export const getSpellById = spellRegistry.getSpell;
export const listSpells = spellRegistry.listSpells;
export const getSpellUnlock = spellUnlockRegistry.getUnlock;
export const listSpellUnlocks = spellUnlockRegistry.listUnlocks;
export const listDefaultSpellIds = spellUnlockRegistry.listDefaultSpellIds;
export const createSpellbook = spellbookSystem.createSpellbook;
export const equipSpell = spellbookSystem.equipSpell;
export const unequipSpell = spellbookSystem.unequipSpell;
export const SPELLBOOK_SLOTS = spellbookSystem.slotCount;
