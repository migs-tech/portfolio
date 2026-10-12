# Felix Miguel M. Atenin — Portfolio

Personal portfolio site. Built with React and Vite, no UI libraries.

## Run it

```bash
npm install
npm run dev        # local development
npm run build      # production build in /dist
npm run preview    # serve the production build
```

## Editing content

All text lives in the content files; components only render it.

| What | Where |
| --- | --- |
| Name, email, résumé, hero bio, hero numbers, skills, experience, education, certificates, social links | `src/content/profile.js` |
| Résumé viewer text | `src/content/resume.js` |
| Job fit checker: skills it recognizes, gaps, sample posts | `src/content/jobFit.js` |
| Project order | `src/content/projects.js` |
| OJTrack project, features, stack, evaluation results, case study, screenshots | `src/content/ojtrack.js` |
| PRimeSys project, features, stack, case study, screenshots | `src/content/primesys.js` |

- **Hero numbers:** the three figures under the hero are `highlights` in `profile.js`. Keep them to facts you can point to.
- **Social links / project links:** set `url` on the matching entry. Entries left as `null` are not shown. A project link with `primary: true` is the live site: it gets the main button in the case study and the "Live site" link on the project card.
- **Project cards:** `highlights` (up to three one-line proof points), `keyStack` (the chips on the card) and `cover` (the card screenshot) are shown on the page; everything else is in the case study.
- **Evaluation results:** a project with `results` (see `ojtrack.js`) gets a ratings panel in its case study.
- **Case study links:** each project card opens its case study in a pop-up, and Back closes it. Link straight to one with `/#project-<id>`, e.g. `/#project-primesys`.
- **Adding a project:** copy `primesys.js` as a template, then add it to the list in `projects.js`. Fields left `null` or empty (such as `role`, `team`, `contribution`, `results`) are hidden.
- **Skills:** each group in `skillGroups` takes an `icon` (a name from `src/components/ui/Icon.jsx`), a one-line `summary`, and optional `wide: true` to span two columns.
- **Certificates:** put the original scan or photo in `source-images/`, add a job for it in `scripts/optimize-images.mjs` with `redact` boxes over every signature (and any ID numbers), run `npm run images`, then add an entry (image, `alt`, title, issuer, date) to `certificates` in `profile.js`. They appear under Education with a zoomable view; set `certificate: '<id>'` on an experience or the education entry to add a "View certificate" link there. Publish images only, never PDFs, and keep personal records such as the full Transcript of Records (TOR) off the site. The section says the originals and the TOR are available on request.
- **Résumé:** the résumé buttons open a viewer on the page (`src/components/resume/ResumeViewer.jsx`) that "prints" the résumé onto a sheet, with section tabs, links to the case studies and certificates, and **Open PDF** / **Download** buttons. Link straight to it with `/#resume`. Its text is in `src/content/resume.js` and should match the PDF in `public/resume/Felix-Miguel-Atenin-Resume.pdf`, so update both together. The web version leaves out the phone number and street address on purpose (they're only in the PDF).
- **Photo and screenshots:** put originals in `source-images/` and run `npm run images` to crop and compress them into `src/assets/images/` (each job in `scripts/optimize-images.mjs` lists its source file and sizes). The website screenshots are 1440px-wide captures of the live sites at 2x pixel density; phone screenshots come from a real device. After replacing an image, update its `width`/`height` in the content file. (`source-images/` is git-ignored because raw screenshots can include browser bookmarks and status bars.)
- **Logo and icons:** the FA monogram is drawn from shapes in `src/lib/monogram.js`. That one file feeds the header logo (which turns over to the round avatar on hover), the favicons and the phone home-screen icon; after changing it, run `npm run images`. The round avatar is cropped from `portrait.jpg` by the same script.
- **Link-preview image** (the picture shown when the link is shared on Messenger, Facebook or LinkedIn): `public/og-image.jpg` is a capture of the hero, from the header down to the three numbers, in the light theme. To update it after changing the hero, screenshot the top 1600 × 840 of the page at 2× pixel density into `source-images/og-hero.png` and run `npm run images`. Sites keep old previews for a while: refresh them in Facebook's Sharing Debugger and LinkedIn's Post Inspector.
- **Hero photo card:** the portrait (`portrait.jpg`) is on the front and the graduation photo (`portrait-graduation.jpg`, 4:5) on the back; visitors click or tap to flip it. The card turns over in the direction of the click: any of the four sides or four corners (corners give a slanted, diagonal flip), always landing upright. The card itself is `src/components/sections/HeroPortrait.jsx`.
- **Light and dark theme:** the site follows the visitor's system setting; the header button switches it and the choice is remembered on that device. Colours are tokens at the top of `src/styles/base.css`.
- **Live demos ("Try it"):** working replicas of each system's core flow, with sample data and no network calls: `src/components/demos/OjtrackDemo.jsx` (OTP → one-time QR → supervisor scan) and `PrimesysDemo.jsx` (a purchase request moving through the seven statuses).
- **Fit check:** visitors paste a job post and get a fit score, the post with skills highlighted (green: on my résumé, amber: not yet) and where I used each one; they can then copy a summary or send the role through the contact form. Matching runs in the browser (`src/lib/jobFit.js`), so nothing pasted is sent anywhere. In `src/content/jobFit.js`, `fitSkills` lists my skills with the words a post might use for them, and `notYet` lists common requirements I can't claim, which lower the score so it stays honest. When you learn something, move it from `notYet` to `fitSkills` with where you used it.
- **Profile views:** the chip in the hero ("👁 1,234 profile views") rolls its digits up on load, pops a "+1" when this visit counts, and its eye follows the cursor. Hover, click or tap opens a card with unique visitors, today's views and a last-7-days chart (`src/components/ui/ProfileViews.jsx`; `views` in the command palette prints the numbers). `api/views.js` is a Vercel Function that keeps the numbers in an Upstash Redis database. A visit counts once per browser session, and a person counts at most once per 30 minutes; a browser's first visit also counts as a unique visitor (once a day at most). To enforce that, a salted, one-way hash of the visitor's IP address is kept for 30 minutes (views) or 24 hours (visitors) and then deleted. No names, IP addresses or cookies are stored, and only totals are shown. Automated browsers never count. "Today" is a Philippine day. Online, the chip stays hidden until the counter is set up (see Deploying). On your computer, `npm run dev` and `npm run preview` show the live site's real numbers, read-only (`vite.config.js` asks https://felixmigs.vercel.app, or `VITE_SITE_URL` when set), so testing never adds views.
- **Skill galaxy:** `skillHubs` and `skillLinks` in `profile.js` say where each skill was used; only add links you can back up. Each project is a star, skills used only there orbit it as planets, and skills used in more than one project sit between them, linked to each (`src/components/sections/SkillGalaxy.jsx`). A new project needs a spot in `SYSTEMS` there. Time slows while the pointer is over the galaxy and stops on a skill. Phones show the skill cards instead.
- **Command palette:** Ctrl K / ⌘K or `/` opens it. Commands (including the terminal ones like `whoami` and `sudo hire felix`) are listed in `buildCommands()` in `src/components/ui/CommandPalette.jsx`.
- **Live badges:** the "Live" badge on each project pings the live site from the visitor's browser and shows the response time (`src/lib/ping.js`).
- **Animations:** all motion lives in `src/styles/motion.css`; cursor effects (card glow, screenshot tilt) come from `src/hooks/usePointerEffects.js` and only run with a mouse or trackpad. Visitors who turn on "reduce motion" get a still page. The hero's rotating role is `rolePrefix` + `roleWords` in `profile.js`; it plays once and ends on the first word.

## Settings (`.env`)

Copy `.env.example` to `.env`:

- `VITE_SITE_URL`: the deployed URL. Enables the canonical and Open Graph URL/image tags.
- `VITE_CONTACT_ENDPOINT`: optional form endpoint that accepts JSON, for example a free [Formspree](https://formspree.io) form URL. When set, the form sends messages directly and shows success only after the service confirms. When empty, **Send Message** opens the visitor's email app with the message pre-filled.

Neither value is a secret; don't put private keys in `VITE_*` variables, because they end up in the browser bundle.

## Deploying

The site is live on Vercel at https://felixmigs.vercel.app, deployed from the `main` branch on GitHub: every `git push` publishes. Build command `npm run build`, output directory `dist`. The site itself is static, so any static host works, but the profile views counter (`api/views.js`) needs Vercel Functions.

**Profile views setup (once):** in the Vercel project, open **Storage**, create an **Upstash for Redis** database on the free plan and connect it to this project. That adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` settings (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` work too). Then redeploy. Until then, the counter simply doesn't show.
