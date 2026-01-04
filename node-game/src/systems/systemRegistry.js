function normalizeSystemName(value) {
  return `${value}`.trim();
}

function sanitizeDependencyList(values, systemName) {
  if (!Array.isArray(values)) {
    return [];
  }
  const seen = new Set();
  return values.reduce((accumulator, value) => {
    const name = normalizeSystemName(value);
    if (!name) {
      return accumulator;
    }
    if (name === systemName) {
      throw new Error(`System "${systemName}" cannot depend on itself.`);
    }
    if (seen.has(name)) {
      return accumulator;
    }
    seen.add(name);
    accumulator.push(name);
    return accumulator;
  }, []);
}

function ensureNoOptionalOverlap(required, optional, systemName) {
  const requiredSet = new Set(required);
  const overlap = optional.find((dependency) => requiredSet.has(dependency));
  if (overlap) {
    throw new Error(
      `System "${systemName}" cannot mark "${overlap}" as both required and optional.`
    );
  }
}

function normalizeDefinition(definition, name) {
  if (!definition || typeof definition.create !== "function") {
    throw new Error(`System "${name}" must provide a create function.`);
  }
  const dependencies = sanitizeDependencyList(definition.dependencies, name);
  const optionalDependencies = sanitizeDependencyList(definition.optionalDependencies, name);
  ensureNoOptionalOverlap(dependencies, optionalDependencies, name);
  return {
    create: definition.create,
    dependencies,
    optionalDependencies
  };
}

function normalizeSystemNames(values) {
  if (values === null || values === undefined) {
    return null;
  }
  const list = Array.isArray(values) ? values : [values];
  const normalized = list.map((value) => normalizeSystemName(value)).filter(Boolean);
  return Array.from(new Set(normalized));
}

export function createSystemRegistry({ definitions, allowOverrides = false } = {}) {
  const registry = new Map();

  function registerSystem(name, definition, options = {}) {
    const systemName = normalizeSystemName(name);
    if (!systemName) {
      throw new Error("System name is required.");
    }
    const allowOverride = options.allowOverride ?? allowOverrides;
    if (registry.has(systemName) && !allowOverride) {
      throw new Error(`System "${systemName}" is already registered.`);
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

  function analyzeRegistry({ systemNames } = {}) {
    const targets = normalizeSystemNames(systemNames) ?? Array.from(registry.keys());
    const order = [];
    const errors = [];
    const visited = new Set();
    const visiting = new Set();
    const failed = new Set();

    function visit(name, stack) {
      if (!registry.has(name)) {
        errors.push({
          type: "missing",
          system: name,
          stack: [...stack]
        });
        return false;
      }
      if (visited.has(name)) {
        return true;
      }
      if (failed.has(name)) {
        return false;
      }
      if (visiting.has(name)) {
        errors.push({
          type: "circular",
          chain: [...stack, name]
        });
        return false;
      }
      visiting.add(name);
      const definition = registry.get(name);
      const nextStack = [...stack, name];
      let hasError = false;
      definition.dependencies.forEach((dependencyName) => {
        if (!visit(dependencyName, nextStack)) {
          hasError = true;
        }
      });
      definition.optionalDependencies.forEach((dependencyName) => {
        if (registry.has(dependencyName)) {
          if (!visit(dependencyName, nextStack)) {
            hasError = true;
          }
        }
      });
      visiting.delete(name);
      if (hasError) {
        failed.add(name);
        return false;
      }
      visited.add(name);
      order.push(name);
      return true;
    }

    targets.forEach((name) => {
      visit(name, []);
    });

    return Object.freeze({
      targets,
      order,
      errors
    });
  }

  function createRuntime({ context = {}, systemNames } = {}) {
    const instances = new Map();
    const visiting = new Set();
    const targets = normalizeSystemNames(systemNames);

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

    const namesToResolve = targets ?? Array.from(registry.keys());
    namesToResolve.forEach((name) => {
      resolveSystem(name);
    });

    function getSystem(name) {
      if (instances.has(name)) {
        return instances.get(name);
      }
      return resolveSystem(name);
    }

    function hasSystem(name) {
      return instances.has(name);
    }

    function listSystems() {
      return Array.from(instances.keys());
    }

    function snapshotSystems() {
      return Object.freeze(Object.fromEntries(instances));
    }

    return Object.freeze({
      get systems() {
        return snapshotSystems();
      },
      getSystem,
      hasSystem,
      listSystems
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
    analyzeRegistry,
    createRuntime
  });
}
