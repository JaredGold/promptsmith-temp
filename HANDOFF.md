# Promptsmith of Lumen: handoff 2 (for Claude Code)

A 2.5D side-scrolling action game that teaches people to use Claude well. One self-contained HTML page.
Read in this order: `BRIEF.txt` (the owner's original request), this file, then `src/` in load order.
`docs/HANDOFF_v1_design_and_lesson_notes.md` is the first handoff: the full game design and the lesson
notes that were checked against Anthropic's prompting docs. Still accurate for design and lesson content;
its "Status" and file list are out of date (this file replaces them).

## State today

Playable end to end and published once as a claude.ai artifact. Everything in the brief exists in some
form: town hub, 18 abilities x 3 ranks with 4-step lessons, 9 stages (3 shared + 2 per track) each with a
boss and shield challenges, per-run boons, tracks, Codex of copyable templates, loadout and rune
programming, synthesised music and effects, touch + keyboard, save with in-memory fallback, Three.js
renderer with automatic Canvas fallback.

It is a first playable, not a finished game. The owner has played it for about a minute on a phone.

## What the owner has said (act on all of it)

1. "Those characters look a little crappy. Make the game look more premium."
2. "It shouldn't look like just an AI game. It should look like a 2.5D version of MapleStory but without
   anime-looking characters." Take the genre's traits (chunky grass-topped terrain and ledges, bold
   outlines, cute bouncy monsters, big bubbly damage numbers, lush layered backdrops, ropes/ladders,
   name tags). Do not copy any MapleStory character, monster, logo or asset: designs stay original.
   An art pass was done after this (toon shading, ink outlines, drawn faces, grass-over-earth tiles) but
   the owner has not confirmed it is enough. Treat the look as still open. See `reference/`.
3. Asked for next, in their words: "a tutorial, character creation, naming, desktop support and fix any
   bugs we have spoken about", and to "find ways to fix but also enhance the game".
4. They play on a phone (Android, portrait in the screenshot). Keep replies to them short.

## Work requested

### 1. Tutorial
Nothing guided exists yet: two toasts on first start and a mentor (Ember) who says where to go.
Build a real first-five-minutes: move, jump, double jump, dodge through an attack, hit the practice
dummy, then walk to the Shrine of Asking, learn Clear Ask, equip it, use it on a Wisp, and enter stage 1.
Step-gated (advance only when the player does the thing), skippable, replayable from the pause menu,
saved in `SV.d.tut`. Also teach in play: first Mimic, first Creeper split, first Yes-Man block, first
boss shield (some one-line `tip()` toasts exist for these). Keep the brief's rule: short text, no lesson
screen over three lines.

### 2. Character creation and naming
The player is one fixed model (`MODEL.player` in `src/06_world_data.js`). Add a creation screen on first
start: name (text input, length cap, safe default), plus a few choices that are cheap with shape-built
models: skin tone, hair style and colour, tunic and scarf colour, goggles/hat, hammer head. Store in the
save (`SV.d.hero`), show the name on a tag under the character and in mentor dialogue, and let the
player re-edit in town. `MODEL.player()` should take the hero object; the face comes from `faceTex()`.

### 3. Desktop support
Works today only in the sense that keys are bound (A/D or arrows, Space/W, J, K, U I O P, Esc) and the
touch buttons stay on screen with key labels. Needed: detect pointer type and hide touch controls for
mouse/keyboard, a proper controls panel and rebinding, mouse support (click to attack, aim Clear Ask at
the cursor), gamepad if cheap, Enter/Esc/arrow navigation in menus, hover and focus states, sensible
layout on large and ultrawide windows (camera framing, card widths, HUD scale), fullscreen toggle,
pause on window blur (exists for tab hide only).

### 4. Bugs and weak spots found so far
- FIXED in this build, verify on a device: starting with sound on threw "Failed to execute
  'setValueAtTime' on 'AudioParam': non-finite" every music step. Cause: the hub melody string was 52
  steps, the sequencer reads 64. All earlier tests ran muted, which hid it. `test/audio.js` now runs with
  sound on. Lesson: test with sound on.
- Portrait framing (see `reference/phone-portrait-sound-crash.jpg`): about 40% of the screen is bare
  earth under the ground line and the characters are small. Rework portrait camera/zoom and what sits
  behind the controls.
- Raw error text is shown to the player in a toast ("Something broke: ..."), and repeats stack up.
  Keep an error surface, make it one calm line, and log details to the console.
