# DaisyQuest Ultravervose Project Summary

This document aggregates per-file summaries generated alongside source files.

## Java Sources

### `src/main/java/net/daisyquest/daisyquestgame/Config/RandomConfig.java.md`

# RandomConfig

**Package:** `net.daisyquest.daisyquestgame.Config`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Configuration`

**Public/protected methods:**

- `random`

**Summary:**

- Configuration/bootstrapping class for random config application setup. Key annotations include: Configuration. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Config/WebSocketConfig.java.md`

# WebSocketConfig

**Package:** `net.daisyquest.daisyquestgame.Config`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Configuration`

**Fields (declared):**

- `webSocketHandler`

**Public/protected methods:**

- `registerWebSocketHandlers`

**Summary:**

- Configuration/bootstrapping class for web socket config application setup. Key annotations include: Configuration. Declares 1 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Config/WebSocketHandler.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Controller/Activity/ActivityController.java.md`

# ActivityController

**Package:** `net.daisyquest.daisyquestgame.Controller.Activity`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `activityService`

**Public/protected methods:**

- `completeActivity`
- `createActivity`
- `deleteActivity`
- `getActivity`
- `getAllActivities`
- `startActivity`
- `updateActivity`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for activity features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 7 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/Activity/ActivityEditorController.java.md`

# ActivityEditorController

**Package:** `net.daisyquest.daisyquestgame.Controller.Activity`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Controller`

**Fields (declared):**

- `activityService`
- `attributeRepository`
- `itemRepository`

**Public/protected methods:**

- `activityEditor`
- `deleteActivity`
- `getActivity`
- `getAllActivities`
- `getAllAttributes`
- `getAllEquipment`
- `getAllItems`
- `saveActivity`
- `updateActivity`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for activity editor features and UI flows. Key annotations include: Controller. Declares 3 fields that capture state and configuration for this type. Provides 9 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/AttributeTemplateController.java.md`

# AttributeTemplateController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Public/protected methods:**

- `getAll`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for attribute template features and UI flows. Key annotations include: RestController. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/CacheController.java.md`

# CacheController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `cacheManagerService`

**Public/protected methods:**

- `clearAllCaches`
- `clearCacheByServiceName`
- `listCacheableServices`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for cache features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/CastleController.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Controller/ChatController.java.md`

# ChatController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Controller`

**Fields (declared):**

- `chatService`

**Public/protected methods:**

- `addUser`
- `sendMessage`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for chat features and UI flows. Key annotations include: Controller. Declares 1 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/CombatController.java.md`

# CombatController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `combatService`
- `logger`
- `statusEffectService`

**Public/protected methods:**

- `getActiveStatusEffects`
- `getCombat`
- `getCombatLogs`
- `getTurnPhase`
- `performAction`
- `startCombat`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for combat features and UI flows. Key annotations include: RestController. Declares 3 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/CombatStartedResponse.java.md`

# CombatStartedResponse

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Fields (declared):**

- `combatId`
- `combatStarted`
- `success`

**Summary:**

- DTO used to return combat started response results to clients or controllers. Declares 3 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/CooldownActiveException.java.md`

# CooldownActiveException

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `remainingCooldownMs`

**Summary:**

- Custom exception type for signaling cooldown active exception error conditions in service flows. Key annotations include: Data. Declares 1 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/CurrencyController.java.md`

# CurrencyController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `currencyService`

**Public/protected methods:**

- `createCurrency`
- `deleteCurrency`
- `getAllCurrencies`
- `getCurrency`
- `updateCurrency`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for currency features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/DuelController.java.md`

# DuelController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`
- `RestController`

**Fields (declared):**

- `challengerId`
- `combatId`
- `combatService`
- `error`
- `itemService`
- `message`
- `playerService`
- `submapService`
- `success`
- `targetId`
- `webSocketService`

**Public/protected methods:**

- `acceptDuel`
- `rejectDuel`
- `requestDuel`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for duel features and UI flows. Key annotations include: Data, RestController. Declares 11 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/GameController.java.md`

# GameController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Controller`

**Public/protected methods:**

- `castleDefense`
- `createRecipes`
- `game`
- `index`
- `register`
- `worldMap`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for game features and UI flows. Key annotations include: Controller. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/ItemController.java.md`

# ItemController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `itemService`

**Public/protected methods:**

- `createItem`
- `deleteItem`
- `getAllItems`
- `getItem`
- `updateItem`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for item features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/LandController.java.md`

# LandController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `landService`
- `worldMapService`

**Public/protected methods:**

- `buyLand`
- `getAll`
- `getLand`
- `getLandByCoordinates`
- `getLandsForSale`
- `initializeOrGetWorldMap`
- `partitionLand`
- `removePartition`
- `sellLand`
- `setGovernor`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for land features and UI flows. Key annotations include: RestController. Declares 2 fields that capture state and configuration for this type. Provides 10 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/NPC/NPCEncampmentController.java.md`

# NPCEncampmentController

**Package:** `net.daisyquest.daisyquestgame.Controller.NPC`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `npcEncampmentService`

**Public/protected methods:**

- `getAllEncampments`
- `getEncampmentById`
- `getEncampmentsInViewport`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for npcencampment features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/NPC/NPCTemplateController.java.md`

# NPCTemplateController

**Package:** `net.daisyquest.daisyquestgame.Controller.NPC`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Controller`

**Fields (declared):**

- `itemService`
- `npcTemplateService`
- `spellService`

**Public/protected methods:**

- `deleteTemplate`
- `getTemplate`
- `listTemplates`
- `saveTemplate`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for npctemplate features and UI flows. Key annotations include: Controller. Declares 3 fields that capture state and configuration for this type. Provides 4 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/PlayerController.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Controller/PlayerInventoryController.java.md`

# PlayerInventoryController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `playerService`

**Public/protected methods:**

- `dropItem`
- `equipItem`
- `getInventory`
- `moveEquipment`
- `moveItem`
- `sendItem`
- `unequipItem`
- `unequipToSlot`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for player inventory features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/ProgressionController.java.md`

# ProgressionController

**Type:** `class`

**Fields (declared):**

- `activityService`
- `playerProgressionService`
- `playerService`

**Public/protected methods:**

- `awardAchievement`
- `completeActivity`
- `completeQuest`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for progression features and UI flows. Declares 3 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/QuestController.java.md`

# QuestController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `questService`

**Public/protected methods:**

- `completeQuest`
- `createQuest`
- `deleteQuest`
- `getAllQuests`
- `getQuest`
- `startQuest`
- `updateQuest`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for quest features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 7 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/RecipeController.java.md`

# RecipeController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `attributeTemplateRepository`
- `itemService`
- `recipeService`

**Public/protected methods:**

- `create`
- `getDiscoveredRecipes`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for recipe features and UI flows. Key annotations include: RestController. Declares 3 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/RecipeDTO.java.md`

# RecipeDTO

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `attributeExperienceRewardAmounts`
- `attributeRequirements`
- `discoveredBy`
- `name`
- `requiredItemIdsAndAmounts`
- `resultItemId`

**Summary:**

- Data transfer object for recipe dto API or UI transport. Key annotations include: Data. Declares 6 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/RewardController.java.md`

# RewardController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `rewardService`

**Public/protected methods:**

- `canClaimDailyReward`
- `claimDailyReward`
- `claimReward`
- `getUnclaimedRewards`
- `openChest`
- `openRandomChest`
- `testRandomReward`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for reward features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 7 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/ShopController.java.md`

# ShopController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `shopService`

**Public/protected methods:**

- `buyItem`
- `getAllShops`
- `getShop`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for shop features and UI flows. Key annotations include: RestController. Declares 1 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/SpecialAttackController.java.md`

# SpecialAttackController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `RestController`

**Fields (declared):**

- `playerService`
- `specialAttackService`

**Public/protected methods:**

- `getPlayerSpecialAttacks`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for special attack features and UI flows. Key annotations include: RestController. Declares 2 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/SpriteUpdateRequest.java.md`

