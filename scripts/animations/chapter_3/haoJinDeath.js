import { MODULE_ID } from "../../const.js";

export function haoJinDeath() {
  const disintegrate = {
    beam: "jb2a.disintegrate.dark_red",
    tracer: "jb2a.fireball.beam.dark_red",
    hue: -85,
  };
  const hao_dust =
    "modules/fist-of-the-ruby-phoenix-addons/assets/token/hao_jin_dust.webp";

  const sfx = {
    bolt: "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Shadow%20Bolt%20Cast%20B.ogg",
    impact:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Shadow%20Bolt%20Impact%20B.ogg",
  };

  const hasSequencer = game.modules.has("sequencer");
  const hasJB2aPatreon = game.modules.has("jb2a_patreon");
  if (!hasSequencer) {
    ui.notifications.error("You need to have sequencer installed");
    return;
  }
  if (!hasJB2aPatreon) {
    ui.notifications.error(
      "As you are missing JB2A Patreon the animation will be pretty limited"
    );
  }

  if (game.user.targets.size !== 1) {
    ui.notifications.error(
      "To run this macro you must be targetting only Hao Jin the Ruby Phoenix"
    );
    return;
  }

  const target = game.user.targets.first();

  if (
    canvas.tokens.controlled.length !== 1 &&
    target.id !== canvas.tokens.controlled[0].id
  ) {
    ui.notifications.error(
      "To run this macro you must be controlling only the Fallen Moon Mage who disintegrates Hao Jin"
    );
    return;
  }

  const tok = canvas.tokens.controlled[0];

  new Sequence({
    moduleName: game.modules.get(MODULE_ID).title,
    softFail: true,
  })
    .canvasPan()
    .atLocation(target)
    .scale(1.5)
    .duration(2200)
    //Beam sfx
    .sound()
    .file(sfx.bolt)
    .delay(2000)
    //Tracer
    .effect()
    .file(disintegrate.tracer)
    .filter("ColorMatrix", {
      hue: disintegrate.hue,
    })
    .atLocation(tok)
    .stretchTo(target)
    .waitUntilFinished(-1600)
    //Screen Space shake
    .canvasPan()
    .shake({ duration: 1500 })
    //Impact SFX
    .sound()
    .file(sfx.impact)
    .delay(500)
    //Beam
    .effect()
    .file(disintegrate.beam)
    .filter("ColorMatrix", {
      hue: disintegrate.hue,
    })
    .atLocation(tok)
    .stretchTo(target)
    .waitUntilFinished(-1500)
    //Hao Dissappear
    .animation()
    .on(target)
    .opacity(0)
    .fadeOut(250)
    //Hao Dust
    .effect()
    .belowTokens()
    .fadeIn(250)
    .name("Hao Dust")
    .file(hao_dust)
    .scaleToObject(1)
    .attachTo(target, { bindVisibility: false, bindAlpha: false })
    .persist()
    .play();
}

