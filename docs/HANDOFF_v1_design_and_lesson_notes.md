# Promptsmith of Lumen: handoff

Continue this build from where it stopped. Read `BRIEF.txt` (the original request) first, then this file,
then the three source files in `src/`. Two later instructions from the user also apply:

1. Use SOLID principles where they make sense.
2. Network egress should now be on. First step in the new chat: fetch Three.js r128 for local testing
   (`curl https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js -o vendor/three.min.js`, or
   `npm pack three@0.128.0` and take `build/three.min.js`). Serve it to headless Chrome with Playwright
   `page.route` so the real 3D path is tested, not just the Canvas fallback.

## Status

Done (in `src/`, untested so far, no build has been run):
- `shell.html`: page shell, all CSS, HUD, touch controls, title screen. JS goes where `/*__JS__*/` is.
- `01_core.js`: utils, save (LocalStore/MemoryStore behind one interface), synthesised audio + 5 looping
  songs (hub, s1, s2, s3, boss), input (floating stick, buttons, keyboard).
- `02_render.js`: own scene graph (`P()` parts, `mk()` nodes), renderer facade `R` over a backend interface
  (`ThreeBackend`, `CanvasBackend`), automatic fallback, FX overlay (particles, glow sprites, rings,
  damage numbers), 18 technique shapes, code-drawn textures (sky, signs, glyphs).
- `build.py`: concatenates `src/*.js` into `dist/index.html`.

Not started: abilities/lesson data, combat, enemies, bosses, stages, hub, UI screens, main loop, tests.

Environment facts found in the first chat:
- Headless Chrome 153 at `/usr/bin/google-chrome`; Playwright at `/opt/npm-tools/node_modules/playwright`.
- Artifact page rules: one HTML document; scripts allowed from cdnjs.cloudflare.com; stylesheets from
  fonts.googleapis.com; no alert/confirm; clipboard write only inside a click handler with catch;
  localStorage may throw. Publish with the artifacts `publish_files` tool from a file on disk.
- No listed artifact type fits a game, so it is a hand-built HTML page.
- The user is on the mobile app: keep replies short.

## Architecture (single page, built from parts)

Planned files, in load order: `01_core`, `02_render`, `03_data_abilities` (ability registry + lesson
content), `04_data_world` (enemies, bosses, stages, boons, challenges), `05_combat`, `06_world`
(hub + run scenes), `07_ui`, `08_main`.

SOLID shape:
- Renderer: `R` depends only on the backend interface `{name, add, remove, setEnv, resize, render(ctx), dispose}`.
- Storage: `{get, set}`; `SV` picks LocalStore or MemoryStore.
- Abilities: registry `ABILITY[id] = {id,name,color,shape,kind:'active'|'toggle'|'passive', cd(rank),
  press(p,rank), hold(p,rank,dt), release(p,rank), update(p,rank,dt), draw(ctx,p,rank), label(p)}`.
  Lesson content is separate data (`LESSON[id]`), not mixed into combat code.
- Enemy behaviour: strategy registry `AI[name] = {init(e), update(e,dt)}`; models from `MODEL[name]()`.
- Boss attacks: `PATTERN[name] = {start(b), update(b,dt) -> done}`.
- Challenges: `GRADER[type](challenge, answer) -> {grade:'strong'|'weak'|'fail', notes}`; UI builders are
  separate from graders.
- Boons: `{id, ab, name, desc, apply(run)}` writing to `run.mod`; abilities read mods.
- Scenes: `HubScene` and `RunScene` with `enter/update/draw/exit`; `GAME` owns the current scene.

Rendering decisions:
- World coords: x right, y up, ground y=0, gameplay on z=0. Camera looks straight down -z, FOV 40.
  Screen mapping is exact: `R.px(x)`, `R.py(y)`, `R.k` px per unit. Zoom = `R.cam.zoom`.
- 3D (Three r128, global build): scenery, player, enemies, bosses, NPCs, buildings. Lambert materials,
  shared unit geometries, 4 pooled PointLights (never change the count: avoids shader recompiles), Fog.
- 2D overlay canvas `#fx` on top (both backends): particles, additive glow (the bloom), projectiles as
  technique shapes, telegraphs, damage numbers, enemy health bars.
