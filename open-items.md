# Open Items — Chrome Bookmarks Sorter

## Status

| # | Item | Status |
|---|------|--------|
| 1 | Restore backup not implemented | Waiting on your approval |
| 2 | Dead sort code paths | Waiting on your approval |
| 3 | Stub service-worker features (auto-sort, `performSort`) | Waiting on your approval |
| 4 | No real icons | Open — waiting on PNG artwork |
| 5 | Unused message handlers | Accepted |

## VERIFY

None.

## WATCH

None.

## DECIDE

1. Restore backup: `BookmarkSorter.restoreBackup` checks the file is valid, then only shows "coming soon". Implement it, or remove the button?
2. Dead code: `BookmarkSorter.sortBookmarksInFolder` and `BookmarkUtils.sortBookmarks` are never called (the real sort is `BackgroundService.sortBookmarkArray`). Remove them?
3. Stubs: the `autoSortEnabled` / `defaultSortBy` settings are written by `handleFirstInstall` but never read, `handleBookmarkChange` only logs, and `performSort` returns success without sorting. Build auto-sort, or remove these?

## BLOCKED

4. Icons: `icons/` holds only `.txt` placeholders and `manifest.json` declares no icons. Needs `icon16.png`, `icon48.png`, `icon128.png`.

## ACCEPTED

5. The `getBookmarkStats`, `performSort`, `createBackup`, `getSettings` and `updateSettings` messages in `BackgroundService.handleMessage` are never sent by the popup. They're harmless.

## Git Actions Outstanding

None.
