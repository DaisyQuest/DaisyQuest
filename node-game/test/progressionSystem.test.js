import { createProgressionSystem } from "../src/systems/progressionSystem.js";

describe("progression system", () => {
  test("uses default thresholds when invalid", () => {
    const system = createProgressionSystem({ thresholds: [] });
    expect(system.thresholds.length).toBeGreaterThan(1);
  });

  test("uses default configuration when options omitted", () => {
    const system = createProgressionSystem();
    expect(system.thresholds.length).toBeGreaterThan(1);
  });

  test("prepends zero threshold when missing", () => {
    const system = createProgressionSystem({ thresholds: [50, 150, 300] });
    expect(system.thresholds[0]).toBe(0);
  });

  test("defaults when thresholds contain invalid entries only", () => {
    const system = createProgressionSystem({ thresholds: ["bad"] });
    expect(system.thresholds.length).toBeGreaterThan(1);
  });

  test("defaults when thresholds filter to single value", () => {
    const system = createProgressionSystem({ thresholds: [null, -5] });
    expect(system.thresholds.length).toBeGreaterThan(1);
  });

  test("builds snapshot for base XP", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 250] });
    const snapshot = system.getProgressSnapshot(0);
    expect(snapshot.level).toBe(1);
    expect(snapshot.currentXp).toBe(0);
    expect(snapshot.nextLevelXp).toBe(100);
    expect(snapshot.progress).toBe(0);
  });

  test("defaults snapshot when XP is omitted", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 250] });
    const snapshot = system.getProgressSnapshot();
    expect(snapshot.totalXp).toBe(0);
  });

  test("clamps negative XP to zero", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 250] });
    const snapshot = system.getProgressSnapshot(-50);
    expect(snapshot.totalXp).toBe(0);
  });

  test("awards XP and levels up", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 200] });
    const base = system.getProgressSnapshot(50);
    const result = system.awardXp(base, 100);
    expect(result.leveledUp).toBe(true);
    expect(result.state.level).toBe(2);
  });

  test("awards XP without leveling up", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 200] });
    const base = system.getProgressSnapshot(10);
    const result = system.awardXp(base, 20);
    expect(result.leveledUp).toBe(false);
    expect(result.state.level).toBe(1);
  });

  test("handles zero or invalid XP awards", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 200] });
    const base = system.getProgressSnapshot(0);
    const zeroResult = system.awardXp(base, 0);
    expect(zeroResult.leveledUp).toBe(false);
    expect(zeroResult.gained).toBe(0);
    const invalidResult = system.awardXp(base, Number.NaN);
    expect(invalidResult.gained).toBe(0);
  });

  test("returns error for invalid state", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 200] });
    const result = system.awardXp(null, 50);
    expect(result.error).toBe("Invalid progression state.");
  });

  test("caps progress at max threshold", () => {
    const system = createProgressionSystem({ thresholds: [0, 100, 200] });
    const snapshot = system.getProgressSnapshot(1000);
    expect(snapshot.progress).toBe(1);
    expect(snapshot.level).toBe(3);
  });
});
