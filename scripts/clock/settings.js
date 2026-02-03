export const EOTTRPG_CLOCK_NS = "eottrpg-utilities";

export function registerClockSettings() {
  game.settings.register(EOTTRPG_CLOCK_NS, "clockEnabled", {
    name: "Demi-horloge : Activer",
    hint: "Affiche une demi-horloge sous le bandeau du temps.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(EOTTRPG_CLOCK_NS, "clockSize", {
    name: "Demi-horloge : Taille (px)",
    hint: "Diamètre du cadran. La demi-horloge affichera la moitié haute.",
    scope: "client",
    config: true,
    type: Number,
    default: 220,
    range: { min: 120, max: 520, step: 10 }
  });

  game.settings.register(EOTTRPG_CLOCK_NS, "clockOffsetDegrees", {
    name: "Demi-horloge : Offset (degrés)",
    hint: "Ajuste l’alignement du cadran (ex: 0, 90, 180...).",
    scope: "client",
    config: true,
    type: Number,
    default: 0,
    range: { min: -360, max: 360, step: 1 }
  });

  game.settings.register(EOTTRPG_CLOCK_NS, "clockAnchor", {
    name: "Demi-horloge : Ancrage",
    hint: "Où placer l’horloge sous le bandeau.",
    scope: "client",
    config: true,
    type: String,
    choices: {
      left: "Gauche",
      center: "Centre",
      right: "Droite"
    },
    default: "center"
  });

  game.settings.register(EOTTRPG_CLOCK_NS, "clockX", {
    name: "Demi-horloge : Décalage X (px)",
    hint: "Décalage horizontal fin (positif/défaut).",
    scope: "client",
    config: true,
    type: Number,
    default: 0,
    range: { min: -800, max: 800, step: 1 }
  });

  game.settings.register(EOTTRPG_CLOCK_NS, "clockY", {
    name: "Demi-horloge : Décalage Y (px)",
    hint: "Décalage vertical fin (positif = vers le bas).",
    scope: "client",
    config: true,
    type: Number,
    default: 0,
    range: { min: -200, max: 400, step: 1 }
  });

  game.settings.register(EOTTRPG_CLOCK_NS, "clockOpacity", {
    name: "Demi-horloge : Opacité",
    hint: "Transparence pour éviter de surcharger l’UI.",
    scope: "client",
    config: true,
    type: Number,
    default: 1,
    range: { min: 0.1, max: 1, step: 0.05 }
  });
}
