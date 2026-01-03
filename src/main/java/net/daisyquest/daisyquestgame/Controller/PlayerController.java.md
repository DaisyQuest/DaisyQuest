# PlayerController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `castleService`
- `craftingService`
- `playerService`
- `rewardService`
- `shopService`

**Public/protected methods:**

- `addTestItems`
- `craftItem`
- `createPlayer`
- `deletePlayer`
- `dropItem`
- `getAllPlayers`
- `getCastleForPlayer`
- `getInventory`
- `getPlayer`
- `getPlayerAttributes`
- `getPlayerShop`
- `getSpells`
- `getUnclaimedRewards`
- `listItemForSale`
- `loginPlayer`
- `party`
- `registerPlayer`
- `removeShopItem`
- `sendItem`
- `updatePlayer`
- `updatePlayerSprite`
- `upgradeTalent`
- `useItem`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for player features and UI flows. Key annotations include: RestController. Declares 5 fields that capture state and configuration for this type. Provides 23 public/protected methods for core behaviors and accessors.