# SpriteUpdateRequest

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `subspriteBackground`
- `subspriteEyes`
- `subspriteFace`
- `subspriteHairHat`

**Summary:**

- DTO used to receive sprite update request payloads from clients or controllers. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/SubmapController.java.md`

# SubmapController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Getter`
- `RestController`
- `Setter`

**Fields (declared):**

- `playerId`
- `submapService`
- `x`
- `y`

**Public/protected methods:**

- `createSubmap`
- `deleteSubmap`
- `getAllSubmaps`
- `getPlayersInSubmap`
- `getSubmapById`
- `movePlayerInSubmap`
- `movePlayerToSubmap`
- `returnToOverworld`
- `updateSubmap`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for submap features and UI flows. Key annotations include: Getter, RestController, Setter. Declares 4 fields that capture state and configuration for this type. Provides 9 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/Tool/SpecialAttackEditorController.java.md`

# SpecialAttackEditorController

**Package:** `net.daisyquest.daisyquestgame.Controller.Tool`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Controller`
- `Data`

**Fields (declared):**

- `itemId`
- `itemRepository`
- `specialAttack`
- `specialAttackService`
- `statusEffectService`

**Public/protected methods:**

- `editorPage`
- `getSpecialAttack`
- `saveSpecialAttack`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for special attack editor features and UI flows. Key annotations include: Controller, Data. Declares 5 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/View/CastleViewController.java.md`

# CastleViewController

**Package:** `net.daisyquest.daisyquestgame.Controller.View`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Controller`

**Fields (declared):**

- `castleService`
- `playerService`

**Public/protected methods:**

- `castleView`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for castle view features and UI flows. Key annotations include: Controller. Declares 2 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/WorldMapController.java.md`

# WorldMapController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`
- `RestController`

**Fields (declared):**

- `interactionData`
- `interactionType`
- `newX`
- `newY`
- `playerId`
- `worldMapService`
- `worldObjectRepository`

**Public/protected methods:**

- `cancelInteraction`
- `checkSubmapEntrance`
- `getLandAtPosition`
- `getMapItemsInViewport`
- `getPlayersInViewport`
- `getSubmapEntrances`
- `getWorldMap`
- `getWorldObjectsInViewport`
- `movePlayer`
- `pickupItem`
- `startInteraction`
- `updateInteractionProgress`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for world map features and UI flows. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor, RestController. Declares 7 fields that capture state and configuration for this type. Provides 12 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/WorldObjectTypeEditorController.java.md`

# WorldObjectTypeEditorController

**Package:** `net.daisyquest.daisyquestgame.Controller`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Controller`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `itemRepository`
- `message`
- `objectMapper`
- `timestamp`
- `worldObjectType`
- `worldObjectTypeRepository`

**Public/protected methods:**

- `editorPage`
- `handleMessageNotReadable`
- `saveWorldObjectType`

**Summary:**

- Spring MVC controller that exposes HTTP endpoints for world object type editor features and UI flows. Key annotations include: AllArgsConstructor, Controller, Data, NoArgsConstructor. Declares 6 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Controller/WorldObjectsManagerController.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/DaisyQuestApplication.java.md`

# DaisyQuestApplication

**Package:** `net.daisyquest.daisyquestgame`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `SpringBootApplication`

**Public/protected methods:**

- `main`

**Summary:**

- Configuration/bootstrapping class for daisy quest application application setup. Key annotations include: SpringBootApplication. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Action.java.md`

# Action

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `actionPoints`
- `playerId`
- `specialAttackId`
- `spellId`
- `targetPlayerId`
- `type`

**Summary:**

- Domain model representing action within the game state and persistence layer. Key annotations include: Data. Declares 6 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ActionPhase.java.md`

# ActionPhase

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Enum constants:**

- `PRE_ACTION_PHASE`
- `ACTION_PHASE`
- `POST_ACTION_PHASE`

**Summary:**

- Defines the `ActionPhase` enum representing action phase options used in gameplay and data modeling.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Activity.java.md`

# Activity

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `attributeRewards`
- `description`
- `duration`
- `equipmentRequirements`
- `experienceReward`
- `id`
- `itemRequirements`
- `itemRewards`
- `name`
- `requirements`

**Summary:**

- Domain model representing activity within the game state and persistence layer. Key annotations include: Data. Declares 10 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ActivityCompletionResult.java.md`

# ActivityCompletionResult

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `amount`
- `attributeIncreases`
- `experienceGained`
- `name`
- `rewards`

**Summary:**

- Domain model representing activity completion result within the game state and persistence layer. Key annotations include: Data. Declares 5 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/AttackType.java.md`

# AttackType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `id`
- `name`

**Summary:**

- Domain model representing attack type within the game state and persistence layer. Key annotations include: Data. Declares 2 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Attribute.java.md`

# Attribute

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `experience`
- `level`
- `name`
- `sprite`

**Public/protected methods:**

- `getSprite`
- `getSpriteFileNameWithoutExtension`

**Summary:**

- Domain model representing attribute within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/AttributeRequirement.java.md`

# AttributeRequirement

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`

**Fields (declared):**

- `attributeName`
- `requiredLevel`

**Public/protected methods:**

- `consume`
- `getDescription`
- `isMet`

**Summary:**

- Domain model representing attribute requirement within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data. Declares 2 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/AttributeTemplate.java.md`

# AttributeTemplate

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `id`
- `name`
- `spriteName`

**Summary:**

- Domain model representing attribute template within the game state and persistence layer. Key annotations include: Data. Declares 3 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Building.java.md`

# Building

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `buildingType`
- `defencePower`
- `hp`
- `id`
- `level`

**Summary:**

- Domain model representing building within the game state and persistence layer. Key annotations include: Data. Declares 5 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/BuildingType.java.md`

# BuildingType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `availableTroops`
- `baseDefencePower`
- `baseHp`
- `castleHPContribution`
- `displaySprite`
- `id`
- `limitPerCastle`
- `name`
- `threatLevel`

**Summary:**

- Domain model representing building type within the game state and persistence layer. Key annotations include: Data. Declares 9 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Castle.java.md`

# Castle

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `buildings`
- `health`
- `id`
- `owner`
- `tacticLevel`
- `threatLevel`
- `troops`

**Summary:**

- Domain model representing castle within the game state and persistence layer. Key annotations include: Data. Declares 7 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ChatMessage.java.md`

# ChatMessage

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `content`
- `id`
- `recipientId`
- `roomId`
- `senderId`
- `timestamp`

**Summary:**

- Domain model representing chat message within the game state and persistence layer. Key annotations include: Data. Declares 6 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ChatRoom.java.md`

# ChatRoom

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `id`
- `isPublic`
- `name`
- `participants`

**Summary:**

- Domain model representing chat room within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Chest.java.md`

# Chest

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `description`
- `id`
- `itemId`
- `name`
- `potentialRewards`

**Summary:**

- Domain model representing chest within the game state and persistence layer. Key annotations include: Data. Declares 5 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Combat.java.md`

# Combat

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `active`
- `combatLogIds`
- `createdAt`
- `currentPhase`
- `currentTurnPlayerId`
- `id`
- `playerActionPoints`
- `playerEquipmentBonuses`
- `playerHealth`
- `playerHealthStarting`
- `playerIds`
- `playerSpecialAttacks`
- `playerStatusEffects`
- `playerTeams`
- `spellCooldowns`
- `turnDurationSeconds`
- `turnNumber`
- `turnStartTime`

**Public/protected methods:**

- `addPlayerSpecialAttack`
- `addStatusEffect`
- `applyDamage`
- `getPlayerSpecialAttacks`
- `hasSpecialAttack`
- `progressPhase`
- `removePlayerSpecialAttack`
- `removeStatusEffect`
- `setPlayerSpecialAttacks`

**Summary:**

- Domain model representing combat within the game state and persistence layer. Key annotations include: Data. Declares 18 fields that capture state and configuration for this type. Provides 9 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/CombatLog.java.md`

