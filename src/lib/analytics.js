/**
 * Thin wrapper around Vercel Analytics' `track()` so the rest of the app
 * doesn't have to import from `@vercel/analytics` directly.
 *
 * Tracked events (keep this list short and stable - every event is a column
 * in the dashboard, and renaming is painful):
 *
 *   trip_created        - user finished the New Trip modal
 *   stop_added          - user added a stop to a day
 *   invite_link_copied  - copied an edit/invite link from the Collaborate sheet
 *   view_link_copied    - copied a read-only share link
 *   pdf_exported        - opened the PDF preview (proxy for "exported")
 *   onboarding_complete - finished the first-run tour
 *   example_kept        - chose to keep the sample trip
 *   example_deleted     - chose to delete the sample trip
 *
 * In dev mode this just logs to the console. In production it goes to Vercel.
 * Failures are swallowed - analytics must never break the app.
 */
import { track as vercelTrack } from '@vercel/analytics'

const DEV = import.meta.env.DEV

export function track(event, props) {
  try {
    if (DEV) {
      // eslint-disable-next-line no-console
      console.log('[analytics]', event, props || '')
    }
    vercelTrack(event, props)
  } catch {
    /* never let analytics break the app */
  }
}
