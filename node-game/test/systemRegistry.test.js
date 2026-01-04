import { createCoreSystemRegistry } from "../src/systems/systemCatalog.js";
import { createSystemRegistry } from "../src/systems/systemRegistry.js";

const baseItems = [
  {
    id: "ring",
    name: "Ring",
    equippable: true,
    equipmentSlotTypeString: "FINGER"
  },
  {
    id: "gem",
    name: "Gem",
    equippable: false
  }
];

const baseRecipes = [
  {
    id: "craft_ring",
    resultItemId: "ring",
    ingredients: { gem: 2 }
  }
];

const baseLootTables = {
  default: [{ itemId: "gem", min: 1, max: 1, chance: 1 }]
};

const baseRarityColors = {
  COMMON: "#fff"
};

describe("system registry", () => {
  test("builds runtime systems with dependencies", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", {
      create: () => ({ tag: "alpha" })
    });
    registry.registerSystem("beta", {
      dependencies: ["alpha"],
      create: ({ dependencies }) => ({ parent: dependencies.alpha.tag })
    });

    const runtime = registry.createRuntime();
    expect(runtime.getSystem("beta").parent).toBe("alpha");
    expect(runtime.listSystems()).toEqual(["alpha", "beta"]);
    expect(runtime.systems.alpha.tag).toBe("alpha");
  });

  test("supports optional dependencies without registration", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { create: () => ({ tag: "alpha" }) });
    registry.registerSystem("beta", {
      optionalDependencies: ["missing", "alpha"],
      create: ({ dependencies }) => ({ hasAlpha: Boolean(dependencies.alpha) })
    });

    const runtime = registry.createRuntime();
    expect(runtime.getSystem("beta").hasAlpha).toBe(true);
  });

  test("builds runtime systems for a subset of system names", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { create: () => ({ tag: "alpha" }) });
    registry.registerSystem("beta", {
      dependencies: ["alpha"],
      create: ({ dependencies }) => ({ parent: dependencies.alpha.tag })
    });
    registry.registerSystem("gamma", { create: () => ({ tag: "gamma" }) });

    const runtime = registry.createRuntime({ systemNames: ["beta"] });
    expect(runtime.listSystems().sort()).toEqual(["alpha", "beta"]);
    expect(runtime.getSystem("gamma").tag).toBe("gamma");
    expect(runtime.listSystems().sort()).toEqual(["alpha", "beta", "gamma"]);
  });

  test("exposes definitions, list, and remove operations", () => {
    const registry = createSystemRegistry({
      definitions: {
        alpha: { create: () => ({ tag: "alpha" }) }
      }
    });
    expect(registry.listSystems()).toEqual(["alpha"]);
    expect(registry.getDefinition("alpha").create()).toEqual({ tag: "alpha" });
    expect(registry.removeSystem("alpha")).toBe(true);
    expect(registry.listSystems()).toEqual([]);
  });

  test("rejects missing required dependencies", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { dependencies: ["missing"], create: () => ({}) });
    expect(() => registry.createRuntime()).toThrow(
      'Missing dependency "missing" for system "alpha".'
    );
  });

  test("throws when resolving an unknown system", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { create: () => ({ tag: "alpha" }) });
    const runtime = registry.createRuntime();
    expect(() => runtime.getSystem("missing")).toThrow("System not registered: missing");
  });

  test("detects circular dependencies", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { dependencies: ["beta"], create: () => ({}) });
    registry.registerSystem("beta", { dependencies: ["alpha"], create: () => ({}) });
    expect(() => registry.createRuntime()).toThrow("Circular system dependency");
  });

  test("validates definitions when registering systems", () => {
    const registry = createSystemRegistry();
    expect(() => registry.registerSystem("", { create: () => ({}) })).toThrow(
      "System name is required."
    );
    expect(() => registry.registerSystem("alpha", {})).toThrow(
      'System "alpha" must provide a create function.'
    );
  });

  test("prevents duplicate registrations unless overrides are enabled", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { create: () => ({ tag: "alpha" }) });
    expect(() => registry.registerSystem("alpha", { create: () => ({ tag: "beta" }) })).toThrow(
      'System "alpha" is already registered.'
    );

    const overrideRegistry = createSystemRegistry({ allowOverrides: true });
    overrideRegistry.registerSystem("alpha", { create: () => ({ tag: "alpha" }) });
    overrideRegistry.registerSystem("alpha", { create: () => ({ tag: "beta" }) });
    expect(overrideRegistry.createRuntime().getSystem("alpha").tag).toBe("beta");
  });

  test("rejects invalid dependency lists", () => {
    const registry = createSystemRegistry();
    expect(() =>
      registry.registerSystem("alpha", {
        dependencies: ["alpha"],
        create: () => ({})
      })
    ).toThrow('System "alpha" cannot depend on itself.');

    expect(() =>
      registry.registerSystem("beta", {
        dependencies: ["gamma"],
        optionalDependencies: ["gamma"],
        create: () => ({})
      })
    ).toThrow('System "beta" cannot mark "gamma" as both required and optional.');
  });

  test("analyzes registry dependency order and missing systems", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { create: () => ({ tag: "alpha" }) });
    registry.registerSystem("beta", {
      dependencies: ["alpha", "missing"],
      optionalDependencies: ["optional"],
      create: () => ({})
    });

    const analysis = registry.analyzeRegistry();
    expect(analysis.order).toEqual(["alpha"]);
    expect(analysis.targets.sort()).toEqual(["alpha", "beta"]);
    expect(analysis.errors).toEqual([
      {
        type: "missing",
        system: "missing",
        stack: ["beta"]
      }
    ]);
  });

  test("analyzes circular dependencies and respects optional targets", () => {
    const registry = createSystemRegistry();
    registry.registerSystem("alpha", { dependencies: ["beta"], create: () => ({}) });
    registry.registerSystem("beta", { dependencies: ["alpha"], create: () => ({}) });
    registry.registerSystem("optional", { create: () => ({}) });

    const analysis = registry.analyzeRegistry({ systemNames: ["alpha", "optional"] });
    expect(analysis.targets).toEqual(["alpha", "optional"]);
    expect(analysis.order).toEqual(["optional"]);
    expect(analysis.errors).toEqual([
      {
        type: "circular",
        chain: ["alpha", "beta", "alpha"]
      }
    ]);
  });
});