- Performance on real phones is unmeasured. Headless Chrome had no GPU (software GL: 65-100 ms a frame
  on the Three.js path, 16.7 ms on Canvas). The game steps quality down (`R.setQ`) and falls back to
  Canvas when 3D stays slow, but none of that has been seen on hardware. Measure on a real device first.
- Sound has never been heard by anyone but the owner. Mix, levels and whether the songs are pleasant are
  unknown. Stage 4/5 songs are parameter variations of earlier songs, not new tunes.
- Balance is untuned for humans. A scripted bot clears a stage in 1.5-2.5 minutes; the brief wants
  5-10 minute runs. Enemy counts, boss health, spark income and rank costs (30/60) are first guesses.
- Scenery (houses, towers, shrines) is plain lit boxes and does not match the outlined characters.
- Three quest screens scroll slightly at 780x360 (abilities with 4-5 template slots).
- In the hub the practice dummy stands close to the spawn point and overlaps the player.
- Lesson variation by track is thin: rank II Watch examples and all quest lines vary; Fix and Write
  items are shared across tracks.
- Boss Write challenges are blocks only (no typing mid-fight). Boss quirks are light.
- Not verified inside the claude.ai artifact frame: clipboard Copy, safe-area insets, CDN load.

### 5. Enhance
Your call, within the brief. Ideas the build is ready for: ropes/ladders and taller multi-level rooms,
room variety (hazards, moving platforms), enemy elites, more boss personality, a results screen with
what was learned, daily "real task" from the track mentor, reduced-motion and colour-blind options,
haptics toggle, better hit animation on enemies, weather/ambient motes per theme.

## Rules that still apply (from the brief)

- One self-contained page. Three.js r128 from cdnjs with a tested Canvas fallback. No image or audio
  files: models from simple shapes, textures drawn in code, all sound from Web Audio.
- Touch first, plus keyboard. Smooth on a mid-range phone; cut effects before speed.
- Save in the browser; keep working when saving is unavailable.
- No API calls. Grading is authored rubrics and block answers (`GRADER`).
- No lesson screen longer than three lines. `test/pass2.js` measures every lesson screen for real.
- Lesson content must match Anthropic's current prompting docs. Re-check anything you add or change
  (docs.claude.com / platform.claude.com prompt-engineering pages; support articles for Skills and
  connectors). "Critique" is not a named technique there: it is taught as the review step of
  draft-review-refine plus asking for weaknesses. Say so wherever it matters.
- If it is republished as a claude.ai artifact: one HTML document; scripts only inline or from
  cdnjs.cloudflare.com (a few other CDNs are allowed); stylesheets only inline or fonts.googleapis.com;
  no alert/confirm/prompt; clipboard write only inside a click handler with a catch; localStorage may
  throw; only a plain `#name` survives in the URL hash (`#canvas` forces Canvas mode).

## Build and test

```
python3 build.py                  # src/shell.html + src/*.js (sorted) -> dist/index.html
node test/pass1.js                # boot, hub, one combat room; Three + Canvas; landscape + portrait
node test/pass2.js                # lesson data budgets, real line counts for all 576 lesson screens,
                                  # a tapped-through lesson, every ability at ranks I and III in fights
node test/pass3.js [ids]          # all 9 stages end to end with a bot (strong/weak/timeout answers),
                                  # death, retry, leave. e.g. `node test/pass3.js 1,4B`
node test/pass4.js                # tracks, track shrine, Codex, loadout, runes, storage blocked
node test/viz.js                  # real touch events, live boss fight with a tapped challenge, frame times
node test/audio.js                # sound ON: every song, every effect, a live fight
node test/art.js                  # character line-up screenshots -> test/out/
```
Tests need Playwright and a Chrome/Chromium (`npm i playwright`, or set `CHROME_PATH`). `test/lib.js`
serves `vendor/three.min.js` (r128, from `npm pack three@0.128.0`) in place of the CDN URL and the real
fonts from `vendor/fonts/`, so the 3D path and text widths are tested offline. Modes: `three`, `canvas`
(`#canvas`), `nothree` (script blocked). The bot (`BOT` in `test/lib.js`) can fast-forward game logic
without rendering (`BOT.ff`). All passes were green on the build in `dist/`.
Screenshots land in `test/out/`. Look at them: several real bugs were only visible there.

## Source map (load order = file name order)

