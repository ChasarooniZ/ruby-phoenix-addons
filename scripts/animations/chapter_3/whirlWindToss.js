import { MODULE_ID } from "../../const.js";
export async function whirlwindToss() {
    const target = game.user.targets.first();
    const token = canvas.tokens.controlled[0];
    if (!target || !token) {
        ui.notifications.error("Select a token and target a token")
        return;
    }
    const angle = Math.toDegrees((new foundry.canvas.geometry.Ray(token?.center, target?.center))?.angle ?? 0)
    const loopDuration = 1200;
    const loops = 3;
    const position = await Sequencer.Crosshair.show(
        {
            icon: {
                texture: target?.document?.texture?.src ?? ""
            },
            snap: {
                position: target?.document?.width % 2 === 1 ?
                    CONST.GRID_SNAPPING_MODES.CENTER
                    : CONST.GRID_SNAPPING_MODES.VERTEX
            },
            label: {
                text: "Thrown Position"
            },
            location: {
                obj: token,
                showRange: true
            }
        }
    );

    const landingRay = new foundry.canvas.geometry.Ray(token?.center, position);
    const angle2 = Math.toDegrees(landingRay.angle);
    const pos2 = { x: landingRay.dx - target.w, y: landingRay.dy };

    new Sequence({
        moduleName: game.modules.get(MODULE_ID).title,
        softFail: true,
    })
        .addNamedLocation("target", position)
        .animation()
        .on(target)
        .opacity(0)
        .waitUntilFinished()
        .teleportTo("target", { delay: 100, relativeToCenter: true })
        .effect()
        .atLocation(target)
        .file("jb2a.impact.boulder.01")
        .scaleToObject(2)
        .delay(loopDuration * 1.5 + loops * loopDuration + loopDuration * 0.9)
        .belowTokens()
        .effect()
        .atLocation(token)
        .copySprite(target)
        .scaleToObject(1, { considerTokenScale: true })
        .anchor({ x: -0.5, y: 0.5 })
        .duration((loopDuration * 1.5) + (loops * loopDuration) + loopDuration)
        .loopProperty("spriteContainer", "rotation", {
            from: angle, to: 360,
            duration: loopDuration * 1.5,
            ease: "easeInSine", loops: 1
        })
        .loopProperty("spriteContainer", "rotation", {
            from: 0, to: 360,
            duration: loopDuration,
            delay: loopDuration * 1.5
        })
        .animateProperty("spriteContainer", "position.x", {
            from: 0, to: pos2.x,
            duration: loopDuration,
            delay: loopDuration * 1.5 + loops * loopDuration,
            ease: "easeInOutCubic"
        })
        .animateProperty("spriteContainer", "position.y", {
            from: 0, to: pos2.y,
            duration: loopDuration,
            delay: loopDuration * 1.5 + loops * loopDuration,
            ease: "easeInOutCubic"
        })
        .waitUntilFinished()
        .animation()
        .on(target)
        .opacity(1)
        .play({ preload: true })
}