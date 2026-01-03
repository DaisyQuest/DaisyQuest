# WorldObjectsManagerController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Controller`
- `Data`

**Fields (declared):**

- `mongoTemplate`
- `submapId`
- `submapRepository`
- `worldObjectRepository`
- `worldObjectTypeId`
- `worldObjectTypeRepository`
- `xPos`
- `yPos`
- `zPos`

**Public/protected methods:**

- `createObject`
- `deleteObject`
- `managerPage`
- `resetObject`
- `searchObjects`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for world objects manager features and UI flows. Key annotations include: Controller, Data. Declares 9 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.