- Canvas fallback draws the same nodes with perspective parallax and fog tint. `#canvas` in the URL forces it.
- Facing: `node.face=-1` (Three: rotation.y=PI; Canvas: mirror). Limbs: `pv(part,px,py,angle,len)`.
- Quality `R.q` 2..0: drop particles, lights, DPR before speed. Measure average frame time and step down.
- Portrait works (narrower view, ground lower); landscape is better. One toast suggests rotating.

## Game design

Loop: title -> hub -> run (4 random rooms + boss) -> hub. Runs are 5-10 minutes.
Player: move, jump (+1 air jump), dodge (0.22s dash, i-frames), basic hammer attack, 4 ability slots.
Touch: floating stick left; right cluster Hit/Jump/Dodge + 4 ability buttons. Keys: A/D or arrows,
Space/W jump, J attack/interact, K dodge, U I O P abilities, Esc pause. In the hub, Hit = interact.

Currency: sparks from enemies. Rank I lessons free, rank II 30, rank III 60. Death keeps sparks.
Unlocks: start = Clear Ask (tutorial, required before the gate), Context, Iterate. After stage 1:
Verify, Format, Examples. After stage 2: Think, Role, Critique. After stage 3: pick a track; 2 track
abilities, the third after stage 4. Rank II needs a track chosen; rank III needs stage 4 cleared.

Hub (bright, cozy, ~60 units wide): mentor Ember (general) plus Quill (Writer), Tally (Analyst),
Rivet (Builder); four shrines (Asking: Clear Ask, Context, Format / Showing: Examples, Role, Think /
Checking: Iterate, Verify, Critique / Track shrine: 3 track abilities); Codex lectern; Loadout bench
(4 slots + rune programming); Track signpost (switch any time); Stage gate.

### Abilities (colour, shape, combat effect; ranks I/II/III)
Shared:
- clear / Clear Ask, #4FD8FF diamond: aimed precise shot at nearest foe; II pierces; III crits weak point.
  Wisps take x2 from it (and only 60% from imprecise hits).
- context / Context, #FFB02E ring: 6s aura, attacks +50%; II longer + shots home; III slows foes in aura.
- examples / Examples, #B388FF tri: echoes copy your attacks for 5s. I 1 echo, II 3, III 5 that pick
  different targets (docs: 3-5 varied examples).
- format / Format, #37E2B8 bracket: toggle that reshapes the basic attack: Swing -> Line -> Fan; II adds
  Ring; III shaped hits "tag" foes (+dmg).
- role / Role, #FF7AB6 chev: stance switch Striker/Guardian; II adds Scout; III swap fires a burst.
- think / Think Step by Step, #7C9BFF hex: hold to charge 3 visible steps, release heavy hit; II move
  while charging; III a 4th "check" step that crits.
- iterate / Iterate, #FF8A3D arc: passive combo chain on basic attack, 3/4/5 hits, finisher.
- verify / Verify, #C6F432 check: pulse unmasks Mimics and marks foes (+25% dmg); II stuns; III also
  dissolves enemy projectiles.
- critique / Critique, #FF5D73 x: short parry window that turns enemy hits and shots back; II longer,
  x2; III refunds cooldowns.
Writer: audience #F7A8FF wave (piercing wave that slows; II returns; III tuned foes take +30%),
outline #2EC4B6 bars (3 markers then pillars erupt in order; II 4 and seek; III big final pillar),
edit #FF3B5C slash (cut: bonus by missing HP, executes low-HP foes at 20/25/30%).
Analyst: tags #5EEAD4 tag (bracket trap pulls foes together, tagged +20%; II bigger; III shared damage),
quotes #FFE28A quote (strike pulls 2/3/4 quote shards that orbit, next attack fires them homing),
unknown #9DB4FF q (calm dome: enemy shots dissolve; II unmasks Mimics inside; III your hits +25% inside).
Builder: agents #7CFF8A bot (companions with named jobs: I Strike bot; II + Guard bot; III + Fetch bot),
skills #C77DFF rune (passive programmable rune: When [dodge|kill|hurt|5th hit] -> [shock|bolts|heal|shield];
I 1 rune with 2 triggers/actions, II all options, III 2 runes), connect #3DA5FF portal (portal pulls in a
tool: I turret; II alternates turret/supply crate; III adds anvil).

