const FX = 'jb2a.template_circle.aura.04.outward.001.complete.combined.refraction';

const sfx = "modules/fist-of-the-ruby-phoenix-addons/assets/sfx/Misc/wine-glass.ogg";
export function summonTerracotta() {
    const hasSequencer = game.modules.has("sequencer");
    if (!hasSequencer) {
        ui.notifications.error("You need to have sequencer installed");
        return;
    }
    let cnt = 0;
    const seq = new Sequence()
        .sound()
        .file(sfx)
        .delay(500)
        .volume(0.5);
    for (const tok of canvas.tokens.controlled) {
        const delay = cnt * 1000;
        seq
            .effect()
            .atLocation(tok)
            .scaleToObject(2)
            .file(FX)
            .delay(delay)
            .tint("#b3e7ff")
            .belowTiles()
            .animation()
            .on(tok)
            .opacity(0)
            .show()
            // .sound()
            //   .file(sfx[cnt % 4])
            //   .delay(delay + 1500)
            //   .volume(0.5)
            .animation()
            .opacity(1)
            .on(tok)
            .delay(delay + 1500)
            .fadeIn(1000)
        cnt++;
    }

    seq.play({ preload: true })
}