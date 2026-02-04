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
}
