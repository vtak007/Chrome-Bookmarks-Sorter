# Chrome Bookmarks Sorter

A powerful Chrome extension to sort and organize your bookmarks by name, URL, date added, or custom categories. Take control of your bookmark chaos with intelligent sorting, duplicate removal, and advanced organization features.

## 🌟 Features

### Core Sorting Features
- **Smart Sorting**: Sort bookmarks by title (A-Z/Z-A), URL, or date added
- **Flexible Scope**: Sort all bookmarks or target specific folders
- **Batch Processing**: Handle large bookmark collections efficiently with progress tracking
- **Preserve Structure**: Maintains folder hierarchy while sorting bookmark contents

### Advanced Organization Tools
- **Duplicate Detection & Removal**: Automatically finds and removes duplicate bookmarks based on URL
- **Domain-Based Organization**: Groups bookmarks by website domain into organized folders
- **Empty Folder Cleanup**: Removes empty bookmark folders to maintain a clean structure
- **Intelligent Folder Handling**: Preserves folders while sorting only the bookmarks within them

### Backup & Data Management
- **Bookmark Backup**: Create timestamped JSON backups of your entire bookmark collection
- **Backup Validation**: Ensures backup integrity with built-in validation
- **Metadata Preservation**: Includes creation dates, folder structures, and statistics in backups
- **Future Restore Support**: Framework ready for backup restoration feature

### User Experience
- **Real-time Statistics**: Live counts of bookmarks, folders, and duplicates
- **Progress Tracking**: Visual progress bars and status updates during operations
- **Audio Feedback**: Success beep notifications for completed operations
- **Modern UI**: Clean, responsive interface with gradient styling and animations

## 🚀 Installation

### Method 1: Developer Installation (Recommended)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `chrome-bookmarks-sorter` folder
5. The extension will appear in your toolbar

### Method 2: Package Installation
1. In `chrome://extensions/`, click "Pack extension"
2. Select the extension folder to create a `.crx` file
3. Drag the `.crx` file to the extensions page to install

## 📚 How to Use

### Basic Bookmark Sorting
1. **Open the Extension**: Click the bookmarks sorter icon in your Chrome toolbar
2. **Select Target**: Choose from:
   - **All Bookmarks**: Sort every folder containing bookmarks
   - **Specific Folder**: Target individual folders from the dropdown
3. **Choose Sort Method**:
   - **By Name (A-Z)**: Alphabetical order
   - **By Name (Z-A)**: Reverse alphabetical order
   - **By URL (A-Z)**: Sort by website address
   - **By Date Added (Newest)**: Most recent first
   - **By Date Added (Oldest)**: Oldest first
4. **Execute**: Click "Sort Selected Folder" and watch the progress

### Quick Action Tools

#### Remove Duplicates
- Scans all bookmarks for identical URLs
- Keeps the first occurrence of each bookmark
- Provides detailed feedback on removal count
- Preserves bookmark metadata and folder placement

#### Organize by Domain
- Automatically groups bookmarks by website domain
- Creates folders named after each domain (e.g., "github.com", "stackoverflow.com")
- Only creates folders for domains with multiple bookmarks
- Places new folders in "Other Bookmarks" section

#### Clean Empty Folders
- Recursively scans for empty bookmark folders
- Safely removes folders that contain no bookmarks or useful content
- Preserves important system folders
- Provides count of cleaned folders

### Backup Operations

#### Create Backup
- Generates a complete JSON backup of your bookmark tree
- Includes metadata: timestamps, statistics, and version info
- Downloads automatically with date-stamped filename
- Stores local copy for extension recovery features

#### View Statistics
- **Total Bookmarks**: Count across all folders
- **Folder Count**: Number of bookmark folders
- **Duplicate Detection**: Real-time duplicate count
- **Auto-refresh**: Updates after each operation

## 🔧 Technical Features

### Performance Optimizations
- **Async Processing**: Non-blocking operations that don't freeze the browser
- **Batch Operations**: Handles large bookmark collections (1000+ bookmarks)
- **Memory Management**: Efficient processing with minimal memory footprint
- **Error Recovery**: Robust error handling with graceful fallbacks

### Chrome Integration
- **Native Bookmark API**: Uses Chrome's built-in bookmark management
- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**: Background processing for optimal performance
- **Permission Security**: Minimal required permissions (bookmarks, storage)

