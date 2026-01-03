# LandController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `landService`
- `worldMapService`

**Public/protected methods:**

- `buyLand`
- `getAll`
- `getLand`
- `getLandByCoordinates`
- `getLandsForSale`
- `initializeOrGetWorldMap`
- `partitionLand`
- `removePartition`
- `sellLand`
- `setGovernor`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for land features and UI flows. Key annotations include: RestController. Declares 2 fields that capture state and configuration for this type. Provides 10 public/protected methods for core behaviors and accessors.