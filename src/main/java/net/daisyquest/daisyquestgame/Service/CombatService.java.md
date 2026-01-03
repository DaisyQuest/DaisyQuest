# CombatService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `BASE_CAPTURE_CHANCE`
- `CAPTURE_ITEM_ID`
- `COMBAT_EXPIRATION_MINUTES`
- `HP_COEFFICIENT`
- `INITIAL_ACTION_POINTS`
- `INITIAL_HEALTH`
- `MAX_TURNS`
- `TURN_DURATION_SECONDS`
- `combatLogRepository`
- `combatRepository`
- `itemService`
- `logger`
- `npcEncampmentService`
- `playerService`
- `random`
- `specialAttackService`
- `spellService`
- `statusEffectService`

**Public/protected methods:**

- `applyPlayerStatusEffects`
- `cleanupExpiredCombats`
- `getCombat`
- `getCombatLogs`
- `performAction`
- `processAITurns`
- `startCombat`
- `updateCooldowns`

**Summary:**

- Service-layer component that encapsulates combat business logic and orchestration. Key annotations include: Service. Declares 18 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.