export function haoJinReborn() {
  const hasSequencer = game.modules.has("sequencer");
  const hasJB2aPatreon = game.modules.has("jb2a_patreon");
  if (!hasSequencer) {
    ui.notifications.error("You need to have sequencer installed");
    return;
  }
  if (!hasJB2aPatreon) {
    ui.notifications.error(
      "As you are missing JB2A Patreon the animation will be pretty limited"
    );
  }

  if (game.user.targets.size !== 1) {
    ui.notifications.error(
      "To run this macro you must be targetting only Hao Jin the Ruby Phoenix"
    );
    return;
  }

  const phoenix = game.modules.has("pf2e-tokens-bestiaries")
    ? "modules/pf2e-tokens-bestiaries/portraits/elemental/fire/phoenix.webp"
    : "https://2e.aonprd.com/Images/Monsters/Phoenix.png";
  const flames = "jb2a.flames.04.complete.orange";
  const hao_flames = "jb2a.shield_themed.above.fire.03.orange";
  const explosion = "jb2a.explosion.08.1200.orange";
  const hao_border = "jb2a.token_border.circle.spinning.orange.005";
  const phoenix_fire = "jb2a.firework.01.orange.02";

  const sfx = {
    comet:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Blazing%20Comet.ogg",
    phoenix_burst:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Phoenix%20Burst.ogg",
    fire_loop:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Stuck%20in%20a%20Big%20Fire%20Loop.ogg",
    fire_impact:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Fiery%20Burst%20Long%20Tail%20C.ogg",
  };

  const target = game.user.targets.first();

  new Sequence()
    // Fire SFX
    .sound()
    .file(sfx.fire_loop)
    .fadeInAudio(1600, { ease: "easeInCubic" })
    .duration(8000 + 8000 + 8000)
    //Canvas Pan 1
    .canvasPan()
    .atLocation(target)
    .scale(1)
    .duration(1500)
    .delay(0)
    //Canvas Pan 2
    .canvasPan()
    .atLocation(target)
    .scale(1.2)
    .duration(1500)
    .delay(2000)
    //Canvas Pan 3
    .canvasPan()
    .atLocation(target)
    .scale(1.6)
    .duration(1500)
    .delay(4000)
    //Canvas Pan 4
    .canvasPan()
    .atLocation(target)
    .scale(2)
    .duration(2000)
    .delay(5500)
    //Canvas Shake
    .canvasPan()
    .shake({ duration: 400 })
    .delay(7500)
    //Canvas Pan Out
    .canvasPan()
    .atLocation(target)
    .scale(0.9)
    .duration(1000)
    .delay(7500)
    //phoenix burst
    .sound()
    .file(sfx.phoenix_burst)
    .delay(8000 - 2000)
    // Phoenix Background Fire
    .effect()
    .file(phoenix_fire)
    .atLocation(target, { offset: { x: 0, y: -1 }, gridUnits: true })
    .scaleToObject(20)
    .aboveLighting()
    .zIndex(-1)
    .delay(8100)

    //Fires
    .effect()
    .atLocation(target)
    .file(flames)
    .scaleToObject(2)
    .spriteAnchor({ x: 0.5, y: 0.9 })
    .fadeIn(2000)
    .scaleIn(0.25, 8000, { ease: "easeInCubic" })
    .fadeOut(250)
    .duration(8000)
    .waitUntilFinished(-500)
    //Comet Land
    .sound()
    .file(sfx.comet)
    .delay(2500)

    //Canvas Pan In
    .canvasPan()
    .atLocation(target)
    .scale(2)
    .duration(1000)
    .delay(7500)
    //phoenix
    .effect()
    .file(phoenix)
    .atLocation(target)
    .scaleToObject(15)
    .animateProperty("sprite", "position.y", {
      from: 0,
      to: -2,
      duration: 1500,
      gridUnits: true,
      ease: "easeOutQuart",
    })
    .animateProperty("sprite", "position.y", {
      from: 0,
      to: 1,
      duration: 3500,
      delay: 1500,
      gridUnits: true,
      ease: "easeOutBack",
    })
    .scaleIn(0, 2500, { ease: "easeOutCubic" })
    .aboveLighting()
    .zIndex(1)
    .filter("Glow", {
      distance: 10,
      color: 0xfcc985,
      outerStrength: 4,
      quality: 0.2,
    })
    .duration(8000)
    .animateProperty("sprite", "position.y", {
      from: 0,
      to: 1,
      duration: 2500,
      gridUnits: true,
      ease: "easeInOutBack",
      fromEnd: true,
    })
    .scaleOut(0, 2500, { ease: "easeInBack" })
    .waitUntilFinished(-500)
    //Shake landing
    .canvasPan()
    .shake({ duration: 600 })
    .delay(600)
    //Fire impact
    .sound()
    .file(sfx.fire_impact)
    .delay(400)
    //Explosion
    .effect()
    .file(explosion)
    .atLocation(target)
    .zIndex(1)
    .scaleToObject(5)
    //hao reappear
    .animation()
    .on(target)
    .opacity(1)
    .fadeIn(250)
    .waitUntilFinished(-200)
    //Remove Dust
    .thenDo(() => Sequencer.EffectManager.endEffects({ name: "Hao Dust" }))
    //On Fire
    .effect()
    .file(hao_flames)
    .atLocation(target)
    .mask()
    .scaleToObject(1.5)
    .duration(9000)
    .opacity(0.5)
    .fadeOut(1000)
    // Hao Border fire
    .effect()
    .file(hao_border)
    .atLocation(target)
    .scaleToObject(2)
    .duration(8000)
    .fadeOut(1000)
    .play({ preload: true });
}
