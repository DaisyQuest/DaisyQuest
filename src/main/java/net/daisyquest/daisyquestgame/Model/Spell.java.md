# Spell

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `cooldown`
- `description`
- `duration`
- `effect`
- `id`
- `manaCost`
- `name`
- `spellSpritePath`
- `statusEffect`
- `statusEffects`

**Public/protected methods:**

- `addStatusEffectApplication`
- `applyStatusEffects`

**Summary:**

- Domain model representing spell within the game state and persistence layer. Key annotations include: Data. Declares 10 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.