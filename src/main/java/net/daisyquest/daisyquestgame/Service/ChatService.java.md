# ChatService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `chatMessageRepository`
- `chatRoomRepository`
- `playerService`

**Public/protected methods:**

- `createChatRoom`
- `getPrivateMessages`
- `getPublicRooms`
- `getRoomMessages`
- `getUserRooms`
- `sendMessage`

**Summary:**

- Service-layer component that encapsulates chat business logic and orchestration. Key annotations include: Service. Declares 3 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.