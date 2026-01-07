// main.js
const MODULE_ID = "eottrpg-utilities";

let socket;

// Quand un heal est appliqué, dnd5e appelle souvent healActor puis applyDamage.
// On garde une fenêtre courte pour reconnaître ce cas.
const _recentHeal = new Map(); // key: actor.uuid, value: timestamp ms
const HEAL_WINDOW_MS = 500;

function markRecentHeal(actor) {
  if (!actor?.uuid) return;
  _recentHeal.set(actor.uuid, Date.now());
}

function wasRecentlyHealed(actor) {
  if (!actor?.uuid) return false;
  const ts = _recentHeal.get(actor.uuid);
  if (!ts) return false;
  if (Date.now() - ts > HEAL_WINDOW_MS) {
    _recentHeal.delete(actor.uuid);
    return false;
  }
  return true;
}

function registerSocket() {
  socket = socketlib.registerModule(MODULE_ID);
  socket.register("triggerSequence", _handleSequence);
}

Hooks.once("init", registerSocket);
Hooks.once("socketlib.ready", registerSocket);

Hooks.once("ready", () => {
  if (!socket) {
    console.error(`${MODULE_ID} | SocketLib non initialisé.`);
  }
});

function _handleSequence({ actor, amount, isCritical }) {

  let seq = new Sequence();

  if (actor.type === "npc" && isCritical && amount > 0) {

      seq
        .effect()
          .file("animated-spell-effects-cartoon.water.115")
          .atLocation(actor.getRollData().token)
          .scaleToObject(1.75).opacity(1).randomRotation()
        .sound()
          .file("worlds/etrian-odyssey/data/assets/se/system/SE_BTL_DAMAGE2.wav")
          .volume(0.25)
        .effect()
          .copySprite(actor.getRollData().token)
          .attachTo(actor.getRollData().token)
          .scaleToObject(1, {considerTokenScale: true})
          .fadeIn(250).fadeOut(1500)
          .loopProperty("sprite", "position.x", {
            from: -0.20, to: 0.20,
            duration: 50, pingPong: true, gridUnits: true
          })
        .duration(1500).opacity(1);

  } else if (actor.type == "npc" && amount > 0) {

    seq
      .effect()
        .file("animated-spell-effects-cartoon.water.115")
        .atLocation(actor.getRollData().token)
        .scaleToObject(1).opacity(1).randomRotation()
      .sound()
        .file("worlds/etrian-odyssey/data/assets/se/system/SE_BTL_DAMAGE.wav")
        .volume(0.25)
      .effect()
        .copySprite(actor.getRollData().token)
        .attachTo(actor.getRollData().token)
        .scaleToObject(1, {considerTokenScale: true})
        .fadeIn(250).fadeOut(1500)
        .loopProperty("sprite", "position.x", {
          from: -0.05, to: 0.05,
          duration: 50, pingPong: true, gridUnits: true
        })
      .duration(1500).opacity(1);

  } else if (actor.type == "character" && actor.hasPlayerOwner == true && isCritical == true && amount > 0) {

  seq
    .effect()
      .file("animated-spell-effects-cartoon.water.115")
      .atLocation(actor.getRollData().token)
      .scaleToObject(1).opacity(1).randomRotation()
    .sound()
      .file("worlds/etrian-odyssey/data/assets/se/system/SE_BTL_HI_DAMAGE2.wav")
      .volume(0.25)
    .effect()
      .copySprite(actor.getRollData().token)
      .attachTo(actor.getRollData().token)
      .scaleToObject(1.3, {considerTokenScale: true})
      .fadeIn(250).fadeOut(1500)
      .loopProperty("sprite", "position.x", {
        from: -0.20, to: 0.20,
        duration: 50, pingPong: true, gridUnits: true
      })        
    .duration(1500).opacity(1)

  } else if (actor.type == "character" && actor.hasPlayerOwner == true && amount > 0) {

    seq
      .effect()
        .file("animated-spell-effects-cartoon.water.115")
        .atLocation(actor.getRollData().token)
        .scaleToObject(1).opacity(1).randomRotation()
      .sound()
        .file("worlds/etrian-odyssey/data/assets/se/system/SE_SYS_HI_DAMAGE.wav")
        .volume(0.25)
      .effect()
        .copySprite(actor.getRollData().token)
        .attachTo(actor.getRollData().token)
        .scaleToObject(1.3, {considerTokenScale: true})
        .fadeIn(250).fadeOut(1500)
        .loopProperty("sprite", "position.x", {
          from: -0.05, to: 0.05,
          duration: 50, pingPong: true, gridUnits: true
        })
      .duration(1500).opacity(1);

  } else if (actor.type == "character" && isCritical == true && amount > 0) {

    seq
      .effect()
        .file("animated-spell-effects-cartoon.water.115")
        .atLocation(actor.getRollData().token)
        .scaleToObject(1).opacity(1).randomRotation()
      .sound()
        .file("worlds/etrian-odyssey/data/assets/se/system/SE_BTL_HI_DAMAGE2.wav")
        .volume(0.25)
      .effect()
        .copySprite(actor.getRollData().token)
        .attachTo(actor.getRollData().token)
        .scaleToObject(1, {considerTokenScale: true})
        .fadeIn(250).fadeOut(1500)
        .loopProperty("sprite", "position.x", {
          from: -0.20, to: 0.20,
          duration: 50, pingPong: true, gridUnits: true
        })        
      .duration(1500).opacity(1)

  } else if (actor.type == "character" && amount > 0) {

    seq
    .effect()
      .file("animated-spell-effects-cartoon.water.115")
      .atLocation(actor.getRollData().token)
      .scaleToObject(1).opacity(1).randomRotation()
    .sound()
      .file("worlds/etrian-odyssey/data/assets/se/system/SE_SYS_HI_DAMAGE.wav")
      .volume(0.25)
    .effect()
      .copySprite(actor.getRollData().token)
      .attachTo(actor.getRollData().token)
      .scaleToObject(1, {considerTokenScale: true})
      .fadeIn(250).fadeOut(1500)
      .loopProperty("sprite", "position.x", {
        from: -0.05, to: 0.05,
        duration: 50, pingPong: true, gridUnits: true
      })
    .duration(1500).opacity(1);

  } else if (amount < 0) {

    seq
      .effect()
        .file("blfx.spell.melee.heal1.particles1.glow.green")
        .randomRotation()
        .atLocation(actor.getRollData().token)
        .size(actor.getRollData().token.document.width * 1.75, {gridUnits: true})
      .sound()
        .file("worlds/etrian-odyssey/data/assets/se/skills/heal.wav")
        .volume(0.25)
  }
  seq.play({ socket: true });
}

Hooks.on("dnd5e.applyDamage", (actor, amount, properties) => {
  // Si on vient de passer par healActor, on ignore cet applyDamage pour éviter:
  // - double animation
  // - confusion invertHealing
  if (wasRecentlyHealed(actor)) return;

  let finalAmount = amount;

  // Nouveau système Midi: dégâts appliqués comme "healing inversé"
  // => amount négatif MAIS c'est bien des dégâts
  if (finalAmount < 0 && properties?.invertHealing === true) {
    finalAmount = Math.abs(finalAmount); // force anim dégâts
  }

  socket.executeAsGM("triggerSequence", {
    actor,
    amount: finalAmount,
    isCritical: properties?.midi?.isCritical || false
  });
});

Hooks.on("dnd5e.healActor", (actor, amountData, updates, userId) => {
  // amountData ressemble à { hp: X, temp: Y, total: Z }
  const total = amountData?.total ?? amountData?.hp ?? 0;
  if (!total) return;

  markRecentHeal(actor);

  socket.executeAsGM("triggerSequence", {
    actor,
    amount: -Math.abs(total), // dans ton code: négatif => anim heal
    isCritical: false
  });
});
