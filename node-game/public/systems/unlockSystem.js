export function createUnlockSystem() {
  function evaluateRequirement(requirement, context) {
    const { attributes, inventory, consumedItems } = context;
    if (!requirement) {
      return { ok: true, consume: [] };
    }
    switch (requirement.type) {
      case "attributeLevel": {
        const current = attributes[requirement.attribute] ?? 0;
        if (current < requirement.minimum) {
          return {
            ok: false,
            reason: `Requires ${requirement.attribute} ${requirement.minimum}.`,
            consume: []
          };
        }
        return { ok: true, consume: [] };
      }
      case "inventoryItem": {
        const current = inventory[requirement.itemId] ?? 0;
        if (current < requirement.quantity) {
          return {
            ok: false,
            reason: `Requires ${requirement.quantity} ${requirement.itemId}.`,
            consume: []
          };
        }
        return { ok: true, consume: [] };
      }
      case "consumeItem": {
        const current = inventory[requirement.itemId] ?? 0;
        if (current < requirement.quantity) {
          return {
            ok: false,
            reason: `Requires ${requirement.quantity} ${requirement.itemId}.`,
            consume: []
          };
        }
        return {
          ok: true,
          consume: [{ itemId: requirement.itemId, quantity: requirement.quantity }]
        };
      }
      case "consumedItem": {
        if (!consumedItems.includes(requirement.itemId)) {
          return {
            ok: false,
            reason: `Requires consumed ${requirement.itemId}.`,
            consume: []
          };
        }
        return { ok: true, consume: [] };
      }
      case "allOf": {
        const consume = [];
        for (const entry of requirement.requirements) {
          const result = evaluateRequirement(entry, context);
          if (!result.ok) {
            return result;
          }
          consume.push(...result.consume);
        }
        return { ok: true, consume };
      }
      case "anyOf": {
        const consume = [];
        for (const entry of requirement.requirements) {
          const result = evaluateRequirement(entry, context);
          if (result.ok) {
            consume.push(...result.consume);
            return { ok: true, consume };
          }
        }
        return { ok: false, reason: "No unlock requirements met.", consume: [] };
      }
      default:
        return { ok: false, reason: "Unknown unlock requirement.", consume: [] };
    }
  }

  function evaluateRequirements(requirements, context) {
    if (!requirements || requirements.length === 0) {
      return { ok: true, consume: [] };
    }
    return evaluateRequirement({ type: "allOf", requirements }, context);
  }

  return Object.freeze({
    evaluateRequirements
  });
}
