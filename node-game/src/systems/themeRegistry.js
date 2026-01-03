const FALLBACK_THEME = Object.freeze({
  name: "aurora",
  label: "Aurora Bloom",
  tokens: {
    "dq-bg": "#0b1020",
    "dq-surface": "#16192d",
    "dq-surface-strong": "#1e2240",
    "dq-border": "#2c335a",
    "dq-text": "#f8fafc",
    "dq-muted": "#94a3b8",
    "dq-accent": "#facc15",
    "dq-accent-strong": "#f97316",
    "dq-success": "#22c55e",
    "dq-danger": "#ef4444",
    "dq-glow": "0 0 24px rgba(250, 204, 21, 0.35)"
  },
  isDefault: true
});

function normalizeTheme(theme) {
  if (!theme || typeof theme.name !== "string" || theme.name.trim().length === 0) {
    return null;
  }
  const name = theme.name.trim();
  const label = typeof theme.label === "string" && theme.label.trim().length > 0
    ? theme.label.trim()
    : name;
  return {
    name,
    label,
    tokens: theme.tokens && typeof theme.tokens === "object" ? { ...theme.tokens } : {},
    isDefault: Boolean(theme.isDefault)
  };
}

function normalizeThemes(themes) {
  if (!Array.isArray(themes) || themes.length === 0) {
    return [];
  }
  const unique = new Map();
  themes.forEach((theme) => {
    const normalized = normalizeTheme(theme);
    if (!normalized) {
      return;
    }
    const key = normalized.name.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, normalized);
    }
  });
  return Array.from(unique.values());
}

function resolveDefaultTheme(themes, preferredName) {
  if (themes.length === 0) {
    return FALLBACK_THEME;
  }
  if (preferredName) {
    const match = themes.find((theme) => theme.name.toLowerCase() === preferredName.toLowerCase());
    if (match) {
      return match;
    }
  }
  const markedDefault = themes.find((theme) => theme.isDefault);
  return markedDefault ?? themes[0];
}

export function createThemeRegistry({ themes, defaultThemeName } = {}) {
  const normalizedThemes = normalizeThemes(themes);
  const defaultTheme = resolveDefaultTheme(normalizedThemes, defaultThemeName);
  const availableThemes = normalizedThemes.length > 0 ? normalizedThemes : [defaultTheme];

  function getThemes() {
    return availableThemes.map((theme) => ({ ...theme }));
  }

  function getThemeByName(name) {
    if (!name) {
      return defaultTheme;
    }
    const match = availableThemes.find(
      (theme) => theme.name.toLowerCase() === String(name).toLowerCase()
    );
    return match ?? defaultTheme;
  }

  function getThemeTokens(name) {
    return getThemeByName(name).tokens;
  }

  return Object.freeze({
    getThemes,
    getThemeByName,
    getThemeTokens,
    defaultTheme
  });
}

export { FALLBACK_THEME };
