# WebSocketHandler

**Package:** `net.daisyquest.daisyquestgame.Config`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Component`

**Fields (declared):**

- `objectMapper`
- `sessions`

**Public/protected methods:**

- `afterConnectionClosed`
- `afterConnectionEstablished`
- `handleTextMessage`
- `sendDuelAccepted`
- `sendDuelRejection`
- `sendDuelRequest`
- `sendEnterSubmapNotification`
- `sendExitSubmapNotification`

**Summary:**

- Class representing web socket handler functionality in the DaisyQuest codebase. Key annotations include: Component. Declares 2 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.