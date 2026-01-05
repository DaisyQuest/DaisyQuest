import { JSDOM } from "jsdom";
import { buildSkillList, buildWeaponAttackList } from "../src/battle.js";
import { renderCombatActionList } from "../public/ui/combatActions.js";

const buildConfig = (overrides) => ({
  weaponAttacks: {
    minSlots: 2,
    maxSlots: 5,
    fallbackLabels: ["Fallback One", "Fallback Two"]
  },
  skills: {
    slots: 5,
    entries: [{ label: "Configured Skill" }],
    fallbackLabelPrefix: "Skill"
  },
  ...overrides
});

afterEach(() => {
  delete global.document;
});

describe("combat action list builders", () => {
  test("buildWeaponAttackList clamps weapon attacks to max", () => {
    const weapon = { weaponAttacks: ["A", "B", "C", "D", "E", "F"] };
    const list = buildWeaponAttackList({ weapon, config: buildConfig() });

    expect(list).toHaveLength(5);
    expect(list.map((entry) => entry.label)).toEqual(["A", "B", "C", "D", "E"]);
  });

  test("buildWeaponAttackList pads with fallback and placeholders", () => {
    const weapon = { weaponAttacks: ["Quick Jab"] };
    const config = buildConfig({
      weaponAttacks: {
        minSlots: 3,
        maxSlots: 4,
        fallbackLabels: ["Fallback Strike"]
      }
    });
    const list = buildWeaponAttackList({ weapon, config });

    expect(list).toHaveLength(3);
    expect(list.map((entry) => entry.label)).toEqual([
      "Quick Jab",
      "Fallback Strike",
      "Strike 3"
    ]);
  });

  test("buildWeaponAttackList defaults to minimum slots when config is invalid", () => {
    const config = buildConfig({ weaponAttacks: { minSlots: 0, maxSlots: 10 } });
    const list = buildWeaponAttackList({ weapon: { weaponAttacks: [] }, config });

    expect(list).toHaveLength(2);
    expect(list[0].action).toBe("attack");
  });

  test("buildWeaponAttackList handles non-array labels and missing max slots", () => {
    const config = buildConfig({
      weaponAttacks: { minSlots: 2, fallbackLabels: "not-an-array" }
    });
    const list = buildWeaponAttackList({ weapon: { weaponAttacks: "invalid" }, config });

    expect(list).toHaveLength(2);
    expect(list.map((entry) => entry.label)).toEqual(["Strike 1", "Strike 2"]);
  });

  test("buildWeaponAttackList ignores extra fallback labels", () => {
    const weapon = { weaponAttacks: ["Slice"] };
    const config = buildConfig({
      weaponAttacks: {
        minSlots: 2,
        maxSlots: 5,
        fallbackLabels: ["Backup One", "Backup Two", "Backup Three"]
      }
    });
    const list = buildWeaponAttackList({ weapon, config });

    expect(list.map((entry) => entry.label)).toEqual(["Slice", "Backup One"]);
  });

  test("buildWeaponAttackList falls back when config is missing", () => {
    const list = buildWeaponAttackList();

    expect(list).toHaveLength(2);
    expect(list.map((entry) => entry.label)).toEqual(["Swift Strike", "Rising Cut"]);
  });

  test("buildWeaponAttackList uses placeholders when config is null", () => {
    const list = buildWeaponAttackList({ config: null });

    expect(list.map((entry) => entry.label)).toEqual(["Strike 1", "Strike 2"]);
  });

  test("buildWeaponAttackList filters invalid weapon labels", () => {
    const weapon = { weaponAttacks: ["Clean Cut", "", 42, "  ", "Heavy Swing"] };
    const list = buildWeaponAttackList({
      weapon,
      config: buildConfig({ weaponAttacks: { minSlots: 2, maxSlots: 5, fallbackLabels: [] } })
    });

    expect(list.map((entry) => entry.label)).toEqual(["Clean Cut", "Heavy Swing"]);
  });

  test("buildSkillList uses configured slots and trims entries", () => {
    const config = buildConfig({
      skills: {
        slots: 3,
        entries: [{ label: " Skill One " }, { label: "Skill Two" }, { label: "Skill Three" }],
        fallbackLabelPrefix: "Skill"
      }
    });
    const list = buildSkillList({ config });

    expect(list).toHaveLength(3);
    expect(list.map((entry) => entry.label)).toEqual(["Skill One", "Skill Two", "Skill Three"]);
  });

  test("buildSkillList fills with fallback entries and placeholders", () => {
    const config = buildConfig({
      skills: {
        slots: 4,
        entries: [{ label: "Fallback Alpha" }, { label: "" }, { label: "Fallback Beta" }],
        fallbackLabelPrefix: "Ability"
      }
    });
    const list = buildSkillList({ entries: [{ label: "Primary" }], config });

    expect(list).toHaveLength(4);
    expect(list.map((entry) => entry.label)).toEqual([
      "Primary",
      "Fallback Alpha",
      "Fallback Beta",
      "Ability 4"
    ]);
  });

  test("buildSkillList falls back to default slots when config is invalid", () => {
    const list = buildSkillList({ config: buildConfig({ skills: { slots: 0, entries: [] } }) });

    expect(list).toHaveLength(5);
    expect(list[0].label).toBe("Skill 1");
  });

  test("buildSkillList creates placeholders when entries are missing", () => {
    const list = buildSkillList({
      config: buildConfig({ skills: { slots: 2, entries: null, fallbackLabelPrefix: "Move" } })
    });

    expect(list).toHaveLength(2);
    expect(list.map((entry) => entry.label)).toEqual(["Move 1", "Move 2"]);
  });

  test("buildSkillList stops at slot count even with extra fallback entries", () => {
    const config = buildConfig({
      skills: {
        slots: 2,
        entries: [{ label: "Fallback One" }, { label: "Fallback Two" }, { label: "Fallback Three" }],
        fallbackLabelPrefix: "Skill"
      }
    });
    const list = buildSkillList({ entries: [{ label: "Primary" }], config });

    expect(list.map((entry) => entry.label)).toEqual(["Primary", "Fallback One"]);
  });

  test("buildSkillList uses default prefix when config is missing", () => {
    const list = buildSkillList({ config: null });

    expect(list).toHaveLength(5);
    expect(list[0].label).toBe("Skill 1");
  });

  test("buildSkillList defaults to combat configuration when omitted", () => {
    const list = buildSkillList();

    expect(list).toHaveLength(5);
    expect(list[0].label).toBe("Ember Surge");
  });

  test("buildSkillList filters invalid entries when skills are null", () => {
    const list = buildSkillList({
      entries: [{ label: 12 }, null, { label: "Valid" }],
      config: buildConfig({ skills: null })
    });

    expect(list[0].label).toBe("Valid");
  });
});

