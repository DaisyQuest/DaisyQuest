# CombatStatusContainer

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `playerId`
- `statusEffectDurations`

**Public/protected methods:**

- `addStatusEffect`
- `decrementDurations`
- `getRemainingDuration`
- `hasStatusEffect`
- `removeStatusEffect`
- `updateStatusEffectDuration`

**Summary:**

- Domain model representing combat status container within the game state and persistence layer. Key annotations include: Data. Declares 2 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.