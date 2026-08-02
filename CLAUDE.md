# CLAUDE.md

Guidance for Claude Code when working in this project. Global rules in the user's
`~/.claude/CLAUDE.md` still apply; this file only adds project-specific detail.

## Purpose

A Manifest V3 Chrome extension that sorts and organizes bookmarks — by title,
URL, or date — with duplicate removal, domain grouping, empty-folder cleanup,
dead-link checking, and JSON backup/restore. All logic runs in the popup and a
background service worker; no build step and no third-party dependencies.

## Key Files

| File | Description |
|------|-------------|
| `manifest.json` | MV3 manifest. Declares `bookmarks` + `storage` permissions, host permissions (for dead-link checks), the popup action, and the background service worker. Entry point. |
| `popup.html` | Popup UI: folder selector, sort options, quick actions (remove duplicates, group by domain, remove empty folders), link-health checker, backup/restore, and live statistics. |
| `popup.js` | Popup controller — wires the UI to bookmark operations, drives progress bars/status messages, and orchestrates sorting, dedup, domain grouping, cleanup, dead-link checks, and backup/restore. |
| `popup.css` | Popup styling (gradient theme, animations, progress bars). |
| `utils.js` | `BookmarkUtils` — pure helper class: sorting comparators, duplicate detection, domain extraction/grouping, backup serialization/validation. Loaded before `popup.js`. |
| `background.js` | `BackgroundService` service worker — handles install/update/startup lifecycle and messages from the popup. |
| `icons/` | Extension toolbar icons. |
| `README.md` | Feature overview and usage. |
| `Installation.md` | Install instructions (unpacked / packaged). |
| `TEST_GUIDE.md` | Manual test guide. |

## Notes

- No build/test tooling — it's plain JS loaded directly by Chrome. Test by
  loading unpacked at `chrome://extensions/` (Developer mode → Load unpacked).
- MV3: background is a service worker, so it can be terminated at any time; keep
  state in `chrome.storage`, not in service-worker globals.