# CombatLog

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `actionType`
- `actorId`
- `combatId`
- `description`
- `id`
- `isNeutral`
- `targetId`
- `timestamp`
- `turnNumber`

**Summary:**

- Domain model representing combat log within the game state and persistence layer. Key annotations include: Data. Declares 9 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/CombatStatusContainer.java.md`

# CombatStatusContainer

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `playerId`
- `statusEffectDurations`

**Public/protected methods:**

- `addStatusEffect`
- `decrementDurations`
- `getRemainingDuration`
- `hasStatusEffect`
- `removeStatusEffect`
- `updateStatusEffectDuration`

**Summary:**

- Domain model representing combat status container within the game state and persistence layer. Key annotations include: Data. Declares 2 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/CombatTypeMapping.java.md`

# CombatTypeMapping

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Fields (declared):**

- `id`
- `strengthWeaknessMap`

**Public/protected methods:**

- `addMapping`
- `getMultiplier`

**Summary:**

- Domain model representing combat type mapping within the game state and persistence layer. Declares 2 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Currency.java.md`

# Currency

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `description`
- `id`
- `name`
- `symbol`

**Summary:**

- Domain model representing currency within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/DefenseType.java.md`

# DefenseType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `id`
- `name`

**Summary:**

- Domain model representing defense type within the game state and persistence layer. Key annotations include: Data. Declares 2 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/DuelRequest.java.md`

# DuelRequest

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `challengerId`
- `targetId`

**Summary:**

- DTO used to receive duel request payloads from clients or controllers. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 2 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Dungeon.java.md`

# Dungeon

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Summary:**

- Domain model representing dungeon within the game state and persistence layer.

### `src/main/java/net/daisyquest/daisyquestgame/Model/EncampmentRewardData.java.md`

# EncampmentRewardData

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Summary:**

- Domain model representing encampment reward data within the game state and persistence layer. Key annotations include: Data.

### `src/main/java/net/daisyquest/daisyquestgame/Model/EnvironmentEffect.java.md`

# EnvironmentEffect

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Summary:**

- Domain model representing environment effect within the game state and persistence layer. Key annotations include: Data.

### `src/main/java/net/daisyquest/daisyquestgame/Model/EquipmentProperty.java.md`

# EquipmentProperty

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Summary:**

- Domain model representing equipment property within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor.

### `src/main/java/net/daisyquest/daisyquestgame/Model/EquipmentSlot.java.md`

# EquipmentSlot

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `item`
- `quantity`
- `type`

**Public/protected methods:**

- `canEquip`
- `equip`
- `unequip`

**Summary:**

- Domain model representing equipment slot within the game state and persistence layer. Key annotations include: Data. Declares 3 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ErrorResponse.java.md`

# ErrorResponse

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `error`

**Summary:**

- DTO used to return error response results to clients or controllers. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 1 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/IRequirement.java.md`

# IRequirement

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `interface`

**Summary:**

- Domain model representing irequirement within the game state and persistence layer.

### `src/main/java/net/daisyquest/daisyquestgame/Model/InsufficientItemQuantityException.java.md`

# InsufficientItemQuantityException

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Summary:**

- Custom exception type for signaling insufficient item quantity exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Model/InteractionOption.java.md`

# InteractionOption

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `requirements`
- `rewards`

**Public/protected methods:**

- `addRequirement`

**Summary:**

- Domain model representing interaction option within the game state and persistence layer. Key annotations include: Data. Declares 2 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/InteractionResult.java.md`

# InteractionResult

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `activeInteractionId`
- `completed`
- `interactionType`
- `message`
- `stateData`
- `success`

**Public/protected methods:**

- `addStateData`
- `completed`
- `failure`
- `getStateData`
- `markCompleted`
- `success`

**Summary:**

- Domain model representing interaction result within the game state and persistence layer. Key annotations include: Data, NoArgsConstructor. Declares 6 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/InteractionType.java.md`

# InteractionType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Enum constants:**

- `SKILL`
- `CONTAINER`
- `TRAVEL`
- `BATTLE`
- `INSTANT`
- `CONTINUOUS`
- `QUEST`

**Summary:**

- Defines the `InteractionType` enum representing interaction type options used in gameplay and data modeling.

### `src/main/java/net/daisyquest/daisyquestgame/Model/InventorySlot.java.md`

# InventorySlot

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `item`
- `quantity`
- `slotIndex`

**Public/protected methods:**

- `addItem`
- `canAddItem`
- `getAvailableSpace`
- `hasItem`
- `removeItem`

**Summary:**

- Domain model representing inventory slot within the game state and persistence layer. Key annotations include: Data. Declares 3 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Item.java.md`

# Item

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `attributeModifiers`
- `attributeRequirements`
- `description`
- `equipmentPropertyModifiers`
- `equipmentSlotTypeString`
- `equippable`
- `equippableInStacks`
- `id`
- `isChest`
- `maxStackSize`
- `name`
- `rarity`
- `retainOnDeath`
- `sellPrice`
- `spriteName`
- `stackable`

**Public/protected methods:**

- `getMaxStackSize`
- `meetsRequirements`
- `setMaxStackSize`

**Summary:**

- Domain model representing item within the game state and persistence layer. Key annotations include: Data. Declares 16 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ItemNotFoundException.java.md`

# ItemNotFoundException

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Summary:**

- Custom exception type for signaling item not found exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ItemRequirement.java.md`

# ItemRequirement

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`

**Fields (declared):**

- `consume`
- `itemId`
- `quantity`

**Public/protected methods:**

- `consume`
- `getDescription`
- `isMet`

**Summary:**

- Domain model representing item requirement within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data. Declares 3 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ItemTransferRequest.java.md`

# ItemTransferRequest

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `fromPlayerId`
- `itemId`
- `toPlayerId`

**Summary:**

- DTO used to receive item transfer request payloads from clients or controllers. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 3 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Land.java.md`

# Land

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `XCoordinate`
- `YCoordinate`
- `forSale`
- `id`
- `landType`
- `owner`
- `partitions`
- `salePrice`
- `worldMap`

**Public/protected methods:**

- `addPartition`
- `getTotalPartitionArea`
- `getUnpartitionedArea`
- `isPartitioned`
- `processUpdate`
- `removePartition`
- `setGovernor`
- `setPayoutInterval`

**Summary:**

- Domain model representing land within the game state and persistence layer. Key annotations include: Data. Declares 9 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/LandPartition.java.md`

# LandPartition

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `area`
- `governor`
- `payoutInterval`
- `updatesTilPayout`

**Public/protected methods:**

- `decrementUpdatesTilPayout`
- `resetUpdatesTilPayout`
- `shouldPayout`

**Summary:**

- Domain model representing land partition within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/LandType.java.md`

# LandType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Enum constants:**

- `PLAINS(0.1`
- `0)`
- `FOREST(0.2`
- `-0.1)`
- `MOUNTAIN(0.3`
- `-0.2)`
- `DESERT(0`
- `0.1)`
- `WATER(-0.1`
- `0.2)`

**Fields (declared):**

- `developmentPenalty`
- `resourceBonus`

**Public/protected methods:**

- `getDevelopmentPenalty`
- `getResourceBonus`

**Summary:**

- Defines the `LandType` enum representing land type options used in gameplay and data modeling. Declares 2 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/LifeForce.java.md`

