# Release status — incomplete, no TestFlight upload

## Implemented and verified
- Existing The Cut source transformed into the DEFICIT Home / Body / Log / Assistant / Profile shell. Original training, import and journal functionality remains at `/journal`.
- Native Home dashboard and Assistant hub; tab order Home / Body / Log / Assistant / Profile. Original Home presentation host remains responsible for capture/edit/paywall flows.
- D1 write retry IDs, payload collision checks, compare-and-swap edits/deletion, retained audit revisions. Existing exact-version inbox review preserved.
- No automatic baseline seeding on new page load. Existing legacy baseline users retain their original 2350/Tuesday 2750 target policy until they explicitly choose a new target. New users get no fabricated target.
- MCP no longer uses a shared environment bearer; requests authenticate against their own API account. Summary has an explicit timezone and no 1800-calorie fallback.
- API shared-journal capability/proxy groundwork fails closed. The native migration endpoint deliberately rejects writes until an authenticated identity binding and tested cutover exist.

## Checks
- Web TypeScript check and production build passed (repeated after final changes at packaging).
- D1 CRUD, retry race dedupe, payload collision, stale update, ownership, revision and invalid-target tests passed.
- Inbox atomic batch, exact-version review, clarification, duplicate delivery, photo ownership and webhook tests passed. Event tests are mocked, not a live assistant connection.
- API build and four journal-boundary tests passed.
- MCP build and four account-token/envelope/timezone tests passed.
- Browser manual save: local QA meal 1240 kcal + explicit target 2000 = 760 remaining.
- Home no horizontal overflow at widths 320, 390, 430, 768, 1024, 1440. Mobile Assistant checked at 320.
- Native Swift compile/link passed for arm64 device in a disposable QA project excluding watch/widget embedding and Assets.xcassets. This is NOT a full app release build.

## Concrete external blockers
- Full Xcode scheme/asset compilation: Xcode 26.5 requires a compatible iOS runtime. Only iOS 18.6 / build 22G86 is installed; actool rejects it against SDK 23F73. First-launch component check finds no updates. About 5 GB disk free at inspection.
- App Store Connect release key expected at ~/.appstoreconnect/private_keys is absent, ASC_ISSUER_ID unset. Distribution certificate exists, but no upload authentication was found.
- Railway CLI is unauthenticated. API/MCP deployment not performed.

## Remaining implementation (not merely credential blockers)
- Verified account binding and idempotent migration/cutover between PostgreSQL app history and the canonical D1 service, including existing web identity continuity.
- Consumer OAuth/PKCE, delegated scopes, persistent verified connection state and revocation across external providers.
- Four-stage standalone onboarding, full Body/Log/Profile visual rebuild on native, progress photo comparison, and remaining accessibility/error-state acceptance checks.
- Built-in assistant writing through the same canonical service; web model gateway integration.
- Full signed archive, native simulator/device visual QA, upload, Apple processing and TestFlight availability.

Do not describe this branch as complete or a released TestFlight build.
