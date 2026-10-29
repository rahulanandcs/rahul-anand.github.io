# Rahul OS appearance

Studio Glass is the default for new visitors. Windows 7 is the alternative.
The header switch and Settings → Appearance control the same saved preference.
If browser storage is unavailable, switching still works for the current visit.

## Editing the themes

- `os/themes.css`: shared content surfaces and About styling.
  Studio uses `[data-theme='studio']`; Windows 7 uses `[data-theme='classic']`.
  The first `:root` block contains the shared content color tokens.
- `os/desktop.css`: final desktop appearance and responsive spacing. Studio
  uses translucent blue-gray panels, royal-blue icons, and logo-green accents.
  Windows 7 uses a real landscape, glossy Aero chrome, and classic SVG icons.
- `os/case-study.css`: detail-page typography, title/image layout, and editorial
  sections. Container queries adapt the composition to the actual window width.
- `index.html`: early preference loading, theme switch, stylesheet loading.
- `os/os.js`: `setTheme()`, theme settings, both icon sets, About markup, and
  `buildStory()`. The latter organizes the supplied copy into Overview,
  Highlights, and A closer look, preserving factual content and source links.
- `os/motion.js`: scoped About animations, the travel sequence, and detail-page
  entrances and scroll reveals.
- `os/os.css`: original shell; the colored hover glow was changed to neutral elevation.

## About photography

The existing portrait reveal is retained. The two source photos have different
poses, so the registration remains an approximation rather than a seamless match.
No source images were edited.

`aboutStudio()` adds the travel stage near the end of About. Its SVG path defines
the curve. `renderTravel()` in `os/motion.js` samples that curve and positions the
photograph with transforms; layout measurements are cached and refreshed only
when layout changes. Edit `travelPhotos` to change the sequence and captions.
The three existing photos are from Japan and India. The line is decorative and
does not represent their geographical locations.

Disabling Expressive motion, or requesting reduced motion in the system, gives
the travel scene a normal static layout. Animation scopes are reverted when an
app view is replaced, closed, or minimized.

## Desktop spacing and assets

The desktop scroll area ends above the dock. Its content can scroll on smaller
screens without passing behind the taskbar. The existing window manager keeps
app windows between the system bar and dock and recalculates after theme changes.

`os/landscape.jpg` replaces the AI bubble wallpaper in Windows 7. Source and
license are in `os/ASSET-CREDITS.md`. The older wallpaper and icon atlas are
retained on disk for recovery, but these two themes no longer display them.

The individual icon overrides near the top of `os/os.js` still work. Set an
app's `src` to use a custom image; otherwise `icon()` supplies both theme variants.
Its `scale`, `dx`, and `dy` settings control per-app alignment.

## Verification

The current desktop was checked at 1440 × 900, 1280 × 720, 768 × 1024,
and 390 × 844 in both themes. There was no horizontal overflow. The desktop
scroll boundary stays 20–36px above the dock; the open detail window stays
at least 12px above it. Availability and actions have 16–22px vertical gaps.
The reduced-motion detail view renders its heading and overview without hidden
starting states. JavaScript syntax checks passed.

The finished screenshots and measured checks are in `.design-review/desktop-final/`.
The gallery was also checked after scoping the moving About photo styles to
`.travel-journey`, so those styles no longer affect the gallery's square tiles.

The general landing-page inspector's first pass is retained in
`.design-review/desktop-v2/`. It reported eight failures and four warnings,
including intended gradients, shadows, glossy buttons, and the lack of hero
photography/video on this app launcher. Its small desktop-label finding prompted
larger labels; its transient logo warning was checked again after image decoding
and the logo loaded at all four sizes. This is not a clean whole-site audit.
No persistent detector ignores were added. Glass, gloss, reflective rims, and
dimensional icons follow the explicitly requested desktop styles.

The design-taste composition draw was “The pinned poster”, seed 336025675.
Its stationary frame and passing photographs informed the travel scene. The
user-requested desktop interaction and two themes took priority over the draw's
full-page navigation blueprint. Project photography and factual claims remain
unchanged; the later desktop revision adds only the credited CC0 landscape.

## Latest card and About refinements

`os/portfolio-cards.css` controls the solid Studio cards and the separate
Windows 7 Explorer previews. Selected logos use white backing panels for contrast; all artwork keeps its natural proportions.
Studio cards use individual activity colors, and design cards use larger image previews. Contact styling is scoped to Studio Glass;
the standalone email address remains visible in Windows 7.

`os/about-motion.css` styles the SWE/AI project selectors, square travel scene,
and closing animations. `os/motion.js` owns scroll movement and pausing.
About Me has a concise education summary: university, degree, minor, and scholarship.

The `projectProfiles` table in `os/os.js` holds dates and logos. FLiNT uses
`images/FLiNTWin.jpeg`; its two additional gallery spaces remain placeholders.
