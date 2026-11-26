# SDX Catalogue verification

Recommendation for [APS-5099](https://dpdd.atlassian.net/browse/APS-5099). The full verification suite stays on [APS-4971](https://dpdd.atlassian.net/browse/APS-4971). This file is the rerun record: the harness decision, one public-home proof, the coverage map, and the manual script.

## Decision

Keep Cypress in this repo, pointed at the `sdx-ui` image Compose already runs.

`docker-compose.yml` starts `ghcr.io/bcgov/aps-devops/sdx-ui`. `.github/workflows/aps-cypress-e2e.yaml` brings that container up with the rest of the stack. Cypress reaches the brochure at `http://sdx-ui.localtest.me:5500` (`SDX_UI_URL` in `e2e/cypress/support/sdx-commands.ts`). Authenticated journeys reuse `sdxUiLogin` and `clearSdxUiSession` with the existing Keycloak user `janis@idir` (`DEV_USERNAME` / `DEV_PASSWORD` in `e2e/cypress.config.ts`). `refresh=1` reloads the in-memory organization catalog after API setup. The notification spec already opens `/connections` and asserts a visible service name, Pending, and Approve / Reject.

A second runner would rebuild that login, catalog refresh, and Compose job. Catalogue checks stay in their own spec layer, `e2e/cypress/tests/27-sdx-catalogue/`, so they are not chained to the default suite. That suite runs with `testIsolation: false` and depends on partner data created by earlier specs. Number 26 will be the Keycloak HA suite (`e2e/cypress/tests/26-keycloak-ha`). `27-sdx-catalogue` is off the ordered `specPattern` list in `e2e/cypress.config.ts`. `npm run cy:sdx-catalogue` sets `SDX_CATALOGUE_SPECS=1` and passes `--spec`, because `setupNodeEvents` replaces `specPattern` for the default suite and would otherwise drop this folder.

Public pages need no seed data. Authenticated Catalogue journeys, when APS-4971 adds them, should call `sdxUiLogin` and the API helpers in `sdx-commands.ts`.

**Accessibility.** On APS-4971, rerun the rules axe can check inside the logged-in browser (`cypress-axe` / axe-core): contrast, target size, nested interactive controls, button and link names, list and heading structure, and page language. This spike does not install `cypress-axe`. Keep Lighthouse as the occasional second opinion [APS-4962](https://dpdd.atlassian.net/browse/APS-4962) already used, outside the main Cypress job. Keep manual, using the [DevHub accessibility assessment](https://dpdd.atlassian.net/wiki/spaces/POSM/pages/1537671344/DevHub+Connected+Services+TechDocs+-+Accessibility+Assessment) method on brochure pages: Appendix A keyboard script, 400% zoom, forced colours, heading inspection, and a screen reader pass (NVDA on Chrome, plus the VoiceOver check APS-4962 already used for the copy control).

**Design system and UX.** Assert observable outcomes: primary navigation order (Home, then About), Help content present, status shown as text, and dialog focus behaviour when a journey opens a dialog. Leave visual fidelity to the B.C. Design System, spacing, responsive layout, and forced-colours appearance to the manual script. There is no screenshot baseline. The UI is still the moving `dev` image.

## Rerun

The `sdx-ui` container must already be running (`docker compose` from the repo root; the service depends on `apsportal`, `keycloak`, and `oauth2-proxy`).

```bash
cd e2e
npm run cy:sdx-catalogue
```

That runs only `cypress/tests/27-sdx-catalogue/01-brochure-home.cy.ts`. It visits `http://sdx-ui.localtest.me:5500`, checks that the configured site title from `local/sdx-ui/config.yaml` (`Secure Data Exchange`) is visible, and checks that the primary navigation (`nav[aria-label="Main navigation"]`) includes Home. It does not log in or seed data.

`npm run cy:run` does not include this spec. Override the browser with `BROWSER` (the script defaults to headless Electron).

## Proof

On 25 Nov 2026, `npm run cy:sdx-catalogue` passed against the `sdx-ui` container that was already running from Compose (`ghcr.io/bcgov/aps-devops/sdx-ui`, default tag `dev`, `http://sdx-ui.localtest.me:5500`). Cypress 13.17.0 ran Electron 118 headless, found only `01-brochure-home.cy.ts`, and reported 1 passing test in about 1 second. The spec did not log in or seed data.

## Coverage map

Each row is a check, where it comes from, the expected outcome, and whether the check is automatic or manual. Automatic rows that are not in this spike are for APS-4971.

### Journeys

[APS-4970](https://dpdd.atlassian.net/browse/APS-4970) is To Do. The description asks for provider and consumer paths and draft journeys. There is no journey text and there are no comments. Provider versus consumer paths are not written down. The rows below are provisional paths that already exist in code or in tickets.

| Check | Source | Expected outcome | Mode |
| --- | --- | --- | --- |
| Public Home | APS-4962 iteration 1 scope; `local/sdx-ui/config.yaml`; this spec | The public home page loads at `http://sdx-ui.localtest.me:5500` without login. The brochure shows the site title `Secure Data Exchange`. Primary navigation includes Home. | Automatic. Proved by `01-brochure-home.cy.ts`. |
| About | Tuesday convo D03; Master findings O02, H02 | About sits immediately after Home in the primary navigation. An About page exists. The Home "About the Secure Data Exchange" panel links to it. | Automatic on APS-4971. This spike does not assert it. |
| Help | Tuesday convo D04; Master findings O03, O04 | Help is Catalogue-specific and stays the help destination. The TechDocs link is removed. The wording is the content provided for APS-4962, which is not in the workbook. | Automatic on APS-4971 once that content is the oracle. |
| Provider connection review | `e2e/cypress/tests/23-notifications/02-connection-request-notification.ts`; `docs/common-sso-partner-api-walkthrough.md` | After `sdxUiLogin`, `/connections?org=…&refresh=1` shows the service name, the text Pending, and Approve / Reject. `refresh=1` reloads the in-memory catalog. | Automatic. Already asserted by the notification spec, which is on the default suite. |
| Member Console connection requests | [APS-5140](https://dpdd.atlassian.net/browse/APS-5140) (To Do) | No expected outcome until the updated pages are confirmed with the catalogue owner. | Unspecified. APS-5140 scope. |
| Common SSO Integrations | APS-5140 (To Do) | No expected outcome until that section is confirmed. | Unspecified. APS-5140 scope. |

### UX review workbook (APS-4944 / APS-4962)

The review is in [7 - SDX_Catalogue_UX_Review_Iteration1_preserved.xlsx](https://bcgov.sharepoint.com/:x:/r/teams/00108/Shared%20Documents/TM_APS/Connected%20Services/SDX%20Catalogue%20-%20UX%20UI%20Review%20and%20action%20options/7%20-%20SDX_Catalogue_UX_Review_Iteration1_preserved.xlsx?d=w647000d6259e48a5b11f42801ed8237d&csf=1&web=1&e=dzkqgr). [APS-4971](https://dpdd.atlassian.net/browse/APS-4971) covers it on this harness. The workbook is the expected outcome for each check.

| Check | Source | Expected outcome | Mode |
| --- | --- | --- | --- |
| UX review workbook | [APS-4944](https://dpdd.atlassian.net/browse/APS-4944), [APS-4962](https://dpdd.atlassian.net/browse/APS-4962) | Covered on APS-4971. | Automatic where axe or a DOM assertion applies. Otherwise manual. |

### Accessibility method

Adapted from the DevHub assessment (WCAG 2.2 AA method) and from the tools APS-4962 listed. Backstage findings are not expected results for the brochure.

| Check | Source | Expected outcome on the brochure | Mode |
| --- | --- | --- | --- |
| axe | DevHub §2.3; APS-4962 | axe-core reports no violations for contrast, target size, nested interactive controls, button and link names, list and heading structure, and page language, on the public pages and on a logged-in journey. | Automatic on APS-4971 (`cypress-axe`). Not installed here. |
| Lighthouse | DevHub §2.3; APS-4962 | Accessibility audit used as a second opinion. It does not gate the Cypress job. | Occasional manual run, outside Cypress. |
| Keyboard | DevHub Appendix A; APS-4962 | Tab order reaches each control, focus is visible, Enter/Space activate, a dialog takes focus and Esc returns focus to the trigger, and Shift+Tab reverses the order. Repeated at 400% zoom. | Manual. Script below. |
| 400% zoom | DevHub §2.3; APS-4962, including the header note in the ticket comments | Content reflows with no loss of information or function and without page-level horizontal scrolling. Below an 800px layout width the compact header is used; at 800px and above the full navigation remains. Help and account stay outside the Menu. Verify at 320px width and at 400% zoom. | Manual. |
| Forced colours | DevHub §2.3 (Chrome Rendering → Emulate forced-colors); APS-4962 | Text, controls, and focus remain visible. Status is available as text, not by colour alone. | Manual. |
| Headings | DevHub HeadingsMap; APS-4962 | Home, About, and Help each have a hierarchical heading outline a reader can follow. | Manual. |
| Screen reader | DevHub NVDA + Chrome; APS-4962 | NVDA on Chrome announces name, role, and state. Workbook rows that depend on an announcement, including copy success, use this pass. APS-4962 recorded a VoiceOver check for the copy control and did not complete an NVDA pass. | Manual. |

## Manual script

Run against the local brochure at `http://sdx-ui.localtest.me:5500` (Compose hostname, because the OIDC redirect is `http://sdx-ui.localtest.me:5500/auth/callback`). Sign in as `janis@idir` using `DEV_PASSWORD` from `e2e/cypress.config.ts` only for the authenticated steps. Public Home needs no account.

Pages: public Home; About (the page linked immediately after Home); Help (the Help control, with the TechDocs link removed); one provider connection review at `/connections?org=…&refresh=1` when seed data exists. Member Console and Common SSO wait on APS-5140.

### Keyboard (DevHub Appendix A)

On each page:

1. Tab from the address bar. The first stop is a skip link or another meaningful first control.
2. Tab through the page. Record each stop and whether focus is visible (light surfaces: blue 2px outline with 2px offset; dark surfaces: white 2px outline with 2px offset, from the APS-4962 focus note).
3. At each stop, the name tells you what the control is and what activation will do.
4. Activate with Enter or Space as appropriate.
5. Open any menu or dialog. Focus moves inside. Esc closes it. Focus returns to the trigger. The title and close control stay available without a second scroll area.
6. Shift+Tab returns through the same stops in reverse.
7. If a focused target sits under the sticky header, focus is still visible.
8. Repeat at 400% zoom.

Expected: every interactive control is reachable and operable, focus is visible, and focus is trapped only inside an open dialog.

### Zoom and responsive layout

Set the browser to 400% zoom from a desktop viewport, and separately set the viewport to 320px wide.

Expected: no clipping and no page-level horizontal scrolling. Below 800px, the compact header shows the B.C. logo and product title, then Help, Account or Login, and Menu. Primary navigation, including Member Console when signed in, is inside Menu and keeps its order. At 800px and above, the full navigation remains. Help and account access stay out of Menu. Signed out shows Login. Signed in shows Account, with the email as plain text and Logout in the dropdown.

### Forced colours

Chrome DevTools → Rendering → Emulate forced-colors: active. Repeat the keyboard pass on Home and on a connection card.

Expected: text, icons, buttons, and the focus outline remain visible. Pending and other statuses are readable as text.

### Headings

Inspect the heading outline on Home, About, and Help (HeadingsMap or the accessibility tree).

Expected: a single logical outline, headings in order, and headings that describe the section.

### Screen reader

NVDA with Chrome on Windows, on Home, About, Help, and a connection-review dialog. Separately, activate a copy control.

Expected: name, role, and state are announced, including copy success where the workbook requires an announcement. APS-4962 did not complete a full screen reader pass. VoiceOver on Mac was used once for the copy control.

### Design system and UX (observable, no screenshot baseline)

The workbook row is the pass condition. This script checks the observable result and leaves spacing, type, and B.C. Design System fidelity as a visual review. There is no screenshot baseline.

| Check | Expected outcome |
| --- | --- |
| Primary navigation | Home, then About, then the other primary links. Help content is present. |
| Status | Status is shown as text. |
| Dialog | Opening a dialog moves focus inside. Closing it restores focus. |
| B.C. Design System fidelity | Header, buttons, and menus match the B.C. Design System treatment the workbook cites for that row. |
| Responsive layout | Same expected outcome as the zoom section. |
| Forced colours appearance | Same expected outcome as the forced-colours section. |

## Note for APS-5099

Paste after review. This spike does not post the comment.

```
Recommendation is in api-services-portal at e2e/sdx-catalogue-verification.md.

Functional checks stay on the existing Cypress harness against the sdx-ui image (http://sdx-ui.localtest.me:5500). Catalogue specs live in e2e/cypress/tests/27-sdx-catalogue/ and run with `npm run cy:sdx-catalogue` from e2e/, outside the default CI spec list. Proof spec: 01-brochure-home.cy.ts (public home, no login). That spec passed locally on 25 Nov 2026 against the running sdx-ui container (Cypress 13.17.0, Electron 118 headless, 1 passing).

Accessibility rules that axe can rerun are planned for APS-4971. Lighthouse stays an occasional second opinion. Keyboard, 400% zoom, forced colours, heading inspection, and a screen reader pass stay manual. The UX review workbook is the expected-result source, and APS-4971 covers it on this harness.

The full suite remains APS-4971.
```
