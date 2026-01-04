function sanitizeDependencyList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((value) => `${value}`.trim()).filter(Boolean);
}

function normalizeDefinition(definition, name) {
  if (!definition || typeof definition.create !== "function") {
    throw new Error(`System "${name}" must provide a create function.`);
  }
  return {
    create: definition.create,
    dependencies: sanitizeDependencyList(definition.dependencies),
    optionalDependencies: sanitizeDependencyList(definition.optionalDependencies)
  };
}

export function createSystemRegistry({ definitions } = {}) {
  const registry = new Map();

  function registerSystem(name, definition) {
    const systemName = `${name}`.trim();
    if (!systemName) {
      throw new Error("System name is required.");
    }
    const normalized = normalizeDefinition(definition, systemName);
    registry.set(systemName, normalized);
    return normalized;
  }

  function removeSystem(name) {
    return registry.delete(name);
  }

  function listSystems() {
    return Array.from(registry.keys());
  }

  function getDefinition(name) {
    return registry.get(name);
  }

  function createRuntime({ context = {} } = {}) {
    const instances = new Map();
    const visiting = new Set();

    function resolveSystem(name, stack = []) {
      if (instances.has(name)) {
        return instances.get(name);
      }
      const definition = registry.get(name);
      if (!definition) {
        throw new Error(`System not registered: ${name}`);
      }
      if (visiting.has(name)) {
        const chain = [...stack, name].join(" -> ");
        throw new Error(`Circular system dependency: ${chain}`);
      }
      visiting.add(name);
      const nextStack = [...stack, name];
      const dependencies = {};
      definition.dependencies.forEach((dependencyName) => {
        if (!registry.has(dependencyName)) {
          throw new Error(`Missing dependency "${dependencyName}" for system "${name}".`);
        }
        dependencies[dependencyName] = resolveSystem(dependencyName, nextStack);
      });
      definition.optionalDependencies.forEach((dependencyName) => {
        if (registry.has(dependencyName)) {
          dependencies[dependencyName] = resolveSystem(dependencyName, nextStack);
        }
      });
      const instance = definition.create({
        dependencies: Object.freeze({ ...dependencies }),
        context
      });
      instances.set(name, instance);
      visiting.delete(name);
      return instance;
    }

    const systems = {};
    registry.forEach((_definition, name) => {
      systems[name] = resolveSystem(name);
    });

    function getSystem(name) {
      if (Object.prototype.hasOwnProperty.call(systems, name)) {
        return systems[name];
      }
      return resolveSystem(name);
    }

    function hasSystem(name) {
      return Object.prototype.hasOwnProperty.call(systems, name);
    }

    return Object.freeze({
      systems: Object.freeze({ ...systems }),
      getSystem,
      hasSystem,
      listSystems: () => Object.keys(systems)
    });
  }

  const definitionEntries =
    definitions && typeof definitions === "object" ? Object.entries(definitions) : [];
  definitionEntries.forEach(([name, definition]) => {
    registerSystem(name, definition);
  });

  return Object.freeze({
    registerSystem,
    removeSystem,
    listSystems,
    getDefinition,
    createRuntime
  });
}