### Enemies (failure modes)
Vague Wisp (floater, lunges; resists imprecise hits), Hallucination Mimic (disguised as a heal orb, 35%
damage until verified), Scope Creeper (grows over time, splits on death unless finished by a precise or
heavy hit), Context Flooder (ranged junk-stream), Yes-Man (front shield, heals allies; break from behind,
with heavy hits, or reflect), Cliche Moth (Writer swarm), Stale Stat (Analyst turret), Loop Gremlin
(Builder charger that speeds up, dizzy at walls).

### Stages and bosses
1 Murmur Meadow / The Mumbler. 2 Mirage Market / The Confident Liar. 3 Sprawl Thicket / Scope Creep Hydra.
Writer: 4 Cliche Cliffs / The Beige Baron, 5 The Endless Draft / The Rambler.
Analyst: 4 Stale Archive / The Cherry Picker, 5 The Deluge / Context Flood.
Builder: 4 Loop Foundry / The Infinite Loop, 5 Tangle Works / The Tangle.
Boss patterns (telegraphed): slam, volley, rain, charge, summon, wave. Each boss mixes 3 and has a quirk.
Shield at 66% and 33% (finals 75/50/25): time slows, player is safe, a prompt challenge appears.
Strong answer: shield shatters, boss staggered 5s and takes +50%. Weak: shield chips to a pool you must
beat through. Boss challenges are drawn from the Fix/Write items of abilities the player has learned,
plus one authored "put this prompt in order" challenge per boss.

### Boons (per run, pick 1 of 3 after each room; only for learned abilities + generic)
Few-Shot Volley (Clear Ask fires 3), Long Context (x2 duration), Grounded (heal 1 per hit in Context),
Diverse Examples (echoes explode), Structured Output (shapes 30% wider), In Character (stance swap
shockwave), Deep Thought (charge x2 speed), Prompt Chain (finisher wave), Cited (verified +30%),
Devil's Advocate (reflect x3), one per track ability, and generic: Thick Draft (+25 HP), Bright Idea
(+50% sparks), Quick Edit (dodge cd), Hot Take (dodge burns), Sharp Wording (15% double), Second Wind
(heal 10 per room), Fast Typist (cooldowns -25%).

