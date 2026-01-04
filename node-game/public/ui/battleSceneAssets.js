const DEFAULT_PLAYER_SPRITES = Object.freeze({
  scene: "assets/battle/avi_sprite_1_position1.png",
  portrait: "assets/battle/avi_sprite_1_position1.png",
  label: "Hero"
});

const DEFAULT_ENEMY_SPRITES = Object.freeze({
  scene: "assets/battle/otherworldly_beast.png",
  portrait: "assets/battle/otherworldly_beast.png",
  label: "Otherworldly Beast"
});

export const BATTLE_SPRITES = Object.freeze({
  player: DEFAULT_PLAYER_SPRITES,
  enemies: Object.freeze({
    default: DEFAULT_ENEMY_SPRITES,
    ember_wyrmling: Object.freeze({
      scene: "assets/battle/bigbaby.png",
      portrait: "assets/battle/bigbaby.png",
      label: "Ember Wyrmling"
    }),
    moonlit_duelist: Object.freeze({
      scene: "assets/battle/enemy_skeleton.png",
      portrait: "assets/battle/enemy_skeleton.png",
      label: "Moonlit Duelist"
    }),
    crystal_guardian: Object.freeze({
      scene: "assets/battle/enemy_skeleton_boss.png",
      portrait: "assets/battle/enemy_skeleton_boss.png",
      label: "Crystal Guardian"
    })
  })
});

export function getBattleSpriteSet({
  combatant,
  role = "enemy",
  spriteMap = BATTLE_SPRITES
} = {}) {
  if (role === "player") {
    return spriteMap.player ?? DEFAULT_PLAYER_SPRITES;
  }
  const enemySprites = spriteMap.enemies ?? {};
  if (combatant?.id && enemySprites[combatant.id]) {
    return enemySprites[combatant.id];
  }
  return enemySprites.default ?? DEFAULT_ENEMY_SPRITES;
}

export function applySpriteToImage(image, spriteSrc, altText) {
  if (!image || !spriteSrc) {
    return false;
  }
  image.src = spriteSrc;
  if (altText) {
    image.alt = altText;
  }
  image.dataset.spriteSrc = spriteSrc;
  return true;
}
