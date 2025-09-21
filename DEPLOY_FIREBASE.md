## Deploying Firestore Rules, Indexes and Cloud Functions

Prerequisites
- Install Firebase CLI: `npm install -g firebase-tools` and login: `firebase login`
- Ensure `firebase.json` exists or run `firebase init` and select Firestore + Functions
- Your project should be selected with `firebase use --add` or set `FIREBASE_PROJECT` env var
- For migrations, have a Google service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to its path

Deploy Firestore rules and indexes

1. From the repo root, verify `firestore.rules` and `firestore.indexes.json` are present.
2. Run:

```powershell
firebase deploy --only firestore:rules,firestore:indexes
```

Deploy Cloud Functions

1. Change into the `functions` directory and install dependencies:

```powershell
cd functions; npm install
```

2. Deploy functions:

```powershell
firebase deploy --only functions
```

Notes and verification
- After deploy, check the Firebase Console → Functions and Firestore → Rules & Indexes for successful deployment.
- Test `joinProject` callable via the client or `firebase functions:call`.

Migration dry-run

1. Export Supabase tables to JSON into `./exports` (files: `projects.json`, `tasks.json`, `project_members.json`, `activity_log.json`).
2. Set service account env var (PowerShell):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\service-account.json'
```

3. Run dry-run (no writes):

```powershell
node scripts/migrateSupabaseToFirestore.mjs --dir ./exports --dryRun
```

4. Inspect output for mapping issues, ID collisions, timestamp formats.

Full migration

When dry-run is clean, run without `--dryRun` to write to Firestore. Keep backups and monitor write counts.

Rollback plan

- If migration is incorrect, you can delete the newly created collections from Console or run scripts to remove documents by collection.

Supabase-first (no billing) guidance

This project supports both Supabase (default) and Firebase. If you prefer to avoid any Firebase features that require billing, continue using Supabase as the backend — no billing or emulator setup is required.

To switch back to Supabase (app default):

1. Open `src/config.js` and ensure:

```javascript
export const USE_FIREBASE = false;
```

2. Ensure your `.env.local` contains Supabase keys: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

3. Run the app normally:

```powershell
npm run dev
```

If at any point you later decide to enable Firebase features, follow the deploy steps above and be aware that creating a production Firestore DB requires billing to be enabled on the GCP project.
