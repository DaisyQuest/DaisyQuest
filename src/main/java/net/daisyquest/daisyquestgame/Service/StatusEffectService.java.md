# StatusEffectService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `statusEffectCache`
- `statusEffectRepository`

**Public/protected methods:**

- `applyStatusEffect`
- `clearCache`
- `createStatusEffect`
- `getActiveStatusEffects`
- `getAllStatusEffects`
- `getServiceName`
- `getStatusEffect`
- `getStatusEffectByShortDisplayNameNoCache`

**Summary:**

- Service-layer component that encapsulates status effect business logic and orchestration. Key annotations include: Service. Declares 2 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.