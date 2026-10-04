# JobHunt India – Chrome Extension

## Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository

## Features

| Feature | Supported Sites |
|---|---|
| 🎯 **Floating FAB** | Internshala, Unstop, Naukri, LinkedIn, Greenhouse, Lever, Ashby |
| ✍️ **One-click Autofill** | All above — fills name, email, phone, LinkedIn, GitHub |
| 📌 **Save to Tracker** | Any job page — scrapes title, company, URL & saves to Supabase |
| 📊 **Stats popup** | Quick view of Saved / Applied / Interviews count |
| 🔄 **Session sync** | Auto-syncs Supabase session every 10 min from the main app tab |

## How Session Sync Works

The extension reads your Supabase session from the JobHunt India tab using
`chrome.scripting.executeScript`. You must be signed in to the web app in the
same Chrome profile for features to work.

If the extension shows "Not signed in", click **Open JobHunt India**, sign in,
then click **Sync session** in the popup.

## Icon Assets

Place the following PNG files in `extension/icons/`:
- `icon16.png`  – 16×16
- `icon48.png`  – 48×48  
- `icon128.png` – 128×128

Use the saffron (#FF6B35) brand colour on dark (#0f0f1a) background.

## Packaging for Chrome Web Store

```bash
cd extension
zip -r jobhunt-extension.zip . --exclude '*.md' --exclude '.DS_Store'
```

Upload `jobhunt-extension.zip` to the Chrome Developer Dashboard.
