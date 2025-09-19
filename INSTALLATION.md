# Chrome Bookmarks Sorter - Installation & Usage Guide

## 🚀 Installation Instructions

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `chrome-bookmarks-sorter` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Chrome Bookmarks Sorter" and click the pin icon to keep it visible

### Method 2: Package and Install (For Distribution)

1. **Package the Extension**
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select the extension folder
   - Chrome will create a `.crx` file

2. **Install the Package**
   - Drag and drop the `.crx` file onto the extensions page
   - Click "Add Extension" when prompted

## 📚 Features Overview

### Core Features

- **Smart Sorting**: Sort bookmarks by name (A-Z or Z-A), URL, or date added
- **Scope Selection**: Sort all bookmarks or specific folders (Bookmarks Bar, Other Bookmarks, Mobile Bookmarks)
- **Duplicate Removal**: Automatically find and remove duplicate bookmarks
- **Domain Organization**: Group bookmarks by website domain
- **Cleanup Tools**: Remove empty bookmark folders
- **Backup & Restore**: Create backups of your bookmarks (restore feature in development)
- **Statistics**: View bookmark counts and duplicate statistics
- **Context Menu Integration**: Right-click sorting options in bookmark manager

### User Interface

- **Modern Design**: Clean, responsive interface with gradient backgrounds
- **Progress Indicators**: Visual feedback during operations
- **Status Messages**: Clear success/error messages
- **Real-time Statistics**: Live updates of bookmark counts

## 🎯 How to Use

### Basic Sorting

1. **Click the Extension Icon** in your Chrome toolbar
2. **Select Sort Criteria**:
   - By Name (A-Z) - Alphabetical order
   - By Name (Z-A) - Reverse alphabetical order
   - By URL (A-Z) - Sort by website address
   - By URL (Z-A) - Reverse URL order
   - By Date Added (Newest) - Most recently added first
   - By Date Added (Oldest) - Oldest bookmarks first

3. **Choose Scope**:
   - All Bookmarks - Sort everything
   - Bookmarks Bar - Only the bookmarks bar
   - Other Bookmarks - Only the "Other bookmarks" folder
   - Mobile Bookmarks - Only mobile bookmarks (if synced)

4. **Click "Sort Bookmarks"** and wait for completion

### Quick Actions

#### Remove Duplicates
- Click "Remove Duplicates" to find and remove bookmark duplicates
- The tool compares URLs and keeps the first occurrence of each bookmark
- Shows how many duplicates were removed

#### Organize by Domain
- Click "Group by Domain" to automatically organize bookmarks into folders by website
- Creates folders named after each domain (e.g., "github.com", "google.com")
- Only groups domains with multiple bookmarks

#### Clean Up Empty Folders
- Click "Remove Empty Folders" to delete all empty bookmark folders
- Recursively checks for folders that contain no bookmarks
- Helps maintain a clean bookmark structure

### Backup & Restore

#### Create Backup
- Click "Create Backup" to download a JSON file with all your bookmarks
- File includes metadata like creation date and statistics
- Recommended before major reorganization operations

#### Restore Backup (Coming Soon)
- Feature in development
- For now, use Chrome's built-in bookmark restore:
  - Go to `chrome://bookmarks/`
  - Menu → Import bookmarks and settings
  - Choose your backup file

### Context Menu (Right-Click) Features

When you right-click on bookmarks in Chrome's bookmark manager:
- **Sort This Folder** - Sort the current folder by name
- **Sort by Name** - Quick alphabetical sort
- **Sort by URL** - Quick URL-based sort
- **Sort by Date** - Quick date-based sort

## ⚙️ Advanced Usage

### Statistics Panel
The statistics panel shows:
- **Total Bookmarks**: Count of all bookmarks across all folders
- **Folders**: Number of bookmark folders
- **Duplicates**: Number of duplicate bookmark groups found

### Progress Tracking
During operations, you'll see:
- Progress bar showing completion percentage
- Status text describing current operation
- Success/error messages upon completion

### Error Handling
The extension includes robust error handling:
- Network timeouts
- Permission issues
- Corrupt bookmark data
- Invalid URLs

## 🛠️ Troubleshooting

### Common Issues

**Extension doesn't load:**
- Ensure Developer mode is enabled
- Check that all files are in the correct location
- Look for errors in Chrome DevTools console

**Sorting doesn't work:**
- Verify bookmark permissions are granted
- Try refreshing the extension
- Check if bookmarks are locked/synced from another device

**Statistics show 0 bookmarks:**
- Reload the extension
- Check Chrome sync status
- Ensure you have bookmarks in your account

**Context menu doesn't appear:**
- The context menu only appears in Chrome's bookmark manager
- Go to `chrome://bookmarks/` and right-click on folders

### Performance Notes

- Large bookmark collections (1000+ bookmarks) may take longer to sort
- The extension processes bookmarks in batches for better performance
- Progress indicators help track operations on large collections

### Permissions Explained

The extension requires these permissions:
- **bookmarks**: Read and modify your bookmarks
- **storage**: Save settings and temporary data

## 🔧 Technical Details

### File Structure
```
chrome-bookmarks-sorter/
├── manifest.json          # Extension configuration
├── popup.html            # Main interface
├── popup.css             # Styling
├── popup.js              # Main functionality
├── background.js         # Background service worker
├── utils.js              # Utility functions
├── icons/                # Extension icons (add PNG files)
└── INSTALLATION.md       # This file
```

### Browser Compatibility
- Google Chrome 88+
- Microsoft Edge 88+
- Other Chromium-based browsers

### Data Privacy
- All bookmark processing happens locally on your device
- No data is sent to external servers
- Backups are stored locally or downloaded to your computer

## 📝 Development Notes

This extension was created as a Chrome Extension replacement for a Python-based bookmark sorting tool. Key technical decisions:

- **Manifest V3**: Uses the latest Chrome extension format
- **Service Worker**: Background script for context menus and notifications
- **Async/Await**: Modern JavaScript for clean asynchronous code
- **Chrome APIs**: Native bookmark manipulation using chrome.bookmarks API
- **Error Handling**: Comprehensive error handling for robust operation

## 🤝 Contributing

To modify or improve the extension:

1. Make changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test your changes thoroughly
4. Consider adding new features like:
   - Custom sorting rules
   - Bookmark tags/categories
   - Import/export from other browsers
   - Bookmark health checking

## 📄 License

This extension is provided as-is for educational and personal use. Feel free to modify and distribute according to your needs.