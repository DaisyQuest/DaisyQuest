# SimulationService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `buildingRepository`
- `castleRepository`
- `random`
- `simulationLogRepository`
- `troopRepository`
- `troopTitleRepository`
- `troopTypeRepository`

**Public/protected methods:**

- `getSimulationLogs`
- `runHourlySimulation`
- `saveSimulationLog`

**Summary:**

- Service-layer component that encapsulates simulation business logic and orchestration. Key annotations include: Service. Declares 7 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.