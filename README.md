# POC Ops Center — standalone website

This folder is the **POC Ops Center** dashboard as its own website. It runs on two free services:
- **Firebase**, from Google. It holds the database and the sign-in.
- **GitHub Pages**. It shows the website.

The claude.ai version keeps working too. You move the data across with one backup file (step 6).

Files in this folder:
| File | What it is |
|---|---|
| `index.html` | The whole dashboard |
| `shim.js` | Connects the dashboard to Firebase sign-in and the Firebase database |
| `config.js` | **You edit this file once.** It holds your Firebase keys. |
| `firestore.rules` | Who may read and write. You paste it into Firebase. |
| `login.css` | The sign-in screen |
| `.nojekyll` | Tells GitHub Pages to serve the files exactly as they are |

---

## Step 1: Create the Firebase project (about 10 minutes)

1. Go to **https://console.firebase.google.com** and sign in with a Google account.
2. Click **Create a project**. Name it `poc-ops-center`. Turn Google Analytics off, then click **Create project**.
3. In the left menu: **Build → Authentication → Get started**.
   - On the **Sign-in method** tab, enable **Google**: choose a support email, then **Save**.
   - Enable **Email/Password**. Turn on **Email link (passwordless sign-in)**, then **Save**.
4. In the left menu: **Build → Firestore Database → Create database**.
   - Location: **northamerica-northeast1 (Montréal)**. You can't change it later.
   - Start in **production mode**, then **Create**.
5. Open the **Rules** tab. Delete everything, paste the whole contents of `firestore.rules`, then click **Publish**.
   - If the owner email ever changes, change `masum@expertmobile.ca` in the rules (in lower case).

## Step 2: Register the web app

1. Click the **gear icon** next to *Project Overview*, then **Project settings**.
2. Under **Your apps**, click the **`</>`** (Web) icon. Nickname: `poc-web`. Leave "Firebase Hosting" unticked, then click **Register app**.
3. You'll see a block called `firebaseConfig`. Keep this page open for step 3.

## Step 3: Put your keys in `config.js`

Open `config.js` in Notepad. Replace each `PASTE_…` value with the matching value from `firebaseConfig`:
`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` and `appId`. Save the file.

These keys are meant to be public: they only identify the project. What protects the data is `firestore.rules`.

## Step 4: Put the website on GitHub with GitHub Desktop

1. Open **GitHub Desktop**, then **File → New repository…**
   - Name: `poc-ops-center`
   - Local path: for example `Documents\GitHub`
   - Click **Create repository**.
2. Click **Show in Explorer**. Copy **all** the files from this folder into that folder, including `.nojekyll`.
3. Back in GitHub Desktop, type a summary such as `First version` and click **Commit to main**.
4. Click **Publish repository**.
   - Untick **"Keep this code private"**. Free GitHub Pages needs a public repository. That's safe: the code holds no data and no passwords.
   - Click **Publish repository**.
5. On **github.com**, open the repository, then **Settings → Pages**.
   - Under **Build and deployment → Source**, choose **Deploy from a branch**.
   - Branch: **main**, folder **/(root)**, then **Save**.
6. After 1–2 minutes the site is live at **`https://<your-github-username>.github.io/poc-ops-center/`**.

## Step 5: Allow the website to sign people in

In Firebase: **Authentication → Settings → Authorized domains → Add domain**. Add `<your-github-username>.github.io`.

## Step 6: Sign in and move your data across

1. Open the website and choose **Sign in with Google**, or use an email link, with **Masum@expertmobile.ca**. That email is always admin.
2. On the **claude.ai** dashboard: **Data hub → Full backup (.json)**. This downloads the backup file.
3. On the **new** website: **Data hub → Manual data upload**. Drop that `.json` file in and confirm. Companies, SIMs, history, actions, fleet maps and settings are copied across.
4. **Admin → Branding:** upload the wide logo and the circle logo again. Logos are stored per website and must be under 700 KB each.
5. **Users:** ask each colleague to open the site and sign in once. Then search for their name and give them a role.

## Updating the website later

When Claude sends a new `index.html`:
1. Replace the old file in the folder.
2. GitHub Desktop: **Commit to main**, then **Push origin**.
3. The site updates in about a minute.

**Never** replace your own `config.js` with a blank one.

## Weekly data refresh on the new website

Use either way:
- **Data hub → Manual data upload:** drop in the Inrico, Jasper, Simplex or Hologram export files.
- **The collector buttons:** paste with Ctrl+V on the new website, the same as on the claude.ai version.

Ask Claude to point the weekly scheduled task at the new address when you're ready.

## Notes

- **Free limits:** Firestore's free plan allows 50,000 document reads per day. One full dashboard load reads about 300–600 documents, so roughly 80–150 page loads a day stay free. If you go over, Firebase pauses reads until the next day unless you add billing. Billing is pay-as-you-go and costs cents at this size.
- **Privacy:** sign-in is required and the database rules refuse anyone not on the access list. The agent role hides other agents' companies in the screens, but the database itself lets every listed user read all companies.
- **Alternative to GitHub Pages: Vercel.** Vercel can host a private repository for free.
  1. Keep the repository private.
  2. Go to **vercel.com → Add New → Project**, import the repository, set Framework **Other**, then **Deploy**.
  3. Add the `…vercel.app` address to Firebase **Authorized domains**.
- **Why Firebase and not Supabase:** the dashboard already talks to its database the way Firebase Firestore works, so Firebase needed almost no changes. Supabase would mean rewriting the whole data layer.
