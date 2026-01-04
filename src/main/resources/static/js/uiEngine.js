(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.DaisyQuestUIEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const defaultLogger = {
        info: (...args) => console.info('[UIEngine]', ...args),
        warn: (...args) => console.warn('[UIEngine]', ...args),
        error: (...args) => console.error('[UIEngine]', ...args)
    };

    function getDocument() {
        if (typeof document === 'undefined') {
            return null;
        }
        return document;
    }

    function createUIEngine(config = {}) {
        const doc = getDocument();
        const logger = config.logger || defaultLogger;
        const tabs = config.tabs || {};
        const views = config.views || {};
        const combatAreaId = config.combatAreaId;
        const combatResultsId = config.combatResultsId;
        const combatIdleId = config.combatIdleId;
        const combatAreaDisplay = config.combatAreaDisplay;
        const combatResultsDisplay = config.combatResultsDisplay;
        const combatIdleDisplay = config.combatIdleDisplay;
        const defaultView = config.defaultView;

        const state = {
            combatActive: false,
            activeView: null
        };

        function resolveElement(id, label) {
            if (!doc || !id) {
                return null;
            }
            const element = doc.getElementById(id);
            if (!element && id) {
                logger.warn(`Missing element for ${label || 'element'}: ${id}`);
            }
            return element;
        }

        function setDisplay(id, isVisible, visibleDisplay) {
            const element = resolveElement(id, 'display');
            if (!element) {
                return;
            }
            element.style.display = isVisible ? (visibleDisplay || '') : 'none';
        }

        function setTabActive(tabConfig, isActive) {
            if (!tabConfig) {
                return;
            }
            const button = resolveElement(tabConfig.buttonId, 'tab button');
            const pane = resolveElement(tabConfig.paneId, 'tab pane');
            if (button) {
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            }
            if (pane) {
                pane.classList.toggle('active', isActive);
                pane.classList.toggle('show', isActive);
            }
        }

        function setTabEnabled(tabConfig, isEnabled) {
            if (!tabConfig) {
                return;
            }
            const button = resolveElement(tabConfig.buttonId, 'tab button');
            if (!button) {
                return;
            }
            button.disabled = !isEnabled;
            button.classList.toggle('disabled', !isEnabled);
            button.setAttribute('aria-disabled', isEnabled ? 'false' : 'true');
            if (!isEnabled && button.classList.contains('active')) {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            }
        }

        function setViewVisible(viewKey, isVisible) {
            const view = views[viewKey];
            if (!view) {
                return;
            }
            if (view.containerId) {
                setDisplay(view.containerId, isVisible, view.displayStyle);
            }
            if (view.paneId) {
                const pane = resolveElement(view.paneId, 'view pane');
                if (pane) {
                    pane.classList.toggle('active', isVisible);
                    pane.classList.toggle('show', isVisible);
                }
            }
        }

        function activateView(viewKey) {
            if (!viewKey) {
                return;
            }
            Object.keys(views).forEach(key => setViewVisible(key, key === viewKey));
            Object.keys(tabs).forEach(key => setTabActive(tabs[key], key === viewKey));
            state.activeView = viewKey;
        }

        function setCombatActive(isActive) {
            if (!doc) {
                logger.warn('Document not available; skipping combat state changes.');
                state.combatActive = isActive;
                return;
            }
            state.combatActive = isActive;
            setDisplay(combatAreaId, isActive, combatAreaDisplay);
            setDisplay(combatResultsId, false, combatResultsDisplay);
            setDisplay(combatIdleId, !isActive, combatIdleDisplay);

            const mapTab = tabs.map;
            if (mapTab) {
                setTabEnabled(mapTab, !isActive);
            }

            if (isActive) {
                activateView('combat');
            } else if (defaultView) {
                activateView(defaultView);
            }
        }

        function showCombatResults() {
            if (!doc) {
                logger.warn('Document not available; skipping combat results display.');
                return;
            }
            setDisplay(combatAreaId, false, combatAreaDisplay);
            setDisplay(combatIdleId, false, combatIdleDisplay);
            setDisplay(combatResultsId, true, combatResultsDisplay);
            activateView('combat');
        }

        function resetCombatView() {
            setCombatActive(false);
            setDisplay(combatResultsId, false, combatResultsDisplay);
        }

        return {
            activateView,
            resetCombatView,
            setCombatActive,
            showCombatResults,
            setTabEnabled,
            state
        };
    }

    return { createUIEngine };
}));