| File | What is in it |
|---|---|
| `shell.html` | Page shell, all CSS, HUD, touch controls, title. JS is injected at `/*__JS__*/`. |
| `01_core.js` | Utils, save (`SV`: LocalStore/MemoryStore behind `{get,set}`), audio (`AU`: sfx + step sequencer), input (`IN`). |
| `02_render.js` | Scene graph (`P()` parts, `mk()` nodes), facade `R` over a backend interface, `ThreeBackend`, `CanvasBackend`, `FX` overlay, technique `shape()`s, code-drawn textures (`faceTex`, `tileTex`, `platTex`, `signTex`). |
| `03_combat.js` | `G` state, combat interface `C` (hit, hurt, shots, zones, telegraphs, hook lists), `FORMS`, player `PL`, enemy spawn/update, world update, camera, overlay drawing. |
| `04_abilities.js` | `ABILITY` registry: 18 techniques. Rune triggers/actions (`RUNE_T`, `RUNE_A`) and connector `TOOLS` are registries too. |
| `05_lessons.js` | `LESSON` data (all lesson text) and `GRADER` rubrics. Data only. |
| `06_world_data.js` | `MODEL`s, `ENEMY` defs, `AI` strategies, `PROP`s, `THEME`s, `buildScenery`. |
| `07_stages.js` | `STAGE` list, extra songs, `PROG` (all unlock rules in one place), `BOONS`. |
| `07b_bosses.js` | Boss models, `PATTERN` registry, `BOSS` defs, boss `AI`, `BossCtl` (shield phases). |
| `08_scenes.js` | `GAME`, `HubScene`, `RunScene`. |
| `09_ui.js` | Toast/banner/hint, `card()`, `HUD`, every screen in `UI`, challenge UI builders. |
| `10_main.js` | Frame loop, adaptive quality, boot. |

Note: v1 planned `01_core, 02_render, 03_data_abilities ... 08_main`. The order changed because abilities
register hooks on `C` at load, so combat has to load first.

## How it is put together (keep these seams)

- **Renderer**: game code only talks to `R`. A backend is `{name, add, remove, setEnv, resize,
  render(ctx), dispose}`. World: x right, y up, ground y=0, play on z=0, camera straight down -z.
  `R.px/R.py/R.k` map world to screen exactly, so the 2D `#fx` overlay lines up on both backends.
  Node flags: `ol` (toon + ink outline), `sh` (ground shadow radius), `st` (static, synced once),
  `face` (-1 mirrors). Part shapes: `box rbox sph cyl cone cap img`.
- **Abilities** depend on `C`, `G.mod` and `FX/AU` only. They extend behaviour through hook lists on `C`
  (`outMul onHit onKill onHurt afterHurt onDodge onAttack onShot`), never by editing combat code.
- **Enemies**: `ENEMY[kind]` (stats, `resist`, `die`, `draw`) + `AI[name] = {init, update}`.
- **Bosses**: `BOSS[id]` picks from `PATTERN[name] = {start, update -> done}` and has one quirk hook
  (`quirk`, `after`, `onPhase`). `BossCtl` owns shield thresholds and the challenge round-trip.
- **Challenges**: `GRADER[type](challenge, answer) -> {grade, notes}`; UI builders are separate
  (`CHALLENGE_UI`, `UI.lessonScreens`).
- **Boons**: `{id, ab, name, desc, apply(mod)}` write to `G.mod`; abilities read `G.mod.b.*`.
- **Progression**: every unlock rule is in `PROG` (`stageLock`, `abLock`, `rankLock`, `cost`, `learn`).
- **Scenes**: `{enter, update, draw, exit}`; `GAME.go(scene, arg)`.
- **Art**: characters are toy-like, built from capsules/rounded boxes/spheres with a drawn face decal
  (`F({e,m,...})`), ink colour `#201A4B` shared with the UI's borders. Terrain is grass-lip-over-earth
  textures drawn in code. Palette and fonts (Fredoka, Courier Prime) are set in `shell.html`.

## Environment facts from the first two sessions

- Headless Chrome 153 + Playwright; no GPU, so WebGL ran on SwiftShader.
- cdnjs was not reachable from the build shell; npm was. Three r128 and the fonts came from npm.
- The published artifact is "Promptsmith of Lumen" on claude.ai (owner-only). Republishing needs that
  session's artifact tools; from Claude Code, deliver `dist/index.html`.
