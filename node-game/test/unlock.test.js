import { createUnlockSystem } from "../src/systems/unlockSystem.js";

describe("unlock system", () => {
  const unlockSystem = createUnlockSystem();
  const context = {
    attributes: { intelligence: 12 },
    inventory: { tome: 1 },
    consumedItems: ["sigil"]
  };

  test("evaluateRequirements succeeds with no requirements", () => {
    expect(unlockSystem.evaluateRequirements([], context).ok).toBe(true);
  });

  test("evaluateRequirements handles null entries", () => {
    const result = unlockSystem.evaluateRequirements([null], context);
    expect(result.ok).toBe(true);
  });

  test("attributeLevel requirement fails when below minimum", () => {
    const result = unlockSystem.evaluateRequirements(
      [{ type: "attributeLevel", attribute: "intelligence", minimum: 15 }],
      context
    );
    expect(result.ok).toBe(false);
  });

  test("attributeLevel requirement checks missing attributes", () => {
    const result = unlockSystem.evaluateRequirements(
      [{ type: "attributeLevel", attribute: "strength", minimum: 1 }],
      { ...context, attributes: {} }
    );
    expect(result.ok).toBe(false);
  });

  test("inventoryItem requirement succeeds when quantity is present", () => {
    const result = unlockSystem.evaluateRequirements(
      [{ type: "inventoryItem", itemId: "tome", quantity: 1 }],
      context
    );
    expect(result.ok).toBe(true);
  });

  test("consumeItem requirement returns consume plan", () => {
    const result = unlockSystem.evaluateRequirements(
      [{ type: "consumeItem", itemId: "tome", quantity: 1 }],
      context
    );
    expect(result.consume).toEqual([{ itemId: "tome", quantity: 1 }]);
  });

  test("consumedItem requirement checks consumed list", () => {
    const result = unlockSystem.evaluateRequirements(
      [{ type: "consumedItem", itemId: "sigil" }],
      context
    );
    expect(result.ok).toBe(true);
  });

  test("consumedItem requirement fails when missing", () => {
    const result = unlockSystem.evaluateRequirements(
      [{ type: "consumedItem", itemId: "missing" }],
      context
    );
    expect(result.ok).toBe(false);
  });

  test("allOf requirement stops on failure", () => {
    const result = unlockSystem.evaluateRequirements(
      [
        { type: "inventoryItem", itemId: "missing", quantity: 1 },
        { type: "attributeLevel", attribute: "intelligence", minimum: 10 }
      ],
      context
    );
    expect(result.ok).toBe(false);
  });

  test("anyOf requirement succeeds when one is met", () => {
    const result = unlockSystem.evaluateRequirements(
      [
        {
          type: "anyOf",
          requirements: [
            { type: "inventoryItem", itemId: "missing", quantity: 1 },
            { type: "attributeLevel", attribute: "intelligence", minimum: 10 }
          ]
        }
      ],
      context
    );
    expect(result.ok).toBe(true);
  });

  test("unknown requirement returns error", () => {
    const result = unlockSystem.evaluateRequirements([{ type: "unknown" }], context);
    expect(result.ok).toBe(false);
  });

  test("unknown requirement inside anyOf returns error", () => {
    const result = unlockSystem.evaluateRequirements(
      [
        {
          type: "anyOf",
          requirements: [{ type: "unknown" }]
        }
      ],
      context
    );
    expect(result.ok).toBe(false);
  });
});
