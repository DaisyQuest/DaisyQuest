# LandPartition

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `area`
- `governor`
- `payoutInterval`
- `updatesTilPayout`

**Public/protected methods:**

- `decrementUpdatesTilPayout`
- `resetUpdatesTilPayout`
- `shouldPayout`

**Summary:**

- Domain model representing land partition within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.