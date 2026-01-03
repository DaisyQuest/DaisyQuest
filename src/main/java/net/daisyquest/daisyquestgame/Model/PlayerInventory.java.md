# PlayerInventory

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `EQUIPMENT_SLOT_TYPES`
- `currencies`
- `equipmentSlots`
- `id`
- `inventorySlots`
- `logger`
- `maxInventorySize`
- `playerId`

**Public/protected methods:**

- `addItem`
- `calculateEffectiveEquipmentBonuses`
- `canAddItem`
- `getInventoryContents`
- `getItemQuantity`
- `hasItem`
- `initializePlayerInventoryIfNecessary`
- `removeItem`

**Summary:**

- Domain model representing player inventory within the game state and persistence layer. Key annotations include: Data. Declares 8 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.