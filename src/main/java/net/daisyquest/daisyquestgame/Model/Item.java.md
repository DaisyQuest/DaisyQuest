# Item

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `attributeModifiers`
- `attributeRequirements`
- `description`
- `equipmentPropertyModifiers`
- `equipmentSlotTypeString`
- `equippable`
- `equippableInStacks`
- `id`
- `isChest`
- `maxStackSize`
- `name`
- `rarity`
- `retainOnDeath`
- `sellPrice`
- `spriteName`
- `stackable`

**Public/protected methods:**

- `getMaxStackSize`
- `meetsRequirements`
- `setMaxStackSize`

**Summary:**

- Domain model representing item within the game state and persistence layer. Key annotations include: Data. Declares 16 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.