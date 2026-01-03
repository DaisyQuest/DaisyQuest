# InventorySlot

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `item`
- `quantity`
- `slotIndex`

**Public/protected methods:**

- `addItem`
- `canAddItem`
- `getAvailableSpace`
- `hasItem`
- `removeItem`

**Summary:**

- Domain model representing inventory slot within the game state and persistence layer. Key annotations include: Data. Declares 3 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.