# Land

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `XCoordinate`
- `YCoordinate`
- `forSale`
- `id`
- `landType`
- `owner`
- `partitions`
- `salePrice`
- `worldMap`

**Public/protected methods:**

- `addPartition`
- `getTotalPartitionArea`
- `getUnpartitionedArea`
- `isPartitioned`
- `processUpdate`
- `removePartition`
- `setGovernor`
- `setPayoutInterval`

**Summary:**

- Domain model representing land within the game state and persistence layer. Key annotations include: Data. Declares 9 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.