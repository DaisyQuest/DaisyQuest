import { normalizeSpellbookState } from "../public/state/spellbookState.js";

describe("spellbook state normalization", () => {
  test("fills slots and normalizes known spells", () => {
    const result = normalizeSpellbookState({
      knownSpells: ["fireball"],
      spellbook: { equippedSlots: ["fireball"] },
      slotCount: 3
    });

    expect(result.knownSpells).toEqual(["fireball"]);
    expect(result.spellbook.equippedSlots).toEqual(["fireball", null, null]);
  });

  test("handles empty inputs and trims slots", () => {
    const result = normalizeSpellbookState({
      knownSpells: "invalid",
      spellbook: { equippedSlots: ["spark", "rift"] },
      slotCount: 1
    });

    expect(result.knownSpells).toEqual([]);
    expect(result.spellbook.equippedSlots).toEqual(["spark"]);
  });

  test("uses existing slot length when slot count is invalid", () => {
    const result = normalizeSpellbookState({
      knownSpells: ["spark"],
      spellbook: { equippedSlots: ["spark", null] },
      slotCount: -1
    });

    expect(result.spellbook.equippedSlots).toHaveLength(2);
  });

  test("defaults to empty slots when no spellbook provided", () => {
    const result = normalizeSpellbookState();
    expect(result.knownSpells).toEqual([]);
    expect(result.spellbook.equippedSlots).toEqual([]);
  });
});