describe("core system catalog", () => {
  test("builds core runtime systems from context", () => {
    const registry = createCoreSystemRegistry();
    const runtime = registry.createRuntime({
      context: {
        items: baseItems,
        recipes: baseRecipes,
        lootTables: baseLootTables,
        rarityColors: baseRarityColors,
        equipmentSlots: ["FINGER"]
      }
    });

    const itemRegistry = runtime.getSystem("itemRegistry");
    expect(itemRegistry.getItem("ring").name).toBe("Ring");
    const craftingSystem = runtime.getSystem("craftingSystem");
    const result = craftingSystem.craftItem({ gem: 2 }, "craft_ring");
    expect(result.inventory.ring).toBe(1);
  });

  test("registers additional systems from arrays and objects", () => {
    const registry = createCoreSystemRegistry({
      additionalSystems: [
        {
          name: "alpha",
          definition: { create: () => ({ tag: "alpha" }) }
        },
        {
          name: "",
          definition: null
        }
      ]
    });
    const extendedRegistry = createCoreSystemRegistry({
      additionalSystems: {
        beta: { create: () => ({ tag: "beta" }) }
      }
    });
    const ignoredRegistry = createCoreSystemRegistry({ additionalSystems: "ignored" });

    const runtime = registry.createRuntime({ context: {} });
    const extendedRuntime = extendedRegistry.createRuntime({ context: {} });
    expect(runtime.getSystem("alpha").tag).toBe("alpha");
    expect(extendedRuntime.getSystem("beta").tag).toBe("beta");
    expect(runtime.hasSystem("")).toBe(false);
    expect(ignoredRegistry.listSystems().length).toBeGreaterThan(0);
  });
});
