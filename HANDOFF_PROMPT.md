You're picking up a game build that two earlier chats started. The attached zip (promptsmith-handoff-2.zip) has all of it.

1. Unzip it into a new folder. Read BRIEF.txt (my original request), then HANDOFF.md (state, my feedback, what I want next, known bugs, how to build and test), then docs/HANDOFF_v1_design_and_lesson_notes.md (game design and doc-checked lesson notes), then src/ in file-name order. Look at reference/ to see how it looks now and the crash I hit on my phone.

2. Before changing anything, run `python3 build.py` and the tests in test/ (HANDOFF.md lists them). Get Playwright and a Chromium working first; Three.js r128 and the fonts are in vendor/ so the 3D path tests offline. Tell me straight away if any test fails on the build as handed over.

3. Review what's there with fresh eyes. Play it in a real browser if you can, with sound on, on a phone-sized window and a desktop window. Give me a short list of what you'd fix and what you'd improve, most important first, then start on it without waiting for me.

4. Build these, in this order, on the same page:
   - Fix every bug and weak spot listed in HANDOFF.md, and any you find.
   - A proper step-by-step tutorial for a first-time player (movement, dodge, attacking, learning Clear Ask at a shrine, equipping it, the first stage). Skippable and replayable.
   - Character creation and naming on first start, editable later in town.
   - Real desktop support: mouse and keyboard, hidden touch controls, key rebinding, menus you can drive with keys, layouts that work on big screens.
   - Then make it better. I want it to look like a premium 2.5D game in the spirit of MapleStory (chunky terrain and ledges, bold outlines, cute bouncy monsters, big damage numbers, lush layered backgrounds) with toy-like cartoon characters, not anime ones, and all-original designs. It should not look like an AI made it. Use any design, frontend or game skills you have.

5. Keep the rules from BRIEF.txt: one self-contained page, Three.js with a tested Canvas fallback, no image or audio files, touch first, smooth on a mid-range phone, saves in the browser, no API calls, no lesson screen longer than three lines, lesson content checked against Anthropic's current prompting docs. Keep the code structure HANDOFF.md describes (registries and interfaces) and use SOLID principles where they make sense.

6. After each piece, rebuild, run the tests, add tests for the new work, and look at screenshots at phone sizes (landscape and portrait) and desktop sizes, on both the Three.js path and the Canvas fallback. Test with sound on.

7. When you're done, give me dist/index.html and tell me exactly what you tested, what you couldn't, and anything left unfinished. If you run out of room, say what's left and continue when I say "keep going".

I'm often on my phone, so keep your messages short.
