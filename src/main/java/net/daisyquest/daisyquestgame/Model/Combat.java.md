# Combat

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `active`
- `combatLogIds`
- `createdAt`
- `currentPhase`
- `currentTurnPlayerId`
- `id`
- `playerActionPoints`
- `playerEquipmentBonuses`
- `playerHealth`
- `playerHealthStarting`
- `playerIds`
- `playerSpecialAttacks`
- `playerStatusEffects`
- `playerTeams`
- `spellCooldowns`
- `turnDurationSeconds`
- `turnNumber`
- `turnStartTime`

**Public/protected methods:**

- `addPlayerSpecialAttack`
- `addStatusEffect`
- `applyDamage`
- `getPlayerSpecialAttacks`
- `hasSpecialAttack`
- `progressPhase`
- `removePlayerSpecialAttack`
- `removeStatusEffect`
- `setPlayerSpecialAttacks`

**Summary:**

- Domain model representing combat within the game state and persistence layer. Key annotations include: Data. Declares 18 fields that capture state and configuration for this type. Provides 9 public/protected methods for core behaviors and accessors.