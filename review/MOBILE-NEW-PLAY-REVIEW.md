# Mobile layout and new play mechanics — 2026-10-13

## Release
- Live: https://be-vui-hoc-test.pages.dev/
- Immutable release: https://bb43b756.be-vui-hoc-test.pages.dev/
- JavaScript: index-D85kEeOO.js; CSS: index-wRTlUGhU.css.
- Confirmed the primary domain serves the new bundle. Existing service-worker installation showed the old shell once and used the current bundle after reload.

## Mobile changes
- Removed inherited narrow hero title width; compact phone hero and navigation.
- Kept age tabs, image cards, game headers, option groups, trees and activity boards within available width.
- Respect safe-area insets; allow vertical scrolling in landscape and long screens.
- Large touch controls, fewer decorative elements, motion respects reduced-motion preference.

## New mechanics
Ten existing activities now use three distinct interaction modes; the curriculum remains 216 activities.
- 2–3: three swipe-to-reveal activities, six large reveal tiles.
- 3–4: one reveal activity, one fruit collection activity (up to five), one 4×4 maze.
- 4–5: one fruit collection activity and one 5×5 maze.
- 5–6: one collection activity (up to ten) and one 5×5 maze.
- Collection supports tap or drag, a visible dragged fruit, undo, explicit checking, and correcting excess quantities.
- Maze supports swipe, direction buttons and arrow keys; walls block movement; each route is reachable.
- Added an entry button and play-style filter for discovering these activities.

## Verification
- 39 automated tests passed, including connected maze routes, no row wrapping, fast swipe interpolation, collection bounds and session rotation.
- Production build and TypeScript check passed.
- All 216 activities render in the existing server-render smoke test; curriculum media audit reports zero missing images.
- Audio audit: 1,440 active phrases, zero missing existing recordings. Cô Thủy recordings retained.
- Browser play-throughs completed: reveal 5/5, collection 6/6, maze 6/6.
- Explicitly exercised dragging (one fruit per drop), excess quantity rejection, undo and resubmission, maze wall blocking, arrow keys and swipes.
- Measured local responsive widths 358 and 391 px, and 768×417 landscape; tested seven-letter tree with separate touch regions. No page-level horizontal overflow on the inspected screens.
- Verified production home and maze at an exact 320 px CSS viewport; maze controls measure 48×44 px, no page overflow, movement works and no browser errors/warnings were recorded.
- Screenshot: mobile-maze-320.jpg.

## Limits
These checks use browser viewport emulation, not physical iPhone/Android hardware. The user's specific device and failing screen were not supplied. Vertical scrolling in short landscape viewports is intentional.
