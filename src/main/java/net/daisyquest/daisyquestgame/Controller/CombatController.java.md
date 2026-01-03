# CombatController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `combatService`
- `logger`
- `statusEffectService`

**Public/protected methods:**

- `getActiveStatusEffects`
- `getCombat`
- `getCombatLogs`
- `getTurnPhase`
- `performAction`
- `startCombat`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for combat features and UI flows. Key annotations include: RestController. Declares 3 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.