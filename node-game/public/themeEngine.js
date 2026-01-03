const STORAGE_KEY = "dq-theme";

const FALLBACK_THEME = {
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
  }
};

function normalizeThemes(themes) {
  if (!Array.isArray(themes)) {
    return [];
  }
  const unique = new Map();
  themes.forEach((theme) => {
    if (!theme || !theme.name) {
      return;
    }
    const key = theme.name.toLowerCase();
    if (unique.has(key)) {
      return;
    }
    unique.set(key, {
      name: theme.name,
      label: theme.label || theme.name,
      tokens: theme.tokens || {},
      isDefault: Boolean(theme.isDefault)
    });
  });
  return Array.from(unique.values());
}

function resolveDefaultTheme(themes, preferredName) {
  if (themes.length === 0) {
    return FALLBACK_THEME;
  }
  if (preferredName) {
    const match = themes.find((theme) => theme.name === preferredName);
    if (match) {
      return match;
    }
  }
  return themes.find((theme) => theme.isDefault) || themes[0];
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme.name;
  Object.entries(theme.tokens || {}).forEach(([token, value]) => {
    root.style.setProperty(`--${token}`, value);
  });
}

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeTheme(name) {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch (error) {
    // ignore storage failures
  }
}

export async function initializeThemeEngine({ selectId = "theme-select" } = {}) {
  let themes = [];
  try {
    const response = await fetch("/themes.json");
    if (response.ok) {
      const data = await response.json();
      themes = normalizeThemes(data.themes || data);
    }
  } catch (error) {
    themes = [];
  }

  if (themes.length === 0) {
    themes = [FALLBACK_THEME];
  }

  const preferred = getStoredTheme();
  const defaultTheme = resolveDefaultTheme(themes, preferred);
  applyTheme(defaultTheme);

  const select = document.getElementById(selectId);
  if (!select) {
    return;
  }
  select.innerHTML = "";
  themes.forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme.name;
    option.textContent = theme.label;
    if (theme.name === defaultTheme.name) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    const selected = themes.find((theme) => theme.name === select.value) || themes[0];
    applyTheme(selected);
    storeTheme(selected.name);
  });
}