### Lessons (at shrines only)
Four steps per rank: Watch (weak prompt -> result -> strong prompt -> result -> why, one short text per
screen), Fix (tap the right replacement), Write (pick up to 3 blocks + one short text; good +2, bad -1,
text +1, pass at 5), Mentor quest (fill the rank's template slots for a real task; copy button).
Hard rule: no lesson screen longer than three lines. Budget about 105 characters per text; strong prompts
are shown as up to 3 short blocks. Add a test that checks every string length.
Track variation: rank I is general; rank II Watch examples have Writer/Analyst/Builder variants; quests
have a task line per track at every rank. Each rank adds/upgrades a copyable Codex template.
No API calls anywhere; grading is authored rubrics.

Data shape per ability rank:
`{ w:{g|W|A|B:[weakPrompt, weakResult, [strong blocks], strongResult, why]},
   f:[pre, bad, post, goodOption, whyGood, badOption1, badOption2],
   c:[goal, good1, good2, good3, bad1, bad2, textLabel],
   m:[general, W, A, B] or one string,  t:'template with [slots]' }`

## Lesson content checked against Anthropic's docs (Nov 2026)

Sources read: "Prompting best practices" (platform.claude.com/docs/en/build-with-claude/prompt-engineering/
claude-prompting-best-practices), "Reduce hallucinations", support articles on Skills and connectors.
- Clear: explicit and specific; "colleague with minimal context" test; say format and constraints;
  numbered steps when order matters; ask for more explicitly; action wording ("suggest" gets suggestions,
  "change" gets changes).
- Context: explain the reason behind an instruction; Claude generalises from it.
- Examples: 3-5, relevant, diverse; wrap in `<example>` tags; ask Claude to check them for patterns.
- Format: say what to do, not what not to do; XML tags to separate instructions/context/input and to
  mark output; match prompt style to wanted output style.
- Role: even one sentence focuses tone and behaviour.
- Think: general "think carefully" beats a scripted plan; final answer in `<answer>` tags;
  "Before you finish, verify against..." catches errors, especially maths and code. Newest models often
  self-check, so say this is most useful on hard problems.
- Long documents: put them at the top, question at the end (up to 30% better in Anthropic's tests);
  `<document>` with `<source>`; ask for relevant quotes first.
- Iterate: draft -> review against criteria -> refine; follow-ups that name what to keep and change.
- Verify: sources and quotes per claim; retract claims with no quote; permission to say "I don't know";
  cross-check several sources. Still validate critical information yourself.
- Critique: NOT a named technique in the docs. Teach it as the "review" step of the self-correction
  pattern plus asking for weaknesses against named criteria. Say so in the final summary.
- Sub-agents: use when work is parallel, needs isolated context, or is independent; do not overuse.
- Skills: folders of instructions, scripts and resources that Claude loads when relevant; the description
  says when to use it.
- Connectors: let Claude reach apps and data and take actions (examples in docs: Linear, Slack, Google
  Drive); permissions can be always allow / needs approval / blocked.

## Drafted Watch examples (weak -> result | strong blocks -> result | why)

clear I: "Write something about dogs." -> generic essay | [Write 3 tips for a first-time dog owner /
about the first week at home / one sentence each] -> three concrete tips | Say what, about what, and how
much. Claude can't guess the rest.
clear II W: "Write a blog intro about remote work." -> "In today's fast-paced world..." | [Write a 60-word
intro for my blog / Topic: remote work for new managers / Open with a concrete scene] -> "Your first hire
logs on from Lisbon..." | Would a colleague with no context know what to write? If not, add it.
clear II A: "Analyze this sales data." -> obvious facts | [Find the 3 biggest month-over-month drops /
in this sales data / and give one likely cause for each].
clear II B: "Fix my code." -> general tips | [This Python function returns None for empty lists /
Make it return [] / Keep the signature the same].
clear III: "Can you suggest some changes to my email?" -> a list of ideas, email unchanged | [Rewrite this
email under 80 words / End with one clear ask / Return only the new email] | 'Suggest' gets ideas;
'rewrite' gets a rewrite.
context I: "Write a birthday message." -> generic | [Write a birthday message for my grandad /
80, ex-sailor, loves puns / Warm, two sentences] | Background lets Claude aim.
context II W: "Keep it short." -> cuts the date | [Keep it under 50 words: / it goes on a phone lock screen /
so the date must come first] | Give the reason behind a rule.
context II A: "Don't include outliers." -> drops rows silently | [Leave out orders above $5,000: / they're
wholesale / I only care about normal shoppers].
context II B: "Don't use external libraries." -> rewrites everything | [Use only the standard library: /
this runs on a locked-down server / where I can't install packages].
context III: question first, then a 20-page contract -> misses clause 14 | [<contract>...</contract> /
I'm the tenant. / Which clauses let the landlord raise rent?] | Long material first, question last.
examples I: "Name my bakery's new bun." -> "Tasty Bun" | [Name my new cinnamon bun. / Names I like:
'Rye Smile', 'Proof of Love'] -> "Bun Voyage", "Roll Model" | Show what good looks like.
examples II W/A/B: one example gets copied; give 3-5 varied ones in `<example>` tags (headlines /
feedback labels incl. a mixed case / commit messages).
examples III: three examples that all start the same -> every reply starts the same | [Here are my 3
examples. / Are they varied enough? / Point out patterns I'm teaching by accident.]
format I: "Tell me about three laptops." -> wall of text | [Compare these three laptops / in a table:
price, weight, battery / one line on who each suits].
format II W: "Don't use bullet points." -> numbered lists instead | [Write this as two flowing paragraphs /
like a letter to a friend]. A: "Don't make it long or messy." | [Answer in exactly 3 rows: / Metric |
This month | Change / then one sentence of takeaway]. B: "Don't add extra text." -> "Sure! Here's your
JSON..." | [Return only valid JSON / with keys name, version, deps / inside <json> tags].
format III: instructions, draft and stray notes in one blob -> rewrites the notes too | [<instructions> /
<draft> / <notes>] | Tags keep the parts from blurring.
role I: "Explain inflation." -> textbook | [You are a patient high-school economics teacher. / Explain
inflation / to a 15-year-old.]
role II W fiction editor (pacing, dialogue); A market researcher briefing a product team (pricing);
B security reviewer checking login code. Why: pick a role that matches the job.
role III: "You are an expert. Be smart." -> pompous and generic | [You're a nurse educator / writing for
new parents at 3am / explain fever care in calm, plain steps] | Say which expert, for whom, doing what.
think I: phone plans, quick wrong answer | [Think it through before you answer: / work out my yearly cost
on each plan / then pick one].
think II W: "Is my argument sound? Yes or no." -> "Yes." | [Think carefully about whether each claim
follows from the last / then give your verdict at the end]. A: average of a messy table | [Reason through
blanks and duplicates first / Put the final number in <answer> tags]. B: "Why does this crash?" |
[Think through what each line does with an empty input / before naming the cause].
think III: bill split that doesn't add up | [Split this bill 7 ways with 15% tip. / Before you finish, /
check the shares add up to the total.]
iterate I: scrapping a stiff draft and starting over -> another stiff draft | [Good start. / Make it half
as long / and swap the formal opening for a friendly one].
iterate II W: "Make it better." | [Keep paragraphs 1 and 3. / Rewrite paragraph 2 / so the main point
comes first]. A: "That's wrong, try again." | [The Q2 total is off: / you counted refunds as sales. / Redo
with refunds subtracted]. B: "Still broken." | [Still failing. New error: / KeyError: id on line 20 /
when the list is empty].
iterate III: "Write a perfect cover letter in one go." | [1) Draft it. / 2) Review it against the job ad's
3 must-haves. / 3) Rewrite to fix the gaps.]
verify I: "Give me stats about remote work." -> a number with no source | [Give me 3 stats on remote work. /
For each, name the source and year. / Say so if you're not sure.]
verify II W: only attributable quotes, else leave out; A: exact quote from the report per claim, no quote
no claim; B: check the pasted docs and quote the line relied on.
verify III: "Be definite." -> invented certainty | [Check more than one source. / Tell me where they
disagree / and say "I don't know" if they don't settle it.]
critique I: "Here's my plan. Good, right?" -> "Great plan!" | [What are the 3 weakest points? / Be direct: /
I want problems, not praise.]
critique II W: read as a bored reader about to scroll past; A: argue against my conclusion, what else
could explain it; B: review as the person paged at 3am, what fails first.
critique III: "Any feedback?" -> vague | [Score this against my 3 goals: / clear, short, persuasive. /
Rank the problems by how much they hurt.]
Writer: audience I refund policy for an upset customer (calm, friendly, under 60 words); II describe the
voice as a person and a moment; III give 2 samples, have Claude name the voice in 3 traits, then write.
outline I outline first, approve before drafting; II write one section against the outline with a
hand-off line; III outline decides which notes to use and which to cut.
edit I cut by a third, keep meaning and voice, show what was removed; II list changes as before -> after
with reasons; III edit in passes: structure, clarity, polish.
Analyst: tags I data vs note in separate tags; II one `<document>` per source with `<source>`; III long
material first, question last. quotes I quotes first then answer from them; II numbered quotes in
`<quotes>` tags, "No relevant quotes found" is allowed; III after writing, find a quote per claim, remove
unsupported claims. unknown I permission to say there isn't enough data; II mark estimates and list
assumptions; III three rival explanations with confidence and a test for each.
Builder: agents I one sub-agent per competitor, each returns a 5-line summary; II only for parallel or
isolated work; III a brief = goal, limits, exact return shape. skills I save repeated rules as a Skill;
II a specific description says when it applies; III one Skill per job, with its template and script.
connect I with a connector Claude can see the calendar; II name the tool and what to fetch; III read
freely, ask before sending/deleting/creating.

Still to author: every Fix and Write item, quest lines, Codex templates, boss "order" challenges.

## How to work (from the brief)

Passes on the same page: combat and hub -> shrines and abilities -> stages and bosses -> tracks and
Codex -> polish. Get combat feeling good first. Test after each pass in headless Chrome at a phone
viewport (e.g. 780x360 landscape and 390x780 portrait): no console errors, a bot can clear a room, lesson
strings fit, frame time is sane. Then publish as an artifact and report honestly what was tested.