# LifeForce

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`
- `Getter`

**Summary:**

- Domain model representing life force within the game state and persistence layer. Key annotations include: Data, Getter.

### `src/main/java/net/daisyquest/daisyquestgame/Model/MapItem.java.md`

# MapItem

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `currentSubmapId`
- `droppedBy`
- `durationRemainingMs`
- `durationStartAmountMs`
- `id`
- `item`
- `quantity`
- `submapCoordinateX`
- `submapCoordinateY`
- `visibilityPrivacyRemainingTimerMs`
- `visibilityPrivacyTimerStartAmountMs`
- `worldMapCoordinateX`
- `worldMapCoordinateY`

**Summary:**

- Domain model representing map item within the game state and persistence layer. Key annotations include: Data. Declares 13 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/NPCEncampment.java.md`

# NPCEncampment

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `bossNPCs`
- `bossPlayerIds`
- `coordinateX`
- `coordinateY`
- `id`
- `isSubmap`
- `name`
- `npcsToSpawn`
- `rewards`
- `sprite`
- `submapId`

**Summary:**

- Domain model representing npcencampment within the game state and persistence layer. Key annotations include: Data. Declares 11 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/NPCTemplate.java.md`

# NPCTemplate

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `currentMana`
- `duelable`
- `id`
- `items`
- `maxMana`
- `name`
- `spells`
- `sprite`

**Summary:**

- Domain model representing npctemplate within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 8 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Player.java.md`

# Player

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `achievements`
- `attributes`
- `chatRoomIds`
- `completedQuests`
- `currentMana`
- `currentSubmapId`
- `duelable`
- `emailAddress`
- `id`
- `inventory`
- `isAlive`
- `isNPC`
- `knownSpells`
- `lastDailyRewardClaim`
- `level`
- `lifeForces`
- `markedForDeletion`
- `maxMana`
- `playerControlledEntityIds`
- `resources`
- `submapCoordinateX`
- `submapCoordinateY`
- `submapCoordinateZ`
- `subspriteBackground`
- `subspriteEyes`
- `subspriteFace`
- `subspriteHairHat`
- `talentPointsAvailable`
- `talents`
- `totalExperience`
- `unclaimedRewards`
- `unreadMessages`
- `username`
- `worldPositionX`
- `worldPositionY`

**Summary:**

- Domain model representing player within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 35 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/PlayerInventory.java.md`

# PlayerInventory

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `EQUIPMENT_SLOT_TYPES`
- `currencies`
- `equipmentSlots`
- `id`
- `inventorySlots`
- `logger`
- `maxInventorySize`
- `playerId`

**Public/protected methods:**

- `addItem`
- `calculateEffectiveEquipmentBonuses`
- `canAddItem`
- `getInventoryContents`
- `getItemQuantity`
- `hasItem`
- `initializePlayerInventoryIfNecessary`
- `removeItem`

**Summary:**

- Domain model representing player inventory within the game state and persistence layer. Key annotations include: Data. Declares 8 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/PlayerLifeForces.java.md`

# PlayerLifeForces

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Public/protected methods:**

- `addToLifeForce`
- `setLifeForce`
- `subtractFromLifeForce`

**Summary:**

- Domain model representing player life forces within the game state and persistence layer. Key annotations include: Data. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Quest.java.md`

# Quest

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`
- `Getter`
- `Setter`

**Fields (declared):**

- `attributeRewards`
- `description`
- `duration`
- `experienceReward`
- `id`
- `itemRewards`
- `name`
- `requirements`

**Summary:**

- Domain model representing quest within the game state and persistence layer. Key annotations include: Data, Getter, Setter. Declares 8 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/QuestCompletionResult.java.md`

# QuestCompletionResult

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Getter`

**Fields (declared):**

- `amount`
- `attributeIncreases`
- `experienceGained`
- `name`
- `rewards`

**Summary:**

- Domain model representing quest completion result within the game state and persistence layer. Key annotations include: Getter. Declares 5 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Rarity.java.md`

# Rarity

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Getter`

**Enum constants:**

- `JUNK`
- `// Dark gray
    COMMON`
- `// White
    UNCOMMON`
- `// Green
    RARE`
- `// Blue
    EPIC`
- `// Purple
    LEGENDARY`
- `// Orange
    SUPERLATIVE`

**Fields (declared):**

- `colorHexCode`

**Summary:**

- Defines the `Rarity` enum representing rarity options used in gameplay and data modeling. Key annotations include: AllArgsConstructor, Getter. Declares 1 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Recipe.java.md`

# Recipe

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `attributeExperienceRewardAmounts`
- `attributeRequirements`
- `discoveredBy`
- `discoveryDateTime`
- `id`
- `name`
- `requiredItemIdsAndAmounts`
- `resultItemId`

**Summary:**

- Domain model representing recipe within the game state and persistence layer. Key annotations include: Data. Declares 8 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Requirements.java.md`

# Requirements

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `requirements`

**Public/protected methods:**

- `checkAll`
- `consumeAll`
- `get`
- `getUnmetRequirements`

**Summary:**

- Domain model representing requirements within the game state and persistence layer. Key annotations include: Data. Declares 1 fields that capture state and configuration for this type. Provides 4 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Reward.java.md`

# Reward

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `quantity`
- `rewardId`
- `type`

**Summary:**

- Domain model representing reward within the game state and persistence layer. Key annotations include: Data. Declares 3 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/RewardContainer.java.md`

# RewardContainer

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `id`
- `multipliers`
- `playerId`
- `rewards`

**Summary:**

- Domain model representing reward container within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/RewardType.java.md`

# RewardType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Enum constants:**

- `CURRENCY`
- `RESOURCE`
- `ITEM`
- `ATTRIBUTE_EXPERIENCE`

**Summary:**

- Defines the `RewardType` enum representing reward type options used in gameplay and data modeling.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Shop.java.md`

# Shop

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `id`
- `items`
- `name`
- `ownerId`

**Summary:**

- Domain model representing shop within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/ShopItem.java.md`

# ShopItem

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `currencyUsed`
- `id`
- `itemForSale`
- `price`
- `quantity`

**Summary:**

- Domain model representing shop item within the game state and persistence layer. Key annotations include: Data. Declares 5 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/SimulationLog.java.md`

# SimulationLog

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `castleId`
- `castleSurvived`
- `damageToCastle`
- `events`
- `finalAttackerCount`
- `finalDefenderCount`
- `id`
- `initialAttackerCount`
- `initialDefenderCount`
- `timestamp`

**Summary:**

- Domain model representing simulation log within the game state and persistence layer. Key annotations include: Data. Declares 10 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/SkillRequirement.java.md`

# SkillRequirement

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `skillId`

**Public/protected methods:**

- `consume`
- `getDescription`
- `isMet`

**Summary:**

- Domain model representing skill requirement within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 1 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/SpecialAttack.java.md`

# SpecialAttack

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`

**Fields (declared):**

- `attackQuantity`
- `cooldown`
- `description`
- `duration`
- `id`
- `name`
- `specialAttackId`
- `specialAttackSpritePath`
- `statusEffect`
- `statusEffects`

**Public/protected methods:**

- `addStatusEffectApplication`

**Summary:**

- Domain model representing special attack within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data. Declares 10 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Spell.java.md`

# Spell

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `cooldown`
- `description`
- `duration`
- `effect`
- `id`
- `manaCost`
- `name`
- `spellSpritePath`
- `statusEffect`
- `statusEffects`

**Public/protected methods:**

- `addStatusEffectApplication`
- `applyStatusEffects`

**Summary:**

- Domain model representing spell within the game state and persistence layer. Key annotations include: Data. Declares 10 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/SpellRequirement.java.md`

# SpellRequirement

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`

**Fields (declared):**

- `spellId`

**Public/protected methods:**

- `consume`
- `getDescription`
- `isMet`

**Summary:**

- Domain model representing spell requirement within the game state and persistence layer. Key annotations include: AllArgsConstructor, Data. Declares 1 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/StatusEffect.java.md`

# StatusEffect

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `borderColor`
- `color`
- `displayName`
- `iconPath`
- `id`
- `playerStatuses`
- `properties`
- `shortDisplayName`

**Summary:**

- Domain model representing status effect within the game state and persistence layer. Key annotations include: Data. Declares 8 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/StatusEffectInfo.java.md`

