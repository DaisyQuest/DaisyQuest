# CastleController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `buildingTypeRepository`
- `castleService`
- `simulationService`
- `troopTypeRepository`

**Public/protected methods:**

- `addBuilding`
- `addTroop`
- `createCastleForPlayer`
- `getBuildingTypes`
- `getCastleSimulations`
- `getCastleStatus`
- `getTroopTypes`
- `switchTroopPosition`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for castle features and UI flows. Key annotations include: RestController. Declares 4 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.