# WorldObjectType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `cooldownMs`
- `id`
- `interactable`
- `interactionDurationMs`
- `interactionOption`
- `interactionType`
- `length`
- `name`
- `spriteName`
- `traversalType`
- `visible`
- `width`

**Public/protected methods:**

- `build`
- `create`
- `makeInteractable`
- `setInvisible`
- `validate`
- `withCooldown`
- `withDimensions`
- `withId`
- `withInteractionDuration`
- `withName`
- `withSpriteName`
- `withTraversalType`

**Summary:**

- Domain model representing world object type within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 12 fields that capture state and configuration for this type. Provides 12 public/protected methods for core behaviors and accessors.