describe("combat action rendering", () => {
  test("renderCombatActionList returns empty when container is missing", () => {
    const buttons = renderCombatActionList({
      container: null,
      entries: [{ label: "Slash", action: "attack" }]
    });

    expect(buttons).toEqual([]);
  });

  test("renderCombatActionList renders buttons and disables placeholders", () => {
    const dom = new JSDOM('<div id="weapon"></div><div id="skills"></div>');
    global.document = dom.window.document;

    const weaponContainer = dom.window.document.getElementById("weapon");
    const skillContainer = dom.window.document.getElementById("skills");
    const actions = [];

    const weaponButtons = renderCombatActionList({
      container: weaponContainer,
      entries: [
        { label: "Slash", action: "attack" },
        { label: "Thrust", action: "attack" }
      ],
      onAction: (action) => actions.push(action)
    });
    const skillButtons = renderCombatActionList({
      container: skillContainer,
      entries: [{ label: "Recover", action: "heal" }, { label: "Empty Slot" }],
      onAction: (action) => actions.push(action)
    });

    expect(weaponContainer.querySelectorAll("button.action")).toHaveLength(2);
    expect(skillContainer.querySelectorAll("button.action")).toHaveLength(2);
    expect(skillContainer.querySelector(".action--placeholder").disabled).toBe(true);
    expect(weaponButtons).toHaveLength(2);
    expect(skillButtons).toHaveLength(1);

    weaponButtons[0].click();
    skillButtons[0].click();

    expect(actions).toEqual(["attack", "heal"]);
  });

  test("renderCombatActionList handles missing labels and entries", () => {
    const dom = new JSDOM('<div id="empty"></div>');
    global.document = dom.window.document;

    const container = dom.window.document.getElementById("empty");
    const buttons = renderCombatActionList({ container, entries: [ { action: "attack" } ] });

    expect(buttons).toHaveLength(1);
    expect(container.querySelector("button").textContent).toBe("Unknown");
  });

  test("renderCombatActionList handles undefined entries", () => {
    const dom = new JSDOM('<div id="undefined"></div>');
    global.document = dom.window.document;

    const container = dom.window.document.getElementById("undefined");
    const buttons = renderCombatActionList({ container });

    expect(buttons).toEqual([]);
  });

  test("renderCombatActionList stores base labels without a handler", () => {
    const dom = new JSDOM('<div id="solo"></div>');
    global.document = dom.window.document;

    const container = dom.window.document.getElementById("solo");
    const buttons = renderCombatActionList({
      container,
      entries: [{ label: "Solo Strike", action: "attack" }]
    });

    expect(buttons).toHaveLength(1);
    expect(container.querySelector("button").dataset.baseLabel).toBe("Solo Strike");
  });
});
