# RewardService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `chestRepository`
- `currencyRepository`
- `itemRepository`
- `logger`
- `playerService`
- `rewardContainerRepository`
- `rewardGeneratorService`

**Public/protected methods:**

- `canClaimDailyReward`
- `claimDailyReward`
- `claimReward`
- `createDailyReward`
- `generateAndApplyRandomReward`
- `getUnclaimedRewards`
- `openChest`
- `openRandomChest`

**Summary:**

- Service-layer component that encapsulates reward business logic and orchestration. Key annotations include: Service. Declares 7 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.