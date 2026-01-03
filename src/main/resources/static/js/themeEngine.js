window.ThemeEngine = (() => {
    const storageKey = 'dq-theme';
    const state = {
        themes: [],
        active: null,
        defaultTheme: null
    };

    const normalizeTheme = (theme) => {
        if (!theme) {
            return null;
        }
        return {
            name: theme.name,
            label: theme.label || theme.name,
            tokens: theme.tokens || {},
            isDefault: Boolean(theme.isDefault || theme.default)
        };
    };

    const applyTheme = (theme) => {
        if (!theme) {
            return;
        }
        const root = document.documentElement;
        root.dataset.theme = theme.name;
        Object.entries(theme.tokens || {}).forEach(([token, value]) => {
            if (token && value) {
                root.style.setProperty(`--${token}`, value);
            }
        });
        state.active = theme;
        try {
            localStorage.setItem(storageKey, theme.name);
        } catch (error) {
            console.warn('Unable to persist theme preference.', error);
        }
    };

    const resolveDefaultTheme = (themes) => {
        return themes.find((theme) => theme.isDefault) || themes[0] || null;
    };

    const buildPicker = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        const label = document.createElement('label');
        label.textContent = 'Theme';
        label.setAttribute('for', `${containerId}-select`);

        const select = document.createElement('select');
        select.id = `${containerId}-select`;
        select.className = 'form-select form-select-sm';

        state.themes.forEach((theme) => {
            const option = document.createElement('option');
            option.value = theme.name;
            option.textContent = theme.label;
            if (state.active && state.active.name === theme.name) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', (event) => {
            const selected = state.themes.find((theme) => theme.name === event.target.value);
            applyTheme(selected || state.defaultTheme);
        });

        container.innerHTML = '';
        container.classList.add('dq-theme-picker');
        container.appendChild(label);
        container.appendChild(select);
    };

    const init = async ({ containerId } = {}) => {
        try {
            const response = await fetch('/api/themes');
            if (!response.ok) {
                throw new Error('Failed to load themes');
            }
            const data = await response.json();
            state.themes = data.map(normalizeTheme).filter(Boolean);
            state.defaultTheme = resolveDefaultTheme(state.themes);

            let preferred = null;
            try {
                preferred = localStorage.getItem(storageKey);
            } catch (error) {
                console.warn('Unable to read theme preference.', error);
            }

            const selected = state.themes.find((theme) => theme.name === preferred) || state.defaultTheme;
            applyTheme(selected);
            if (containerId) {
                buildPicker(containerId);
            }
        } catch (error) {
            console.warn('Theme engine failed to initialize.', error);
        }
    };

    return {
        init,
        applyTheme,
        getThemes: () => [...state.themes]
    };
})();