### Architecture
```
chrome-bookmarks-sorter/
├── manifest.json          # Extension configuration & permissions
├── popup.html             # Main user interface
├── popup.css              # Styling and animations
├── popup.js               # Core functionality and UI logic
├── background.js          # Service worker for background tasks
├── utils.js               # Utility functions and helpers
├── icons/                 # Extension icons (16px, 48px, 128px)
├── Installation.md        # Detailed installation guide
├── TEST_GUIDE.md          # Comprehensive testing procedures
└── README.md              # This documentation
```

## 🎯 Use Cases

### Personal Organization
- Sort messy bookmark collections accumulated over years
- Remove duplicate bookmarks from multiple imports
- Group work/personal bookmarks by domain
- Clean up unused folders and maintain structure

### Professional Workflow
- Organize research bookmarks by project
- Maintain clean bookmark bars for productivity
- Share organized bookmark exports with team members
- Create regular backups before major reorganization

### Browser Maintenance
- Prepare bookmarks for browser migration
- Clean up before sync across devices
- Optimize bookmark performance in Chrome
- Maintain organized structure for easier navigation

## 🛠️ Advanced Usage

### Bulk Operations
For large bookmark collections:
1. Create a backup before major operations
2. Use "All Bookmarks" sorting for comprehensive organization
3. Monitor progress bars for operation status
4. Verify results using the statistics panel

### Custom Organization Workflows
1. **Initial Cleanup**: Remove duplicates → Clean empty folders
2. **Domain Organization**: Group by domain → Sort within domains
3. **Final Polish**: Sort all folders alphabetically → Create backup

### Performance Tips
- Close unnecessary tabs during large operations
- Use specific folder sorting for targeted cleanup
- Create backups before experimental operations
- Monitor Chrome's task manager for memory usage

## 🔒 Privacy & Security

### Data Handling
- **Local Processing**: All operations performed locally on your device
- **No External Servers**: No data transmitted to external services
- **Secure Storage**: Uses Chrome's secure storage APIs
- **Minimal Permissions**: Only requests necessary bookmark access

### Backup Security
- **Local Files**: Backups stored as local JSON files
- **No Cloud Storage**: No automatic cloud uploads
- **User Control**: Complete control over backup location and sharing

## 🐛 Troubleshooting

### Common Issues

**Extension Won't Load**
- Ensure Developer mode is enabled in Chrome
- Verify all files are present in the extension folder
- Check Chrome's console for error messages

**Sorting Doesn't Work**
- Confirm bookmark permissions are granted
- Try refreshing the extension in chrome://extensions/
- Check if bookmarks are synced and causing conflicts

**Statistics Show Zero**
- Reload the extension to refresh bookmark data
- Verify Chrome sync is working properly
- Ensure you have bookmarks in your browser

**Performance Issues**
- Large collections (5000+ bookmarks) may require patience
- Close other Chrome tabs during operations
- Create backups before major operations

### Error Recovery
- All operations include automatic error handling
- Interrupted operations won't corrupt bookmark data
- Extension state resets on popup close/reopen
- Background service worker handles recovery scenarios

## 📈 Future Development

### Planned Features
- **Backup Restoration**: Full restore capability from JSON backups
- **Custom Sort Rules**: User-defined sorting criteria
- **Tag-Based Organization**: Bookmark tagging and filtering
- **Import/Export**: Support for other browser formats
- **Bookmark Health**: Dead link detection and cleanup
- **Folder Templates**: Predefined organization structures

### Technical Roadmap
- Enhanced context menu integration
- Keyboard shortcuts for power users
- Bookmark search and filtering
- Automated organization rules
- Cross-browser compatibility

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**: Create your own copy for development
2. **Set Up Development**: Load the extension in developer mode
3. **Make Changes**: Modify source files and test thoroughly
4. **Test Extensively**: Use the TEST_GUIDE.md for verification
5. **Submit Changes**: Create detailed pull requests

### Development Guidelines
- Follow existing code style and patterns
- Add comprehensive error handling
- Test with various bookmark collections
- Update documentation for new features
- Ensure backward compatibility

## 📄 License

This Chrome extension is provided as open-source software for educational and personal use. Feel free to modify, distribute, and improve according to your needs.

## 🙏 Acknowledgments

- Built using Chrome's native Bookmark API
- Inspired by the need for better bookmark management
- Thanks to the Chrome extension developer community
- Special appreciation for user feedback and testing

---

**Ready to organize your bookmarks?** Install the extension and transform your cluttered bookmark collection into a well-organized, easily navigable resource!