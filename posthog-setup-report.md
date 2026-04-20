<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Job Application Tracker. The integration covers both client-side and server-side event tracking, user identification on login/signup, error capture, and a reverse proxy configuration for reliable ingestion.

**Key changes made:**

- `instrumentation-client.ts` — New file. Initializes PostHog client-side using `posthog-js` via the Next.js 15.3+ instrumentation API. Enables session replay, exception capture, and automatic pageview tracking.
- `lib/posthog-server.ts` — New file. Singleton PostHog Node.js client for server-side event capture in Server Actions.
- `next.config.ts` — Added PostHog reverse proxy rewrites (`/ingest/*` → `eu.i.posthog.com`) and `skipTrailingSlashRedirect: true`.
- `.env.local` — Added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_logged_in` | User successfully logged in; triggers `posthog.identify()` | `app/login/page.tsx` |
| `user_signed_up` | User registered a new account; triggers `posthog.identify()` | `app/register/page.tsx` |
| `user_logged_out` | User signed out; triggers `posthog.reset()` | `components/SignOutButton.tsx` |
| `job_application_created` | User created a new job application entry (client) | `components/CreateJobApplicationDialog.tsx` |
| `job_application_deleted` | User deleted a job application card (client) | `components/JobApplicationCard.tsx` |
| `job_application_updated` | User edited a job application's details (client) | `components/JobApplicationCard.tsx` |
| `job_application_moved` | User moved a job application via dropdown menu (client) | `components/JobApplicationCard.tsx` |
| `job_application_dragged` | User drag-and-dropped a job application to a new column/position (client) | `components/KanbanBoard.tsx` |
| `server_job_application_created` | Server-side confirmation of job application persisted to DB | `lib/actions/createJobApplication.ts` |
| `server_job_application_deleted` | Server-side confirmation of job application deleted from DB | `lib/actions/deleteJobApplication.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/163171/dashboard/633257
- **User Signup & Login Funnel**: https://eu.posthog.com/project/163171/insights/6sk7asBF
- **Job Applications Created Over Time**: https://eu.posthog.com/project/163171/insights/7I2VWBdh
- **Job Application Activity Funnel**: https://eu.posthog.com/project/163171/insights/SNvJfzBe
- **Daily Active Users (Login Events)**: https://eu.posthog.com/project/163171/insights/jYsjT5JO
- **Application Deletions vs Creations**: https://eu.posthog.com/project/163171/insights/BNr6k1RK

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
