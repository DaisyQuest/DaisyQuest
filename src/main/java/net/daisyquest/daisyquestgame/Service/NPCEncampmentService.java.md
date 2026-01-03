# NPCEncampmentService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `ENCAMPMENT_RADIUS`
- `MAX_DISTANCE_FROM_CENTER`
- `MIN_DISTANCE_FROM_CENTER`
- `NPC_SPACING`
- `encampmentRepository`
- `equipmentPropertyService`
- `itemService`
- `playerInventoryRepository`
- `playerRepository`
- `spellService`
- `worldMapService`

**Public/protected methods:**

- `checkAndRemoveEncampment`
- `getAllEncampments`
- `getEncampmentById`
- `getEncampmentsInViewport`
- `spawnEncampments`

**Summary:**

- Service-layer component that encapsulates npcencampment business logic and orchestration. Key annotations include: Service. Declares 11 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.