# StatusEffectInfo

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `duration`
- `statusEffect`

**Summary:**

- Domain model representing status effect info within the game state and persistence layer. Key annotations include: Data. Declares 2 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/StatusEffectPropertyContainer.java.md`

# StatusEffectPropertyContainer

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `amount`
- `formatString`
- `id`
- `moreData`
- `name`
- `type`

**Summary:**

- Domain model representing status effect property container within the game state and persistence layer. Key annotations include: Data. Declares 6 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/StatusEffectPropertyType.java.md`

# StatusEffectPropertyType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Spring/JPA/Lombok annotations:**

- `Getter`

**Enum constants:**

- `DAMAGE_PRE_TURN`
- `DAMAGE_POST_TURN`
- `DAMAGE_ON_ACTION`
- `HEALING_PRE_TURN`
- `HEALING_POST_TURN`
- `VAMPIRISM_FLAT_INTEGER`
- `VAMPIRISM_PERCENT_DAMAGE`
- `BUFF_PERCENTAGE`
- `BUFF_FLAT_INTEGER`
- `DEBUFF_PERCENTAGE`
- `DEBUFF_FLAT_INTEGER`
- `DISABLE`
- `POST_COMBAT`

**Summary:**

- Defines the `StatusEffectPropertyType` enum representing status effect property type options used in gameplay and data modeling. Key annotations include: Getter.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Submap.java.md`

# Submap

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `audioFileName`
- `description`
- `height`
- `id`
- `instanceId`
- `instanced`
- `isPVPEnabled`
- `isSafe`
- `landId`
- `length`
- `nonconsentualPVPEnabled`
- `playerOwnerId`
- `regionId`
- `startXCoordinate`
- `startYCoordinate`
- `startZCoodinate`
- `title`
- `width`

**Summary:**

- Domain model representing submap within the game state and persistence layer. Key annotations include: Data. Declares 18 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/SubmapEntranceDTO.java.md`

# SubmapEntranceDTO

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Fields (declared):**

- `submapId`
- `x`
- `y`

**Public/protected methods:**

- `getSubmapId`
- `getX`
- `getY`
- `setSubmapId`
- `setX`
- `setY`

**Summary:**

- Data transfer object for submap entrance dto API or UI transport. Declares 3 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/SubmapType.java.md`

# SubmapType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Summary:**

- Domain model representing submap type within the game state and persistence layer. Key annotations include: Data.

### `src/main/java/net/daisyquest/daisyquestgame/Model/SuccessResponse.java.md`

# SuccessResponse

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `AllArgsConstructor`
- `Data`
- `NoArgsConstructor`

**Fields (declared):**

- `message`
- `success`

**Summary:**

- DTO used to return success response results to clients or controllers. Key annotations include: AllArgsConstructor, Data, NoArgsConstructor. Declares 2 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Talent.java.md`

# Talent

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Spring/JPA/Lombok annotations:**

- `Getter`

**Enum constants:**

- `FIREBALL_MASTERY`
- `ICEBALL_MASTERY`
- `THUNDER_MASTERY`
- `CRITICAL_STRIKE`
- `DODGE`
- `RESOURCE_EFFICIENCY`
- `EXTRA_LOOT`
- `MANA_REGENERATION`
- `HEALTH_BOOST`
- `SPELL_POWER`

**Fields (declared):**

- `spriteFilename`

**Public/protected methods:**

- `getSpriteFilename`

**Summary:**

- Defines the `Talent` enum representing talent options used in gameplay and data modeling. Key annotations include: Getter. Declares 1 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Model/Troop.java.md`

# Troop

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `apMod`
- `attackPower`
- `defensePower`
- `dpMod`
- `experience`
- `hp`
- `hpMod`
- `id`
- `isHostile`
- `isNeutral`
- `killCount`
- `level`
- `position`
- `title`
- `troopType`

**Summary:**

- Domain model representing troop within the game state and persistence layer. Key annotations include: Data. Declares 15 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/TroopTitle.java.md`

# TroopTitle

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `id`
- `minKillCount`
- `title`

**Summary:**

- Domain model representing troop title within the game state and persistence layer. Key annotations include: Data. Declares 3 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/TroopType.java.md`

# TroopType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `attackRange`
- `attackTypes`
- `baseAttackPower`
- `baseDefencePower`
- `baseHp`
- `defenseTypes`
- `experienceValue`
- `id`
- `name`

**Summary:**

- Domain model representing troop type within the game state and persistence layer. Key annotations include: Data. Declares 9 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/TurnPhase.java.md`

# TurnPhase

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Enum constants:**

- `START_PHASE`
- `PLAYER_PHASE`
- `END_PHASE`

**Summary:**

- Defines the `TurnPhase` enum representing turn phase options used in gameplay and data modeling.

### `src/main/java/net/daisyquest/daisyquestgame/Model/WorldMap.java.md`

# WorldMap

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `height`
- `id`
- `length`
- `width`

**Summary:**

- Domain model representing world map within the game state and persistence layer. Key annotations include: Data. Declares 4 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/WorldObject.java.md`

# WorldObject

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Summary:**

- Domain model representing world object within the game state and persistence layer. Key annotations include: Data.

### `src/main/java/net/daisyquest/daisyquestgame/Model/WorldObjectInteractionRequest.java.md`

# WorldObjectInteractionRequest

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `interactionType`
- `playerId`
- `worldObjectId`

**Summary:**

- DTO used to receive world object interaction request payloads from clients or controllers. Key annotations include: Data. Declares 3 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Model/WorldObjectTraversalType.java.md`

# WorldObjectTraversalType

**Package:** `net.daisyquest.daisyquestgame.Model`

**Type:** `enum`

**Enum constants:**

- `FREE`
- `TOUGH`
- `WATER`
- `NONE`

**Summary:**

- Defines the `WorldObjectTraversalType` enum representing world object traversal type options used in gameplay and data modeling.

### `src/main/java/net/daisyquest/daisyquestgame/Model/WorldObjectType.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ActiveInteractionRepository.java.md`

# ActiveInteractionRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying active interaction entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ActivityRepository.java.md`

# ActivityRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying activity entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/AttributeTemplateRepository.java.md`

# AttributeTemplateRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying attribute template entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/BuildingRepository.java.md`

# BuildingRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying building entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/BuildingTypeRepository.java.md`

# BuildingTypeRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying building type entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/CastleRepository.java.md`

# CastleRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying castle entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ChatMessageRepository.java.md`

# ChatMessageRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying chat message entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ChatRoomRepository.java.md`

# ChatRoomRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying chat room entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ChestRepository.java.md`

# ChestRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying chest entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/CombatLogRepository.java.md`

# CombatLogRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying combat log entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/CombatRepository.java.md`

# CombatRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Spring/JPA/Lombok annotations:**

- `Repository`

**Summary:**

- Spring Data repository interface for persisting and querying combat entities. Key annotations include: Repository.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/CurrencyRepository.java.md`

# CurrencyRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Spring/JPA/Lombok annotations:**

- `Repository`

**Summary:**

- Spring Data repository interface for persisting and querying currency entities. Key annotations include: Repository.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ItemRepository.java.md`

# ItemRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying item entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/LandRepository.java.md`

# LandRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying land entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/MapItemRepository.java.md`

# MapItemRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying map item entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/NPCEncampmentRepository.java.md`

# NPCEncampmentRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Spring/JPA/Lombok annotations:**

- `Repository`

**Summary:**

- Spring Data repository interface for persisting and querying npcencampment entities. Key annotations include: Repository.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/NPCTemplateRepository.java.md`

# NPCTemplateRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying npctemplate entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/PlayerInventoryRepository.java.md`

# PlayerInventoryRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying player inventory entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/PlayerRepository.java.md`

# PlayerRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying player entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/QuestRepository.java.md`

# QuestRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying quest entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/RecipeRepository.java.md`

# RecipeRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying recipe entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/RewardContainerRepository.java.md`

# RewardContainerRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying reward container entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ShopItemRepository.java.md`

# ShopItemRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Spring/JPA/Lombok annotations:**

- `Repository`

**Summary:**

- Spring Data repository interface for persisting and querying shop item entities. Key annotations include: Repository.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/ShopRepository.java.md`

# ShopRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Spring/JPA/Lombok annotations:**

- `Repository`

**Summary:**

- Spring Data repository interface for persisting and querying shop entities. Key annotations include: Repository.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/SimulationLogRepository.java.md`

# SimulationLogRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying simulation log entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/SpecialAttackRepository.java.md`

# SpecialAttackRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying special attack entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/StatusEffectRepository.java.md`

# StatusEffectRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying status effect entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/SubmapRepository.java.md`

# SubmapRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying submap entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/TroopRepository.java.md`

# TroopRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying troop entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/TroopTitleRepository.java.md`

# TroopTitleRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying troop title entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/TroopTypeRepository.java.md`

# TroopTypeRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying troop type entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/WorldMapRepository.java.md`

# WorldMapRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying world map entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/WorldObjectRepository.java.md`

# WorldObjectRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying world object entities.

### `src/main/java/net/daisyquest/daisyquestgame/Repository/WorldObjectTypeRepository.java.md`

# WorldObjectTypeRepository

**Package:** `net.daisyquest.daisyquestgame.Repository`

**Type:** `interface`

**Summary:**

- Spring Data repository interface for persisting and querying world object type entities.

### `src/main/java/net/daisyquest/daisyquestgame/Service/ActiveInteraction.java.md`

# ActiveInteraction

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Data`

**Fields (declared):**

- `endTime`
- `id`
- `interactionType`
- `playerId`
- `startTime`
- `stateData`
- `status`
- `worldObjectId`

**Summary:**

- Class representing active interaction functionality in the DaisyQuest codebase. Key annotations include: Data. Declares 8 fields that capture state and configuration for this type.

### `src/main/java/net/daisyquest/daisyquestgame/Service/ActivityExecutionService.java.md`

# ActivityExecutionService

**Type:** `class`

**Fields (declared):**

- `activityService`
- `context`
- `playerService`

**Public/protected methods:**

- `executeActivity`

**Summary:**

- Service-layer component that encapsulates activity execution business logic and orchestration. Declares 3 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/ActivityService.java.md`

# ActivityService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `activityRepository`
- `itemService`
- `playerInventoryRepository`
- `playerService`

**Public/protected methods:**

- `completeActivity`
- `createActivity`
- `deleteActivity`
- `getActivity`
- `getAllActivities`
- `startActivity`
- `updateActivity`

**Summary:**

- Service-layer component that encapsulates activity business logic and orchestration. Key annotations include: Service. Declares 4 fields that capture state and configuration for this type. Provides 7 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/CacheManagerService.java.md`

# CacheManagerService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `cacheableServices`

**Public/protected methods:**

- `clearAllCaches`
- `clearCacheByServiceName`
- `listCacheableServices`

**Summary:**

- Service-layer component that encapsulates cache manager business logic and orchestration. Key annotations include: Service. Declares 1 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/CastleService.java.md`

# CastleService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `buildingRepository`
- `buildingTypeRepository`
- `castleRepository`
- `playerService`
- `troopRepository`
- `troopTypeRepository`

**Public/protected methods:**

- `addBuilding`
- `addTroop`
- `calculateCastleStats`
- `createCastle`
- `getCastleById`
- `getCastleByOwnerId`
- `getCastleForPlayer`
- `getCastleSimulations`
- `switchTroopPosition`

**Summary:**

- Service-layer component that encapsulates castle business logic and orchestration. Key annotations include: Service. Declares 6 fields that capture state and configuration for this type. Provides 9 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/ChatService.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Service/CombatService.java.md`

# CombatService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `BASE_CAPTURE_CHANCE`
- `CAPTURE_ITEM_ID`
- `COMBAT_EXPIRATION_MINUTES`
- `HP_COEFFICIENT`
- `INITIAL_ACTION_POINTS`
- `INITIAL_HEALTH`
- `MAX_TURNS`
- `TURN_DURATION_SECONDS`
- `combatLogRepository`
- `combatRepository`
- `itemService`
- `logger`
- `npcEncampmentService`
- `playerService`
- `random`
- `specialAttackService`
- `spellService`
- `statusEffectService`

**Public/protected methods:**

- `applyPlayerStatusEffects`
- `cleanupExpiredCombats`
- `getCombat`
- `getCombatLogs`
- `performAction`
- `processAITurns`
- `startCombat`
- `updateCooldowns`

**Summary:**

- Service-layer component that encapsulates combat business logic and orchestration. Key annotations include: Service. Declares 18 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/CraftingService.java.md`

# CraftingService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `itemService`
- `logger`
- `playerService`
- `recipeService`

**Public/protected methods:**

- `craftItem`

**Summary:**

- Service-layer component that encapsulates crafting business logic and orchestration. Key annotations include: Service. Declares 4 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/CurrencyService.java.md`

# CurrencyService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `currencyCache`
- `currencyCacheByName`
- `currencyRepository`
- `name`
- `symbol`

**Public/protected methods:**

- `createCurrency`
- `deleteCurrency`
- `getAllCurrencies`
- `getAllCurrencyDetails`
- `getCurrency`
- `getCurrencyByName`
- `getName`
- `getSymbol`
- `initializeCache`
- `refreshCache`
- `updateCurrency`

**Summary:**

- Service-layer component that encapsulates currency business logic and orchestration. Key annotations include: Service. Declares 5 fields that capture state and configuration for this type. Provides 11 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/EquipmentPropertyService.java.md`

# EquipmentPropertyService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Summary:**

- Service-layer component that encapsulates equipment property business logic and orchestration. Key annotations include: Service.

### `src/main/java/net/daisyquest/daisyquestgame/Service/EquipmentRequirementNotMetException.java.md`

# EquipmentRequirementNotMetException

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Summary:**

- Custom exception type for signaling equipment requirement not met exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/AttributeRequirementNotMetException.java.md`

# AttributeRequirementNotMetException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling attribute requirement not met exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/InsufficientFundsException.java.md`

# InsufficientFundsException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling insufficient funds exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/InsufficientItemsException.java.md`

# InsufficientItemsException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling insufficient items exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/InvalidCurrencyException.java.md`

# InvalidCurrencyException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling invalid currency exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/RecipeNotFoundException.java.md`

# RecipeNotFoundException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling recipe not found exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/RewardNotFoundException.java.md`

# RewardNotFoundException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling reward not found exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/ShopNotFoundException.java.md`

# ShopNotFoundException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling shop not found exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Failure/UsernameAlreadyExistsException.java.md`

# UsernameAlreadyExistsException

**Package:** `net.daisyquest.daisyquestgame.Service.Failure`

**Type:** `class`

**Summary:**

- Custom exception type for signaling username already exists exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Initializer/PlayerInitializer.java.md`

# PlayerInitializer

**Package:** `net.daisyquest.daisyquestgame.Service.Initializer`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Component`

**Fields (declared):**

- `INITIAL_INVENTORY_SIZE`

**Public/protected methods:**

- `getCombatAttribute`
- `getHitpointsAttribute`
- `getInitializedCombatMapForNPC`
- `initPlayer`
- `initializeCurrency`

**Summary:**

