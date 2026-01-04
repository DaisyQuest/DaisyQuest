(() => {
    const ACTIVE_BUTTON_CLASS = 'dq-tab-button--active';
    const ACTIVE_PANEL_CLASS = 'dq-tab-panel--active';
    const TABLIST_SELECTOR = '[data-dq-tablist]';

    function dispatchTabEvent(target, name, detail) {
        if (!target) {
            return;
        }
        target.dispatchEvent(
            new CustomEvent(name, {
                bubbles: true,
                detail
            })
        );
    }

    function setButtonState(button, isActive) {
        button.classList.toggle(ACTIVE_BUTTON_CLASS, isActive);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        button.tabIndex = isActive ? 0 : -1;
    }

    function setPanelState(panel, isActive) {
        if (!panel) {
            return;
        }
        panel.classList.toggle(ACTIVE_PANEL_CLASS, isActive);
        panel.hidden = !isActive;
    }

    function resolvePanel(tablistId, targetSelector) {
        if (!targetSelector) {
            return null;
        }
        const panel = document.querySelector(targetSelector);
        if (!panel) {
            return null;
        }
        const panelGroup = panel.getAttribute('data-dq-tab-panel');
        if (tablistId && panelGroup !== tablistId) {
            return null;
        }
        return panel;
    }

    function initTablist(tablist) {
        const tablistId = tablist.getAttribute('data-dq-tablist');
        const buttons = Array.from(tablist.querySelectorAll('[data-dq-tab-target]'));
        if (buttons.length === 0) {
            return;
        }

        let activeButton = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];

        function activateTab(button, emitEvents = true) {
            if (!button || button === activeButton) {
                return;
            }

            const previousButton = activeButton;
            const previousPanel = resolvePanel(tablistId, previousButton?.getAttribute('data-dq-tab-target'));
            const previousTabId = previousPanel?.id || previousButton?.id;

            activeButton = button;
            const currentPanel = resolvePanel(tablistId, button.getAttribute('data-dq-tab-target'));
            const currentTabId = currentPanel?.id || button.id;

            if (previousButton) {
                setButtonState(previousButton, false);
                setPanelState(previousPanel, false);
                if (emitEvents) {
                    dispatchTabEvent(previousButton, 'dq.tab.hidden', {
                        tabId: previousTabId,
                        relatedTabId: currentTabId
                    });
                    dispatchTabEvent(previousPanel, 'dq.tab.hidden', {
                        tabId: previousTabId,
                        relatedTabId: currentTabId
                    });
                }
            }

            setButtonState(button, true);
            setPanelState(currentPanel, true);

            if (emitEvents) {
                dispatchTabEvent(button, 'dq.tab.shown', {
                    tabId: currentTabId,
                    relatedTabId: previousTabId
                });
                dispatchTabEvent(currentPanel, 'dq.tab.shown', {
                    tabId: currentTabId,
                    relatedTabId: previousTabId
                });
            }
        }

        buttons.forEach((button, index) => {
            button.tabIndex = button === activeButton ? 0 : -1;
            button.addEventListener('click', (event) => {
                event.preventDefault();
                activateTab(button);
            });
            button.addEventListener('keydown', (event) => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
                    return;
                }
                event.preventDefault();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = (index + direction + buttons.length) % buttons.length;
                activateTab(buttons[nextIndex]);
                buttons[nextIndex].focus();
            });
        });

        buttons.forEach((button) => {
            const panel = resolvePanel(tablistId, button.getAttribute('data-dq-tab-target'));
            const isActive = button === activeButton;
            setButtonState(button, isActive);
            setPanelState(panel, isActive);
        });

        const activePanel = resolvePanel(tablistId, activeButton.getAttribute('data-dq-tab-target'));
        const activeTabId = activePanel?.id || activeButton.id;
        dispatchTabEvent(activeButton, 'dq.tab.shown', {
            tabId: activeTabId
        });
        dispatchTabEvent(activePanel, 'dq.tab.shown', {
            tabId: activeTabId
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll(TABLIST_SELECTOR).forEach(initTablist);
    });

    window.DQTabs = {
        activate(tabId) {
            const button = document.querySelector(`[data-dq-tab-target="#${tabId}"]`);
            if (!button) {
                return;
            }
            const tablist = button.closest(TABLIST_SELECTOR);
            if (!tablist) {
                return;
            }
            const event = new Event('click', { bubbles: true });
            button.dispatchEvent(event);
        }
    };
})();
