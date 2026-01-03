import { createProgressionSystem, DND_ATTRIBUTES } from "../src/systems/progressionSystem.js";

describe("progression system", () => {
  test("createProgressionSystem defaults to DND attributes", () => {
    const system = createProgressionSystem();
    const state = system.createPlayerProgression();
    expect(Object.keys(state.attributes)).toEqual(DND_ATTRIBUTES);
  });

  test("createProgressionSystem falls back when baseAttributes sanitize empty", () => {
    const system = createProgressionSystem({ baseAttributes: [" ", ""] });
    const state = system.createPlayerProgression();
    expect(Object.keys(state.attributes)).toEqual(DND_ATTRIBUTES);
  });

  const progressionSystem = createProgressionSystem({
    linearBaseXp: 100,
    linearIncrement: 50,
    logarithmicScale: 500
  });

  test("createAttributes applies defaults and overrides", () => {
    const attributes = progressionSystem.createAttributes({ strength: 12 });
    expect(attributes.strength).toBe(12);
    expect(attributes.dexterity).toBe(10);
  });

  test("createAttributes uses defaults when omitted", () => {
    const attributes = progressionSystem.createAttributes();
    expect(attributes.strength).toBe(10);
  });

  test("createAttributes handles non-object overrides", () => {
    const attributes = progressionSystem.createAttributes(null);
    expect(attributes.strength).toBe(10);
  });

  test("createAttributes ignores non-object types", () => {
    const attributes = progressionSystem.createAttributes("invalid");
    expect(attributes.strength).toBe(10);
  });

  test("createPlayerProgression uses defaults", () => {
    const state = progressionSystem.createPlayerProgression();
    expect(state.level).toBe(1);
    expect(Object.keys(state.attributes)).toEqual(DND_ATTRIBUTES);
  });

  test("experienceForLevel handles early levels and linear scaling", () => {
    expect(progressionSystem.experienceForLevel(1)).toBe(0);
    expect(progressionSystem.experienceForLevel(2)).toBe(150);
    expect(progressionSystem.experienceForLevel(20)).toBe(1050);
  });

  test("experienceForLevel uses logarithmic scaling after the cap", () => {
    const xpAt20 = progressionSystem.experienceForLevel(20);
    const xpAt21 = progressionSystem.experienceForLevel(21);
    expect(xpAt21).toBeGreaterThan(xpAt20);
  });

  test("experienceForNextLevel derives from current level", () => {
    expect(progressionSystem.experienceForNextLevel(1)).toBe(150);
  });

  test("applyExperience ignores non-positive experience", () => {
    const state = progressionSystem.createPlayerProgression();
    const updated = progressionSystem.applyExperience(state, 0);
    expect(updated).toEqual(state);
  });

  test("applyExperience grants levels and stat points", () => {
    const state = progressionSystem.createPlayerProgression({ level: 1, experience: 0, statPoints: 0 });
    const updated = progressionSystem.applyExperience(state, 5000);
    expect(updated.level).toBeGreaterThan(1);
    expect(updated.statPoints).toBeGreaterThan(0);
  });

  test("allocateStatPoint rejects unknown attributes", () => {
    const state = progressionSystem.createPlayerProgression({ statPoints: 1 });
    const updated = progressionSystem.allocateStatPoint(state, "luck", 1);
    expect(updated.error).toBe("Unknown attribute.");
  });

  test("allocateStatPoint rejects invalid amount", () => {
    const state = progressionSystem.createPlayerProgression({ statPoints: 1 });
    const updated = progressionSystem.allocateStatPoint(state, "strength", 0);
    expect(updated.error).toBe("Invalid point amount.");
  });

  test("allocateStatPoint rejects insufficient points", () => {
    const state = progressionSystem.createPlayerProgression({ statPoints: 0 });
    const updated = progressionSystem.allocateStatPoint(state, "strength", 1);
    expect(updated.error).toBe("Not enough stat points.");
  });

  test("allocateStatPoint spends points and increases attributes", () => {
    const state = progressionSystem.createPlayerProgression({ statPoints: 2 });
    const updated = progressionSystem.allocateStatPoint(state, "strength", 2);
    expect(updated.attributes.strength).toBe(state.attributes.strength + 2);
    expect(updated.statPoints).toBe(0);
  });

  test("allocateStatPoint uses default amount", () => {
    const state = progressionSystem.createPlayerProgression({ statPoints: 1 });
    const updated = progressionSystem.allocateStatPoint(state, "strength");
    expect(updated.attributes.strength).toBe(state.attributes.strength + 1);
    expect(updated.statPoints).toBe(0);
  });
});
