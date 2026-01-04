# DaisyQuest Game UX Specification

## Goals
- Deliver a cohesive MMORPG gameplay experience from a single primary screen.
- Ensure players can **see the world map**, **read chat/notifications**, **initiate and perform combat**, and **interact with world objects** without leaving the Map tab.
- Provide a clear, discoverable layout with minimal tab switching.
- Make combat, exploration, and interaction flows consistent and predictable.

## Guiding Principles
- **Map-first experience:** The map is the anchor for all interactions.
- **No hidden states:** Key actions and system feedback are visible and contextual.
- **Low friction:** Players can always understand “what can I do right now?”
- **MMORPG expectations:** Persistent chat, party/nearby players visibility, and world interaction cues are always present.

## Primary Layout (Single Screen)
The Map tab is the main experience. All core gameplay happens here.

### 1) World Map (Center/Left)
- **Always visible** in Map tab.
- Shows:
  - Player character location.
  - Nearby players/NPCs/monsters.
  - Interactive world objects (nodes, chests, portals, quest markers).
  - Combat engagement indicators (e.g., crossed swords icon) next to hostile targets.
- Supports:
  - Click/tap to move.
  - Click on entity to open the contextual interaction panel (right panel).
  - Hover/tap to show tooltips (name, level, faction, status, resource type, etc.).

### 2) Contextual Interaction Panel (Right)
This panel changes based on what the player has selected on the map.

**States:**
- **Default (no selection):**
  - Shows current zone info, time, weather, and a “What’s nearby” list.
- **Player selected:**
  - Inspect info, trade, party invite, whisper.
- **NPC selected:**
  - Talk, quest, vendor, dialog options.
- **Monster selected (combat-ready):**
  - “Engage” button.
  - Shows monster stats, abilities, resistances.
- **Interactive object selected:**
  - Interact (gather, open, activate), requirements, cooldowns.

### 3) Combat Panel (Bottom Center/Bottom Right)
Combat is **not a separate screen**. It overlays the map layout.

- **Always accessible** once combat starts.
- Shows:
  - Player/target health, resource bars, status effects.
  - Action bar with abilities (cooldowns, costs, keybinds).
  - Combat log stream (damage/heal, status changes).
- **Initiation Flow:**
  1. Player selects hostile target on map.
  2. Context panel shows “Engage”.
  3. On Engage, combat panel becomes active without leaving map.

### 4) Persistent Chat + Info Box (Left or Bottom Left)
- **Always visible** in Map tab.
- Supports tabs **inside** the chat component (e.g., Local / Party / Guild / System).
- Also displays system messages: loot, quest updates, combat events.

### 5) Secondary Tabs (Allowed, minimal use)
Tabs can exist (e.g., Inventory, Character, Journal), but should **overlay** or slide in without hiding the map fully.

- Inventory/Character should open in a side panel overlay; the map remains visible.
- Combat remains visible even when secondary panels are open.

## Core Gameplay Flows

### Combat Flow (Map-Driven)
1. Select hostile target on map.
2. Context panel shows “Engage.”
3. Engage activates combat panel without navigating away.
4. Use action bar and abilities while still seeing map.
5. Combat outcome appears in log; loot/XP notifications appear in chat/info.

### Exploration Flow
1. Player moves by clicking on map.
2. Nearby interactive objects are highlighted.
3. Selecting object populates interaction panel.
4. Player interacts without leaving map.

### Social Flow
1. Chat is persistent and visible at all times.
2. Selecting a player opens contextual actions (inspect, party, trade).
3. Party UI (small overlay) shows members and status without switching tabs.

## UX Requirements Checklist
- [ ] Map is always visible on the main gameplay tab.
- [ ] Combat can be initiated and played without leaving map.
- [ ] Chat/info box is always visible and readable.
- [ ] Contextual interaction panel updates based on selection.
- [ ] Core gameplay does not require tab switching.
- [ ] Secondary tabs are overlays, not full-screen replacements.

## Visual Hierarchy & Layout Guidance
- Map is the largest region (60–70% of screen).
- Right panel is 20–25% width for contextual interaction.
- Bottom panel is 15–20% height for combat/action bar.
- Chat/info box is anchored left or bottom-left (10–15% width), collapsible but visible by default.

## Accessibility & Clarity
- Clear contrast between interactive and non-interactive map elements.
- Ability cooldowns and status effects are visually obvious.
- Chat text is legible and can be resized.

## Non-Goals (For Now)
- Full-screen dedicated combat scene.
- Deep menu navigation for core gameplay actions.
- Hiding chat during combat.

## Success Criteria
- A new player can enter the Map tab and immediately:
  - See where they are and what’s nearby.
  - Start combat from the map.
  - Read chat and system messages.
  - Interact with objects/NPCs without navigating away.

## Future Enhancements (Optional)
- Mini-map overlay for quick navigation.
- Customizable panel placement.
- Combat log filtering.
- Context-sensitive radial menus.
