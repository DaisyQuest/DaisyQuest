# WorldMapController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`
- `RestController`

**Fields (declared):**

- `interactionData`
- `interactionType`
- `newX`
- `newY`
- `playerId`
- `worldMapService`
- `worldObjectRepository`

**Public/protected methods:**

- `cancelInteraction`
- `checkSubmapEntrance`
- `getLandAtPosition`
- `getMapItemsInViewport`
- `getPlayersInViewport`
- `getSubmapEntrances`
- `getWorldMap`
- `getWorldObjectsInViewport`
- `movePlayer`
- `pickupItem`
- `startInteraction`
- `updateInteractionProgress`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for world map features and UI flows. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor, RestController. Declares 7 fields that capture state and configuration for this type. Provides 12 public/protected methods for core behaviors and accessors.