- Class representing player initializer functionality in the DaisyQuest codebase. Key annotations include: Component. Declares 1 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Initializer/TroopTitleInitializer.java.md`

# TroopTitleInitializer

**Package:** `net.daisyquest.daisyquestgame.Service.Initializer`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Component`

**Fields (declared):**

- `troopTitleRepository`

**Public/protected methods:**

- `run`

**Summary:**

- Class representing troop title initializer functionality in the DaisyQuest codebase. Key annotations include: Component. Declares 1 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Interfaces/ICacheableService.java.md`

# ICacheableService

**Package:** `net.daisyquest.daisyquestgame.Service.Interfaces`

**Type:** `interface`

**Summary:**

- Service-layer component that encapsulates icacheable business logic and orchestration.

### `src/main/java/net/daisyquest/daisyquestgame/Service/InventoryFullException.java.md`

# InventoryFullException

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Summary:**

- Custom exception type for signaling inventory full exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/ItemService.java.md`

# ItemService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `itemRepository`

**Public/protected methods:**

- `createItem`
- `deleteItem`
- `existsById`
- `generateDropsFromNPC`
- `getAllItems`
- `getItem`
- `getItemByName`
- `updateItem`

**Summary:**

- Service-layer component that encapsulates item business logic and orchestration. Key annotations include: Service. Declares 1 fields that capture state and configuration for this type. Provides 8 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/ItemSpawningService.java.md`

# ItemSpawningService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `itemRepository`
- `mapItemRepository`
- `random`
- `worldMapService`

**Public/protected methods:**

- `spawnItems`

**Summary:**

- Service-layer component that encapsulates item spawning business logic and orchestration. Key annotations include: Service. Declares 4 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Job/DailyRewardJob.java.md`

# DailyRewardJob

**Package:** `net.daisyquest.daisyquestgame.Service.Job`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Component`

**Fields (declared):**

- `playerRepository`
- `rewardContainerRepository`
- `rewardService`

**Public/protected methods:**

- `generateDailyRewards`

**Summary:**

- Scheduled/background job responsible for daily reward job processing tasks. Key annotations include: Component. Declares 3 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Job/LandProcessingJob.java.md`

# LandProcessingJob

**Package:** `net.daisyquest.daisyquestgame.Service.Job`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Component`

**Fields (declared):**

- `landService`

**Public/protected methods:**

- `processLandAndPartitions`

**Summary:**

- Scheduled/background job responsible for land processing job processing tasks. Key annotations include: Component. Declares 1 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/LandService.java.md`

# LandService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `currencyService`
- `landRepository`
- `playerService`

**Public/protected methods:**

- `buyLand`
- `cancelSale`
- `getAll`
- `getLand`
- `getLandByCoordinates`
- `getLandPrice`
- `getLandsForSale`
- `getPlayer`
- `isLandForSale`
- `processAllLandAndPartitions`
- `sellLand`
- `transferOwnership`
- `updateLand`

**Summary:**

- Service-layer component that encapsulates land business logic and orchestration. Key annotations include: Service. Declares 3 fields that capture state and configuration for this type. Provides 13 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/MapItemService.java.md`

# MapItemService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Summary:**

- Service-layer component that encapsulates map item business logic and orchestration. Key annotations include: Service.

### `src/main/java/net/daisyquest/daisyquestgame/Service/NPCEncampmentService.java.md`

# NPCEncampmentService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `ENCAMPMENT_RADIUS`
- `MAX_DISTANCE_FROM_CENTER`
- `MIN_DISTANCE_FROM_CENTER`
- `NPC_SPACING`
- `encampmentRepository`
- `equipmentPropertyService`
- `itemService`
- `playerInventoryRepository`
- `playerRepository`
- `spellService`
- `worldMapService`

**Public/protected methods:**

- `checkAndRemoveEncampment`
- `getAllEncampments`
- `getEncampmentById`
- `getEncampmentsInViewport`
- `spawnEncampments`

**Summary:**

- Service-layer component that encapsulates npcencampment business logic and orchestration. Key annotations include: Service. Declares 11 fields that capture state and configuration for this type. Provides 5 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/NPCSpawningService.java.md`

# NPCSpawningService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `equipmentPropertyService`
- `itemService`
- `npcTemplateService`
- `playerInventoryRepository`
- `playerRepository`
- `random`
- `spellService`
- `worldMapService`

**Public/protected methods:**

- `spawnNPCs`

**Summary:**

- Service-layer component that encapsulates npcspawning business logic and orchestration. Key annotations include: Service. Declares 8 fields that capture state and configuration for this type. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/NPCTemplateService.java.md`

# NPCTemplateService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `npcTemplateRepository`

**Public/protected methods:**

- `createTemplate`
- `deleteTemplate`
- `getAllTemplates`
- `getTemplateById`
- `getTemplateByName`
- `updateTemplate`

**Summary:**

- Service-layer component that encapsulates npctemplate business logic and orchestration. Key annotations include: Service. Declares 1 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/PlayerNotFoundException.java.md`

# PlayerNotFoundException

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Summary:**

- Custom exception type for signaling player not found exception error conditions in service flows.

### `src/main/java/net/daisyquest/daisyquestgame/Service/PlayerProgressionService.java.md`

# PlayerProgressionService

**Type:** `class`

**Fields (declared):**

- `BASE_XP_PER_LEVEL`
- `LEVEL_SCALING_FACTOR`
- `context`
- `playerService`
- `questService`

**Public/protected methods:**

- `awardAchievement`
- `completeActivity`
- `completeQuest`
- `gainExperience`

**Summary:**

- Service-layer component that encapsulates player progression business logic and orchestration. Declares 5 fields that capture state and configuration for this type. Provides 4 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/PlayerService.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Service/QuestService.java.md`

# QuestService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `itemService`
- `playerInventoryRepository`
- `playerService`
- `questRepository`

**Public/protected methods:**

- `completeQuest`
- `createQuest`
- `deleteQuest`
- `getAllQuests`
- `getQuest`
- `startQuest`
- `updateQuest`

**Summary:**

- Service-layer component that encapsulates quest business logic and orchestration. Key annotations include: Service. Declares 4 fields that capture state and configuration for this type. Provides 7 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/RecipeService.java.md`

# RecipeService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `recipeRepository`

**Public/protected methods:**

- `createRecipe`
- `deleteRecipe`
- `getAllRecipes`
- `getDiscoveredRecipes`
- `getRecipe`
- `getRecipeByName`
- `updateRecipe`

**Summary:**

- Service-layer component that encapsulates recipe business logic and orchestration. Key annotations include: Service. Declares 1 fields that capture state and configuration for this type. Provides 7 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/RewardGeneratorService.java.md`

# RewardGeneratorService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `interface`

**Public/protected methods:**

- `generateDailyRewards`
- `generateRewardsForChest`

**Summary:**

- Service-layer component that encapsulates reward generator business logic and orchestration. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/RewardGeneratorServiceImpl.java.md`

# RewardGeneratorServiceImpl

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `HITPOINTS_EXPERIENCE`
- `MAX_ITEM_QUANTITY`
- `MIN_ITEM_QUANTITY`
- `itemRepository`
- `random`

**Public/protected methods:**

- `generateDailyRewards`
- `generateRewardsForChest`

**Summary:**

- Class representing reward generator service impl functionality in the DaisyQuest codebase. Key annotations include: Service. Declares 5 fields that capture state and configuration for this type. Provides 2 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/RewardService.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Service/ShopService.java.md`

# ShopService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `currencyService`
- `itemService`
- `logger`
- `playerService`
- `shopItemRepository`
- `shopRepository`

**Public/protected methods:**

- `buyItem`
- `getAllShops`
- `getPlayerShop`
- `getShop`
- `listItemForSale`
- `removeShopItem`

**Summary:**

- Service-layer component that encapsulates shop business logic and orchestration. Key annotations include: Service. Declares 6 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/SimulationService.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Service/SpecialAttackService.java.md`

