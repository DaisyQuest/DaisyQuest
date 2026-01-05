import {
  createSpellbook,
  equipSpell,
  getSpellById,
  listDefaultSpellIds,
  listSpells,
  listSpellUnlocks,
  SPELLBOOK_SLOTS,
  unequipSpell
} from "../src/spells.js";
import { createSpellbookSystem } from "../src/systems/spellbookSystem.js";

describe("spell systems", () => {
  test("spell registry returns known spells", () => {
    const spell = getSpellById("fireball");
    expect(spell.name).toBe("Fireball");
    expect(listSpells().length).toBeGreaterThan(0);
  });

  test("spell unlock registry exposes defaults", () => {
    const unlocks = listSpellUnlocks();
    expect(unlocks.length).toBeGreaterThan(0);
    expect(listDefaultSpellIds()).toContain("fireball");
  });

  test("createSpellbook normalizes slots", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    expect(book.equippedSlots).toHaveLength(SPELLBOOK_SLOTS);
  });

  test("createSpellbook uses defaults when omitted", () => {
    const book = createSpellbook();
    expect(book.knownSpells).toEqual([]);
    expect(book.equippedSlots).toHaveLength(SPELLBOOK_SLOTS);
  });

  test("createSpellbook trims excess slots with custom system", () => {
    const registry = { getSpell: () => ({ id: "fireball" }) };
    const system = createSpellbookSystem({ spellRegistry: registry, slotCount: 2 });
    const book = system.createSpellbook({
      knownSpells: ["fireball"],
      equippedSlots: ["fireball", "thunder", "blizzard"]
    });
    expect(book.equippedSlots).toEqual(["fireball", "thunder"]);
  });

  test("createSpellbookSystem defaults slot count", () => {
    const registry = { getSpell: () => ({ id: "fireball" }) };
    const system = createSpellbookSystem({ spellRegistry: registry });
    const book = system.createSpellbook({ knownSpells: ["fireball"] });
    expect(book.equippedSlots).toHaveLength(4);
  });

  test("createSpellbookSystem requires a registry", () => {
    expect(() => createSpellbookSystem()).toThrow("Spell registry is required.");
  });

  test("equipSpell rejects unknown spells", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    const updated = equipSpell(book, "missing", 0);
    expect(updated.error).toBe("Spell not found.");
  });

  test("equipSpell rejects spells not known", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    const updated = equipSpell(book, "blizzard", 0);
    expect(updated.error).toBe("Spell is not known.");
  });

  test("equipSpell rejects invalid slots", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    const updated = equipSpell(book, "fireball", -1);
    expect(updated.error).toBe("Invalid spell slot.");
  });

  test("equipSpell equips into a slot", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    const updated = equipSpell(book, "fireball", 1);
    expect(updated.equippedSlots[1]).toBe("fireball");
  });

  test("equipSpell uses default slot index", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    const updated = equipSpell(book, "fireball");
    expect(updated.equippedSlots[0]).toBe("fireball");
  });

  test("unequipSpell rejects invalid slots", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    const updated = unequipSpell(book, SPELLBOOK_SLOTS);
    expect(updated.error).toBe("Invalid spell slot.");
  });

  test("unequipSpell rejects empty slots", () => {
    const book = createSpellbook({ knownSpells: ["fireball"] });
    const updated = unequipSpell(book, 0);
    expect(updated.error).toBe("No spell equipped in that slot.");
  });

  test("unequipSpell clears equipped slot", () => {
    const book = createSpellbook({ knownSpells: ["fireball"], equippedSlots: ["fireball"] });
    const updated = unequipSpell(book, 0);
    expect(updated.equippedSlots[0]).toBeNull();
  });
});
