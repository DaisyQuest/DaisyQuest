const path = require('path');
const { JSDOM } = require('jsdom');

const uiEnginePath = path.resolve(__dirname, '../../src/main/resources/static/js/uiEngine.js');

function loadUiEngine(dom) {
    global.window = dom.window;
    global.document = dom.window.document;
    delete require.cache[uiEnginePath];
    return require(uiEnginePath);
}

describe('UIEngine', () => {
    afterEach(() => {
        delete global.window;
        delete global.document;
    });

    test('toggles combat and map views with tab state updates', () => {
        const dom = new JSDOM(`
            <button id="combat-tab" class="nav-link"></button>
            <button id="world-tab" class="nav-link"></button>
            <div id="combat" class="tab-pane"></div>
            <div id="worldMapH" class="tab-pane"></div>
            <div id="combatArea" style="display:none;"></div>
            <div id="combatResults" style="display:none;"></div>
            <div id="combatEmptyState"></div>
        `);

        const { createUIEngine } = loadUiEngine(dom);
        const ui = createUIEngine({
            tabs: {
                combat: { buttonId: 'combat-tab', paneId: 'combat' },
                map: { buttonId: 'world-tab', paneId: 'worldMapH' }
            },
            views: {
                combat: { paneId: 'combat' },
                map: { paneId: 'worldMapH' }
            },
            combatAreaId: 'combatArea',
            combatResultsId: 'combatResults',
            combatIdleId: 'combatEmptyState',
            defaultView: 'map'
        });

        ui.setCombatActive(true);

        const combatArea = dom.window.document.getElementById('combatArea');
        const combatEmptyState = dom.window.document.getElementById('combatEmptyState');
        const mapTab = dom.window.document.getElementById('world-tab');
        const combatTab = dom.window.document.getElementById('combat-tab');

        expect(combatArea.style.display).not.toBe('none');
        expect(combatEmptyState.style.display).toBe('none');
        expect(mapTab.disabled).toBe(true);
        expect(combatTab.classList.contains('active')).toBe(true);

        ui.setCombatActive(false);

        const mapPane = dom.window.document.getElementById('worldMapH');
        expect(mapTab.disabled).toBe(false);
        expect(mapPane.classList.contains('active')).toBe(true);
        expect(combatArea.style.display).toBe('none');
        expect(combatEmptyState.style.display).not.toBe('none');
    });

    test('shows combat results while keeping map hidden', () => {
        const dom = new JSDOM(`
            <div id="worldMapContainer"></div>
            <div id="combatArea"></div>
            <div id="combatResults" style="display:none;"></div>
        `);

        const { createUIEngine } = loadUiEngine(dom);
        const ui = createUIEngine({
            views: {
                map: { containerId: 'worldMapContainer' },
                combat: { containerId: 'combatArea' }
            },
            combatAreaId: 'combatArea',
            combatResultsId: 'combatResults',
            defaultView: 'map'
        });

        ui.setCombatActive(true);
        ui.showCombatResults();

        const combatArea = dom.window.document.getElementById('combatArea');
        const combatResults = dom.window.document.getElementById('combatResults');
        const mapContainer = dom.window.document.getElementById('worldMapContainer');

        expect(combatArea.style.display).toBe('none');
        expect(combatResults.style.display).not.toBe('none');
        expect(mapContainer.style.display).toBe('none');

        ui.resetCombatView();

        expect(combatResults.style.display).toBe('none');
        expect(mapContainer.style.display).not.toBe('none');
    });

    test('handles missing document without throwing', () => {
        delete global.document;
        delete global.window;
        delete require.cache[uiEnginePath];
        const { createUIEngine } = require(uiEnginePath);
        const ui = createUIEngine();

        expect(() => ui.setCombatActive(true)).not.toThrow();
        expect(ui.state.combatActive).toBe(true);
    });
});
