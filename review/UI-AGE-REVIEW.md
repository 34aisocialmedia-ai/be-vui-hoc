# UI and age-flow review — 2026-10-13

## Shipped design
- One ivory/teal visual system for the home, library and shared play area.
- Hero image and text occupy separate regions; learning photos use contain, without magnification or floating speaker controls covering subjects.
- Eight game tiles per page, full readable names, separate play affordances, age/category/play-style filters.
- Shared SVG navigation controls. Removed decorative emoji layers, duplicate teacher badge, duplicate score indicators, and duplicate tree mascot.
- Progress is a single bar plus a task counter. A rabbit responds below the game, outside the answer area.
- Tree harvesting, train departure, card flipping, feedback motion and brief confetti retained; respects reduced-motion preferences.
- Scale rebuilt as a responsive CSS illustration to remove the background rectangle in the old raster image. Object counts remain explicit and accurate.
- These are 3D-style illustrations with CSS animation, not a new WebGL/3D engine.

## Learning and interaction
- Authored library remains 216 games, 24 groups, nine games per group.
- Sessions: ages 2–3 = 5 tasks / at most 2 ordinary choices; 3–4 = 6 / 3; 4–5 = 8 / 3; 5–6 = 10 / 4.
- Spatial boards and alphabet boards retain their full authored layout. Memory/pair boards limit simultaneous pairs by age.
- Repeat visits rotate through authored tasks, including train, scale and dot drawing, without mutating the original library.
- O–Ô–Ơ and A–Ă–Â moved to the 5–6 letters group; stable legacy IDs preserve progress. Earlier literature slots replaced with picture-story / animal-memory activities.
- Dot drawing starts with the triangle; its preview matches that activity.
- Gifts offered after completion only. Session tasks frozen while saved plays update, preventing completion-time task changes.
- Sorting supports direct tapping of the destination basket as well as drag and drop; no preliminary selection is required.
- Automatic question narration no longer reads every answer before interaction. Individual card audio remains available.

## Validation
- npm test: 35/35 passed, including rendering all 216 players, age-session counts, reachable answers, rotating specialist tasks, unique covers, local media and audio safeguards.
- npm run build: passed.
- Curriculum media audit: 216 games, zero missing pictures.
- Active audio corpus: 1,440 unique phrases, zero missing recordings. Existing Cô Thủy MP3 files preserved.
- Browser: desktop and narrow layouts (~388–431 CSS pixels); inspected home, comparisons, pairs, sorting, train, scale and alphabet.
- Played a full 10-task O–Ô–Ơ session, including three Ơ answers, through to completion.
- Played a full five-task animal session for ages 2–3 through to completion.
- Confirmed direct basket tap increments score and advances the item.
- Automated checks cover all games; manual end-to-end play does not cover every one of the 216 games or every physical device.

## Deployment
- Cloudflare Pages: https://be-vui-hoc-test.pages.dev/
- Immutable release: https://27d180bf.be-vui-hoc-test.pages.dev/
- Primary alias returned HTTP 200 and the new index-Czy1F8KQ.js bundle.
- Fresh release tab loaded without console errors. Verified the updated scale interface online.
- Screenshot: ui-release-home.jpg.
