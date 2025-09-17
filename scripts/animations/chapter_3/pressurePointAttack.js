import { MODULE_ID } from "../../const.js";

export function pressurePointAttack() {
    const target = game.user.targets.first();
    const token = canvas.tokens.controlled[0];
    if (!target || !token) {
        ui.notifications.error("Select a token and target a token")
        return;
    }
    const angle = new foundry.canvas.geometry.Ray(token.center, target.center).angle;
    const distance = target.w;
    const { dx, dy } = foundry.canvas.geometry.Ray.fromAngle(
        target.center.x,
        target.center.y,
        angle,
        distance
    );

    const duration = 2000;
    const rotationDelay = 300;

    new Sequence({
        moduleName: game.modules.get(MODULE_ID).title,
        softFail: true,
    })
        .effect()
        .file("jb2a.template_line_piercing.generic.01.blue.15ft")
        .atLocation(token)
        .stretchTo(target)
        .waitUntilFinished(-300)
        .effect()
        .atLocation(target)
        .rotate(180)
        .rotateTowards(token, { local: true })
        .scaleToObject(3)
        .file("jb2a.side_impact.part.shockwave.blue")
        .playbackRate(0.5)
        .anchor({ x: 0.5, y: 0.5 })
        .mask()
        .effect()
        .delay(500)
        .copySprite(target)
        .tint(0xccffff)
        .scaleToObject(1, { considerTokenScale: true })
        .fadeIn(500)
        .opacity(0.6)
        .duration(duration)
        .animateProperty("spriteContainer", "position.x", {
            from: 0,
            to: dx,
            duration: duration / 3,
            ease: "easeOutQuint",
        })
        .animateProperty("spriteContainer", "position.y", {
            from: 0,
            to: dy,
            duration: duration / 3,
            ease: "easeOutQuint",
        })
        .animateProperty("spriteContainer", "position.x", {
            from: 0,
            to: -dx,
            duration: 500,
            ease: "easeOutCubic",
            fromEnd: true,
        })
        .animateProperty("spriteContainer", "position.y", {
            from: 0,
            to: -dy,
            duration: 500,
            ease: "easeOutCubic",
            fromEnd: true,
        })
        // .loopProperty("sprite", "rotation", { values: [0, 60, -60, 0], duration: duration / 3, ease: "easeInOutCubic"})
        .animateProperty("spriteContainer", "rotation", {
            from: 0,
            to: 190,
            duration: duration - (rotationDelay * 2),
        })
        .animateProperty("sprite", "rotation", {
            from: 0,
            to: 190,
            duration: duration - (rotationDelay * 2),
        })
        .animateProperty("sprite", "position.y", {
            from: 0,
            to: 10,
            duration: duration / 2,
        })
        .animateProperty("sprite", "position.y", {
            from: 0,
            to: -10,
            duration: duration / 2,
            fromEnd: true
        })

        .animateProperty("spriteContainer", "rotation", {
            from: 0,
            to: -190,
            duration: rotationDelay * 2,
            ease: "easeInOutSine",
            fromEnd: true
        })
        .animateProperty("sprite", "rotation", {
            from: 0,
            to: -190,
            duration: rotationDelay * 2,
            ease: "easeInOutSine",
            fromEnd: true
        })
        .waitUntilFinished(-300)
        .effect()
        .fadeIn(200)
        .duration(1500)
        .atLocation(target)
        .copySprite(target)
        .scaleToObject(1, { considerTokenScale: true })
        .filter("Glow",
            {
                distance: 10,      // Number, distance of the glow in pixels
                outerStrength: 4,  // Number, strength of the glow outward from the edge of the sprite
                innerStrength: 0,  // Number, strength of the glow inward from the edge of the sprite
                color: 0x66ffff,   // Hexadecimal, color of the glow
                quality: 0.1,      // Number, describes the quality of the glow (0 to 1) - the higher the number the less performant
                knockout: true    // Boolean, toggle to hide the contents and only show glow (effectively hides the sprite)
            }
        )
        .play({ preload: true })
}