# WorldMapService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Getter`
- `Service`

**Fields (declared):**

- `INTERACTION_RANGE`
- `LAND_SIZE`
- `activeInteractionRepository`
- `itemService`
- `landRepository`
- `mapItemRepository`
- `playerRepository`
- `random`
- `submapEntrances`
- `submapId`
- `worldMapRepository`
- `worldObjectRepository`
- `x`
- `y`

**Public/protected methods:**

- `cancelInteraction`
- `findMapItemsInViewport`
- `findWorldObjectsInViewport`
- `getLandAtPosition`
- `getLandByCoordinates`
- `getOrCreateWorldMap`
- `getPlayersInViewport`
- `getSubmapEntrances`
- `getSubmapIdNearPlayer`
- `getWorldMap`
- `handleWorldObjectInteraction`
- `initializeSubmapEntrances`
- `isPlayerNearSubmapEntrance`
- `movePlayer`
- `pickupItem`
- `startWorldObjectInteraction`
- `updateInteractionProgress`
- `updateLand`

**Summary:**

- Service-layer component that encapsulates world map business logic and orchestration. Key annotations include: Getter, Service. Declares 14 fields that capture state and configuration for this type. Provides 18 public/protected methods for core behaviors and accessors.