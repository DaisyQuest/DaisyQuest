# PlayerService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `currencyService`
- `equipmentPropertyService`
- `playerInventoryRepository`
- `playerRepository`
- `spellService`

**Public/protected methods:**

- `addAttributeExperience`
- `addCurrency`
- `addCurrencyByName`
- `addExperience`
- `addItemToInventory`
- `addResources`
- `addTalentPoint`
- `addTestItemsToPlayer`
- `addTestItemsToPlayerByName`
- `checkAndFixDataIntegrity`
- `createPlayer`
- `deductCurrencyByName`
- `deductResources`
- `deletePlayer`
- `dropItem`
- `equipItem`
- `getAllPlayers`
- `getAllTalents`
- `getPlayer`
- `getPlayerByUsername`
- `getPlayerInventory`
- `getTalentLevel`
- `hasSufficientCurrencyByCurrencyName`
- `learnSpell`
- `markPlayerForDeletion`
- `moveEquipment`
- `moveItem`
- `removeItemFromInventory`
- `sendItem`
- `spendTalentPoint`
- `unequipItem`
- `unequipItemToSlot`
- `updatePlayer`
- `updatePlayerSprite`
- `useItem`

**Summary:**

- Service-layer component that encapsulates player business logic and orchestration. Key annotations include: Service. Declares 5 fields that capture state and configuration for this type. Provides 35 public/protected methods for core behaviors and accessors.