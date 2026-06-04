export function maceShieldArrow() {
  if (!game.modules.get("sequencer")?.active) {
    console.error(
      "You need sequencer and JB2a to use this macro to it's fullest",
    );
    return;
  }
  const art = {
    mace: "icons/weapons/maces/mace-cube-spiked-steel.webp",
    shield: "icons/equipment/shield/buckler-wooden-boss.webp",
    arrow: "icons/weapons/ammunition/arrow-broadhead-green.webp",
  };

  const sfx = {
    mace: "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Combo Level C1.ogg",
    shield:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Combo Level C2.ogg",
    arrow:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Combo Level C3.ogg",
    shoot:
      "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Ovani/Combo Complete B.ogg",
  };

  const winnerArt = "jb2a.glint.yellow.many";
  const hand = "pics/hand.svg";

  const textStyle = {
    fill: "#ffffff",
    fontSize: 48,
    fontVariant: "small-caps",
    fontWeight: "bold",
    strokeThickness: 5,
  };

  const duration = 2000;

  const delay = {
    mace: duration,
    shield: duration * 2,
    arrow: duration * 3,
    shoot: duration * 4,
  };

  function tokenImage(tokenDoc) {
    return (
      (tokenDoc.ring.enabled && tokenDoc.ring.subject.texture) ||
      tokenDoc.texture.src
    );
  }

  function tokenScale(tokenDoc) {
    return (
      tokenDoc.texture.scaleX /
      (tokenDoc.ring.enabled ? tokenDoc.ring.subject.scale : 1)
    );
  }

  function handAnimation(value, token, side = "right", winner = false) {
    const seq = new Sequence()
      .effect()
      .file(tokenImage(token.document))
      .screenSpace()
      .screenSpaceAboveUI()
      .screenSpaceAnchor({ x: side === "left" ? 0.05 : 0.95, y: 0.4 })
      .screenSpaceScale({ fitY: true, ratioX: true })
      .scale(0.25 * tokenScale(token.document))
      .mirrorX(side === "right")
      .duration(delay.shoot + duration)

      .effect()
      .file(hand)
      .duration(delay.shoot + duration)
      .screenSpace()
      .screenSpaceAboveUI()
      .screenSpaceAnchor({ x: side === "left" ? 0.1 : 0.9, y: 0.8 })
      .mirrorX(side !== "left")
      .fadeIn(duration / 2)
      .screenSpaceScale({ fitY: true, ratioX: true })
      .anchor({ x: Number(side === "right"), y: 1 })
      .loopProperty("spriteContainer", "rotation", {
        values: [0, side === "left" ? -90 : 90, 0],
        duration: duration / 3,
        pingPong: true,
        delay: delay.mace,
        // loops: 3
      })
      .loopProperty("spriteContainer", "position.y", {
        values: [0, 0.05, 0],
        duration: duration / 3,
        screenSpace: true,
        pingPong: true,
        delay: delay.mace,
        // loops: 3
      })
      .scale(0.4)
      .effect()
      .file(art[value])
      .screenSpaceScale({ fitY: true, ratioX: true })
      .screenSpace()
      .screenSpaceAboveUI()
      .screenSpaceAnchor({ x: side === "left" ? 0.2 : 0.8, y: 0.6 })
      .delay(delay.shoot + duration * 0.7)
      .duration(duration * 2)
      .fadeOut(duration / 4)
      .scale(0.4);

    if (winner) {
      seq
        .effect()
        .file(winnerArt)
        .screenSpaceScale({ fitY: true, ratioX: true })
        .screenSpace()
        .screenSpaceAboveUI()
        .screenSpaceAnchor({ x: side === "left" ? 0.2 : 0.8, y: 0.6 })
        .delay(delay.shoot + duration)
        .duration(duration * 2 - duration * 0.3)
        .fadeIn(duration / 8)
        .fadeOut(duration / 4)
        .scale(0.4)
        .zIndex(2)
        .effect()
        .text("Winner!", textStyle)
        .screenSpace()
        .screenSpaceAboveUI()
        .screenSpaceAnchor({ x: side === "left" ? 0.2 : 0.8, y: 0.3 })
        .duration(duration * 2 - duration * 0.3)
        .fadeIn(duration / 8)
        .fadeOut(duration / 4)
        .delay(delay.shoot + duration);
    }

    return seq;
  }

  const [tokenA, tokenB] = [
    canvas.tokens.controlled?.[0],
    game.user.targets.first(),
  ];

  function getPlayerOwner(actor) {
    return (
      game.users.find((u) => u?.character?.id === actor.id) ??
      game.users?.get(
        Object.entries(_token.actor.ownership).find(
          ([id, permission]) => permission === 3,
        )?.[0],
      )
    );
  }

  const userA = tokenA.actor.hasPlayerOwner
    ? getPlayerOwner(tokenA.actor)
    : game.users.activeGM;
  const userB = tokenB.actor.hasPlayerOwner
    ? getPlayerOwner(tokenB.actor)
    : game.users.activeGM;

  if (userA.id === userB.id && !userA.isGM) {
    ui.notifications.error("Target 2 tokens not owned by the same user");
    return;
  }

  function getResult(user) {
    return foundry.applications.api.DialogV2.query(user, "wait", {
      window: { title: "Mace, Shield, Arrow!" },
      content: "Select what you'll play",
      buttons: [
        { label: "Mace", action: "mace", icon: "fas fa-mace" },
        { label: "Shield", action: "shield", icon: "far fa-shield" },
        { label: "Arrow", action: "arrow", icon: "fas fa-arrow-archery" },
      ],
    });
  }

  const promises = [getResult(userA), getResult(userB)];

  Promise.all(promises).then(([playerInputA, playerInputB]) => {
    console.log({ playerInputA, playerInputB });
    const notTie = !(playerInputA === playerInputB);
    const aWins =
      (playerInputA === "mace" && playerInputB === "shield") ||
      (playerInputA === "shield" && playerInputB === "arrow") ||
      (playerInputA === "arrow" && playerInputB === "mace");
    const seq = new Sequence()
      .addSequence(handAnimation(playerInputA, tokenA, "left", aWins && notTie))
      .addSequence(
        handAnimation(playerInputB, tokenB, "right", !aWins && notTie),
      )
      // Center Text
      //Mace
      .effect()
      .text("Mace", textStyle)
      .screenSpace()
      .screenSpaceAboveUI()
      .screenSpaceAnchor({ x: 0.5, y: 0.4 })
      .duration(duration / 2)
      .fadeIn(duration / 16)
      .fadeOut(duration / 8)
      .delay(delay.mace + duration * 0.7)
      //SFX
      .sound()
      .file(sfx.mace)
      .volume(0.5)
      .delay(delay.mace + duration * 0.7)
      //Shield
      .effect()
      .text("Shield", textStyle)
      .screenSpace()
      .screenSpaceAboveUI()
      .screenSpaceAnchor({ x: 0.5, y: 0.4 })
      .duration(duration / 2)
      .fadeIn(duration / 16)
      .fadeOut(duration / 8)
      .delay(delay.shield + duration * 0.7)
      //SFX
      .sound()
      .file(sfx.shield)
      .volume(0.5)
      .delay(delay.shield + duration * 0.7)
      //Arrow
      .effect()
      .text("Arrow", textStyle)
      .screenSpace()
      .screenSpaceAboveUI()
      .screenSpaceAnchor({ x: 0.5, y: 0.4 })
      .duration(duration / 2)
      .fadeIn(duration / 16)
      .fadeOut(duration / 8)
      .delay(delay.arrow + duration * 0.7)
      //SFX
      .sound()
      .file(sfx.arrow)
      .volume(0.5)
      .delay(delay.arrow + duration * 0.7)
      //Shoot
      .effect()
      .text("SHOOT!", textStyle)
      .screenSpace()
      .screenSpaceAboveUI()
      .screenSpaceAnchor({ x: 0.5, y: 0.4 })
      .duration(duration / 2)
      .fadeIn(duration / 16)
      .fadeOut(duration / 8)
      .delay(delay.shoot + duration * 0.7)
      //SFX
      .sound()
      .file(sfx.shoot)
      .volume(0.5)
      .delay(delay.shoot + duration * 0.7)
      .play();
  });
}