# SpecialAttackService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `playerService`
- `specialAttackRepository`
- `specialAttacks`
- `statusEffectService`

**Public/protected methods:**

- `addSpecialAttack`
- `clearCache`
- `getAll`
- `getAllSpecialAttacks`
- `getServiceName`
- `getSpecialAttack`
- `getSpecialAttackById`
- `getSpecialAttackByName`
- `getSpecialAttacksForPlayer`
- `removeSpecialAttack`
- `saveSpecialAttack`
- `setup`
- `specialAttackExists`
- `updateSpecialAttack`

**Summary:**

- Service-layer component that encapsulates special attack business logic and orchestration. Key annotations include: Service. Declares 4 fields that capture state and configuration for this type. Provides 14 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/SpellService.java.md`

# SpellService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `spells`
- `statusEffectService`

**Public/protected methods:**

- `clearCache`
- `getAllSpells`
- `getServiceName`
- `getSpell`
- `getSpellByName`
- `setup`

**Summary:**

- Service-layer component that encapsulates spell business logic and orchestration. Key annotations include: Service. Declares 2 fields that capture state and configuration for this type. Provides 6 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/StatusEffectService.java.md`

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

### `src/main/java/net/daisyquest/daisyquestgame/Service/SubmapService.java.md`

# SubmapService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `playerRepository`
- `submapRepository`
- `worldMapService`

**Public/protected methods:**

- `createSubmap`
- `deleteSubmap`
- `getAllSubmaps`
- `getPlayersInSubmap`
- `getSubmapById`
- `isPlayerInSubmap`
- `movePlayerInSubmap`
- `movePlayerToSubmap`
- `returnPlayerToOverworld`
- `updateSubmap`

**Summary:**

- Service-layer component that encapsulates submap business logic and orchestration. Key annotations include: Service. Declares 3 fields that capture state and configuration for this type. Provides 10 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/Temp/StatusEffectTestData.java.md`

# StatusEffectTestData

**Package:** `net.daisyquest.daisyquestgame.Service.Temp`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Component`

**Public/protected methods:**

- `createTestStatusEffects`

**Summary:**

- Class representing status effect test data functionality in the DaisyQuest codebase. Key annotations include: Component. Provides 1 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/WebSocketService.java.md`

# WebSocketService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Service`

**Fields (declared):**

- `webSocketHandler`

**Public/protected methods:**

- `sendDuelAccepted`
- `sendDuelRejection`
- `sendDuelRequest`

**Summary:**

- Service-layer component that encapsulates web socket business logic and orchestration. Key annotations include: Service. Declares 1 fields that capture state and configuration for this type. Provides 3 public/protected methods for core behaviors and accessors.

### `src/main/java/net/daisyquest/daisyquestgame/Service/WorldMapService.java.md`

# WorldMapService

**Package:** `net.daisyquest.daisyquestgame.Service`

**Type:** `class`

**Spring/JPA/Lombok annotations:**

- `Getter`
- `Service`

**Fields (declared):**

- `INTERACTION_RANGE`
- `LAND_SIZE`
- `activeInteractionRepository`
- `itemService`
- `landRepository`
- `mapItemRepository`
- `playerRepository`
- `random`
- `submapEntrances`
- `submapId`
- `worldMapRepository`
- `worldObjectRepository`
- `x`
- `y`

**Public/protected methods:**

- `cancelInteraction`
- `findMapItemsInViewport`
- `findWorldObjectsInViewport`
- `getLandAtPosition`
- `getLandByCoordinates`
- `getOrCreateWorldMap`
- `getPlayersInViewport`
- `getSubmapEntrances`
- `getSubmapIdNearPlayer`
- `getWorldMap`
- `handleWorldObjectInteraction`
- `initializeSubmapEntrances`
- `isPlayerNearSubmapEntrance`
- `movePlayer`
- `pickupItem`
- `startWorldObjectInteraction`
- `updateInteractionProgress`
- `updateLand`

**Summary:**

- Service-layer component that encapsulates world map business logic and orchestration. Key annotations include: Getter, Service. Declares 14 fields that capture state and configuration for this type. Provides 18 public/protected methods for core behaviors and accessors.

## Templates

### `src/main/resources/templates/activity-editor.html.md`

# activity-editor.html

**Summary:**

- HTML template defining the `activity-editor` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/castleDefense.html.md`

# castleDefense.html

**Summary:**

- HTML template defining the `castleDefense` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/create-recipe.html.md`

# create-recipe.html

**Summary:**

- HTML template defining the `create-recipe` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/game.html.md`

# game.html

**Summary:**

- HTML template defining the `game` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/index.html.md`

# index.html

**Summary:**

- HTML template defining the `index` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/npc-template-manager.html.md`

# npc-template-manager.html

**Summary:**

- HTML template defining the `npc-template-manager` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/register.html.md`

# register.html

**Summary:**

- HTML template defining the `register` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/special-attack-editor.html.md`

# special-attack-editor.html

**Summary:**

- HTML template defining the `special-attack-editor` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/world-object-editor.html.md`

# world-object-editor.html

**Summary:**

- HTML template defining the `world-object-editor` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/world-objects-manager.html.md`

# world-objects-manager.html

**Summary:**

- HTML template defining the `world-objects-manager` view markup, layout, and client-side hooks (forms, containers, and script/style references).

### `src/main/resources/templates/worldMap.html.md`

# worldMap.html

**Summary:**

- HTML template defining the `worldMap` view markup, layout, and client-side hooks (forms, containers, and script/style references).

## JavaScript

### `src/main/resources/static/js/MP3Player.js.md`

# MP3Player.js

**Summary:**

- JavaScript bundle for `MP3Player` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/chat.js.md`

# chat.js

**Summary:**

- JavaScript bundle for `chat` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/game.js.md`

# game.js

**Summary:**

- JavaScript bundle for `game` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/interactiveMap.js.md`

# interactiveMap.js

**Summary:**

- JavaScript bundle for `interactiveMap` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/login.js.md`

# login.js

**Summary:**

- JavaScript bundle for `login` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/playerInventory.js.md`

# playerInventory.js

**Summary:**

- JavaScript bundle for `playerInventory` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/register.js.md`

# register.js

**Summary:**

- JavaScript bundle for `register` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/spriteSelect.js.md`

# spriteSelect.js

**Summary:**

- JavaScript bundle for `spriteSelect` behaviors, UI interactions, and client-side game logic wiring.

### `src/main/resources/static/js/talentTrees.js.md`

# talentTrees.js

**Summary:**

- JavaScript bundle for `talentTrees` behaviors, UI interactions, and client-side game logic wiring.

## Stylesheets

### `src/main/resources/static/css/interactive_map.css.md`

# interactive_map.css

**Summary:**

- Stylesheet defining layout, typography, and UI visuals for `interactive_map` pages and components.

### `src/main/resources/static/css/inventory.css.md`

# inventory.css

**Summary:**

- Stylesheet defining layout, typography, and UI visuals for `inventory` pages and components.

### `src/main/resources/static/css/style.css.md`

# style.css

**Summary:**

- Stylesheet defining layout, typography, and UI visuals for `style` pages and components.

## Configuration

### `src/main/resources/application.properties.md`

# application.properties

**Summary:**

- Spring Boot application configuration properties covering server settings, data sources, and runtime feature flags for DaisyQuest.

## Static Assets (Non-code)

- `src/main/resources/static/audio/` contains MP3 soundtracks and effects used by the game client.
- `src/main/resources/static/sprites/` contains PNG/SVG sprite sheets, UI icons, and item art used by the client.

## Data Files

- `idlegame.currencies.json`, `idlegame.recipes.json`, and `items2.json` provide data snapshots for currencies, recipes, and items.
- `sample_jsons.zip` bundles sample JSON files for reference/testing.
