export const COMBAT_CONFIG = Object.freeze({
  weaponSlot: "RIGHT_HAND",
  weaponAttacks: Object.freeze({
    minSlots: 2,
    maxSlots: 5,
    fallbackLabels: Object.freeze([
      "Swift Strike",
      "Rising Cut",
      "Twin Thrust",
      "Arc Slash",
      "Meteor Chop"
    ])
  }),
  skills: Object.freeze({
    slots: 5,
    entries: Object.freeze([
      Object.freeze({ action: "special", label: "Ember Surge" }),
      Object.freeze({ action: "heal", label: "Serenity Bloom" }),
      Object.freeze({ label: "Focus Guard" }),
      Object.freeze({ label: "Lunar Step" }),
      Object.freeze({ label: "Crystal Ward" })
    ]),
    fallbackLabelPrefix: "Skill"
  })
});
