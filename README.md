# 🌈 My Little World | عالمي الصغير

A child-friendly, bilingual **Arabic + English** mobile game for around age 3, designed for one Samsung/Android phone. No advertisements, remote APIs, accounts, tracking, or fees.

## Four playable worlds

1. 🐮 **Animal Farm:** Find one of four animal pictures, with gentle hints after two attempts.
2. 🌈 **Color Land:** Identify colors and shapes, with pictures and gentle hints.
3. 👩‍🍳 **Little Kitchen:** Create your own plate by choosing any three foods. All combinations are welcome.
4. 🌻 **Magic Garden:** Choose a flower, water it, and give it sunshine to earn a sticker.

Every completed activity awards a sticker and/or happy stars, saved in this browser's local storage. The game does not require reading, racing, or handling failure. A speaker button repeats the instruction.

## Host it on GitHub Pages using a Samsung phone

1. Create a **new public repository** named `my-little-world` on https://github.com.
2. Open the empty repository's **Code** tab. In its **Quick setup** section, select **uploading an existing file**. On smaller screens, Chrome > `⋮` > **Desktop site** helps.
3. Extract `MyLittleWorld_v1.zip` in Samsung **My Files**. Upload the **8 files inside the folder** to the **repository root**, not the ZIP or its enclosing folder.
4. Choose **Commit changes**.
5. Open repository **Settings > Pages**, choose **Deploy from a branch**, **main**, **/(root)** and **Save**.
6. Open `https://YOUR-USERNAME.github.io/my-little-world/` once the Pages deployment is complete.
7. In Chrome choose **⋮ > Install app** or **Add to Home screen**. First open online to cache app files, then test in airplane mode.

GitHub Docs: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
MDN installable PWA: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing

## Spoken instructions (important)

Spoken Arabic and English use the browser's **Web Speech API** (`speechSynthesis`) and the phone's available text-to-speech voices. Instructions play after the child touches a world or the speaker button. The app can work offline after the first online load, **but offline spoken Arabic and English depend on TTS voice packs installed and supported by the Android browser**. If a language is missing, configure Samsung/Android settings > Text-to-speech and download the relevant language voices, or try Chrome. Sound is optional and the game remains usable visually.

For child safety and comfort, encourage short, shared play sessions. There are no ads, external links in the game, timers, penalties, or in-game purchases. A parent can control languages, sound, and clear the saved stickers from the home screen's grown-up settings.

## Files

- `index.html`: app entry
- `styles.css`: responsive styles and animations
- `app.js`: games, Arabic/English prompts, local progress and sound
- `manifest.webmanifest`: install metadata
- `sw.js`: offline app shell (cache-first)
- `icon-192.png`, `icon-512.png`: app icons
- `README.md`: this guide

## Updates and data

When publishing a future version, change `CACHE_VERSION` in `sw.js` and upload all changed files. Stickers/stars are stored only in browser localStorage on this device, not synchronized between devices. Clearing browser storage or uninstalling the app may erase them. The app is deliberately self-contained and does not use a backend.
