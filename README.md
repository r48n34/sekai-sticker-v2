# 🌍 Sekai Sticker V2

A Better Project Sekai sticker maker.

URL: https://sekai-sticker.vercel.app/

![https://sekai-sticker.vercel.app/](/assert/homePage.png)

## 🔍 Features

- ✅ Free Forever
- ✅ Adjustable color, stroke and spacing
- ✅ Drag Sticker and Text
- ✅ Import Local Images
- ✅ Import URL Images
- ✅ Layer support
- ✅ Better Searching
- ✅ Copy Layer
- ✅ Layer handle
- ✅ Save and copy PNG
- ✅ Export Studio (canvas / content bounds, custom background, 1×–3× scale)
- ✅ Named projects (save, load, delete, import / export as a portable JSON file)
- ✅ Starter templates
- ✅ Emoji sticker
- ✅ Responsive UI
- ✅ Night / Sky Theme
- ✅ Traditional Chinese / Chinese display friendly
- ✅ Allow to save and re-use sticker in your devices
- ✅ I18n Support (English / Japanese / Chinese and more...)

## 📝 Todo

- ✅ External image file input
- ✅ Internal (local) image file input
- ✅ Emoji sticker added
- ✅ Auto Save creations in browser level
- ⬜️ More input items

## ❤ Original Repo

Special thanks for the sources

https://github.com/TheOriginalAyaka/sekai-stickers

## 🚗 License

MIT

## 🪵 Logs

### v1.4.0

- Unlock **My Projects** and **Export Studio**: both drawers existed but nothing in the UI could
  open them. They are now reachable from the Insert / Export menus and from the mobile menu.
- Crash safety: an error boundary wraps the routed pages, so a render error shows a retry / reload
  screen instead of a blank white page.
- Saved sticker history is capped at 60 entries; the oldest one is dropped with a notice, so
  `localStorage` can no longer grow until it hits the quota.
- SEO / sharing: Open Graph and Twitter card meta, canonical URL, a generated 1200×630 share image,
  and `/packs` is included in the sitemap.
- Starter templates fixed: previews no longer break, and each character keeps its real aspect ratio
  (Emu 256×225, Kanade 209×248 instead of a stretched 275×256).
- Hardened `vercel.json`: missing `/assets/` and `/img/` files return a 404 instead of the app HTML,
  so a failed image request can no longer be cached for days and render as a permanent broken image.

### v1.3.0

- UI Layout changes
- Upgrade packages
- Fix bugs (Initial font loading issues)
- Better phone / pad view
- Add PWA

### v1.2.0

- New UI Layout changes
- Upgrade packages

### v1.1.0

- Added languages support (Chinese / English / Japanese)

### v1.0.1

- Adjust wordings and UI enhancement

### v1.0.0 (Beta)

- Allow to save, load and delete sticker in local devices
- View and export stickers
