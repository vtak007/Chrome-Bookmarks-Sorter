# Chrome Bookmarks Sorter - Testing Guide

## 🧪 Pre-Installation Testing

Before installing the extension, verify the file structure:

### Required Files Checklist
- ✅ `manifest.json` - Extension configuration
- ✅ `popup.html` - Main interface
- ✅ `popup.css` - Styling
- ✅ `popup.js` - Main functionality
- ✅ `background.js` - Background service worker
- ✅ `utils.js` - Utility functions
- ✅ `icons/` - Icon directory (PNG files needed)
- ✅ `INSTALLATION.md` - Installation guide

## 🔍 Installation Testing

### Step 1: Load Extension
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `chrome-bookmarks-sorter` folder
5. **Expected Result**: Extension appears in the list without errors

### Step 2: Check Permissions
1. Verify the extension shows these permissions:
   - Read and change your bookmarks
   - Store unlimited amount of client-side data
2. **Expected Result**: No permission warnings or errors

### Step 3: Test Extension Icon
1. Look for the extension icon in Chrome toolbar
2. Click the puzzle piece icon if not visible
3. Pin the extension for easier access
4. **Expected Result**: Extension icon appears (may show default icon if PNG files not added)

## 🚀 Functionality Testing

### Test 1: Basic UI Load
1. Click the extension icon
2. **Expected Result**: 
   - Popup opens with modern gradient design
   - All sections visible (Sort Options, Quick Actions, Backup & Restore, Statistics)
   - No JavaScript errors in console

### Test 2: Statistics Display
1. Open the extension popup
2. Check the Statistics section
3. **Expected Result**: 
   - Shows actual counts for Total Bookmarks, Folders, Duplicates
   - Numbers should not show "-" (indicates loading issue)

### Test 3: Sort Functionality
**Prerequisites**: Create a few test bookmarks with different names and URLs

1. Select "By Name (A-Z)" in sort criteria
2. Select "All Bookmarks" in scope
3. Click "Sort Bookmarks"
4. **Expected Result**:
   - Progress bar appears
   - Status message shows "Sorting bookmarks..."
   - Success message appears when complete
   - Bookmarks are reordered alphabetically

### Test 4: Remove Duplicates
**Prerequisites**: Create some duplicate bookmarks (same URL, different names)

1. Click "Remove Duplicates"
2. **Expected Result**:
   - Progress bar appears
   - Shows count of removed duplicates
   - Duplicate bookmarks are removed (keeps first occurrence)

### Test 5: Organize by Domain
**Prerequisites**: Have bookmarks from different domains (google.com, github.com, etc.)

1. Click "Group by Domain"
2. **Expected Result**:
   - Creates folders named after domains
   - Moves bookmarks from same domain into respective folders
   - Only creates folders for domains with multiple bookmarks

### Test 6: Clean Up Empty Folders
**Prerequisites**: Create some empty bookmark folders

1. Click "Remove Empty Folders"
2. **Expected Result**:
   - Finds and removes empty folders
   - Shows count of removed folders
   - Bookmark structure remains intact

### Test 7: Backup Creation
1. Click "Create Backup"
2. **Expected Result**:
   - Browser downloads a JSON file
   - File name format: `bookmarks-backup-YYYY-MM-DD.json`
   - File contains valid JSON with bookmark data

### Test 8: Context Menu Integration
1. Go to `chrome://bookmarks/`
2. Right-click on a bookmark folder
3. **Expected Result**:
   - Context menu shows bookmark sorting options
   - Options include "Sort This Folder", "Sort by Name", etc.

## 🐛 Error Testing

### Test Error Handling
1. **Test with no bookmarks**: Remove all bookmarks and test extension
2. **Test with invalid bookmarks**: Create bookmarks with empty titles/URLs
3. **Test interruption**: Start a long operation and close the popup
4. **Test permissions**: Temporarily revoke bookmark permission

### Expected Error Behaviors
- Graceful error messages (no crashes)
- Clear status messages explaining issues
- Extension remains functional after errors
- No data loss during interrupted operations

## 📊 Performance Testing

### Large Collection Testing
**Prerequisites**: Have 100+ bookmarks for meaningful testing

1. Test sorting with large bookmark collections
2. Monitor performance during operations
3. **Expected Results**:
   - Progress bar updates during long operations
   - No browser freezing
   - Operations complete within reasonable time (< 30 seconds for 1000 bookmarks)

### Memory Testing
1. Monitor Chrome's task manager during extension use
2. Test repeated operations
3. **Expected Results**:
   - Memory usage remains stable
   - No memory leaks after operations
   - Extension popup closes cleanly

## 🔧 Development Testing

### Console Error Checking
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Use the extension normally
4. **Expected Result**: No JavaScript errors or warnings

### Extension Inspection
1. Right-click the extension popup
2. Select "Inspect"
3. Check Console and Network tabs
4. **Expected Result**: Clean console, no failed network requests

### Background Script Testing
1. Go to `chrome://extensions/`
2. Click "Service Worker" link for the extension
3. Check console for background script activity
4. **Expected Result**: Background script loads without errors

## 📝 Test Scenarios

### Scenario 1: First-Time User
1. Install extension fresh
2. Have a messy bookmark collection
3. Try each feature systematically
4. **Goal**: User can successfully organize bookmarks without confusion

### Scenario 2: Power User
1. Have 500+ bookmarks in complex folder structure
2. Test all sorting options
3. Use backup/restore features
4. **Goal**: Extension handles large collections efficiently

### Scenario 3: Error Recovery
1. Interrupt operations mid-process
2. Test with corrupt bookmark data
3. Try operations with insufficient permissions
4. **Goal**: Extension recovers gracefully from all errors

## ✅ Acceptance Criteria

The extension passes testing if:
- [ ] Loads without errors in Chrome
- [ ] All UI elements display correctly
- [ ] Statistics show accurate bookmark counts
- [ ] Sorting works for all criteria and scopes
- [ ] Quick actions (duplicates, domain grouping, cleanup) function properly
- [ ] Backup creation works and produces valid files
- [ ] Context menu integration functions in bookmark manager
- [ ] No JavaScript errors in console
- [ ] Performance is acceptable for collections up to 1000 bookmarks
- [ ] Error messages are user-friendly and informative

## 🚨 Known Limitations

1. **Restore Feature**: Currently shows placeholder - requires manual Chrome import
2. **Icons**: Extension may show default icons until PNG files are added
3. **Sync Conflicts**: May have issues with bookmarks being synced from other devices
4. **Very Large Collections**: Performance may degrade with 5000+ bookmarks

## 🎯 Testing Environment

- **Recommended Chrome Version**: 120+ (latest stable)
- **Test Bookmark Count**: 50-200 for comprehensive testing
- **Test Data**: Mix of folders, bookmarks, duplicates, empty folders
- **Operating System**: Tested on Windows, should work on all platforms