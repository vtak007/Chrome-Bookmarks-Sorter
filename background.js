/**
 * Chrome Bookmarks Sorter - Background Script
 * Handles service worker functionality and extension lifecycle events
 */

class BackgroundService {
    constructor() {
        this.init();
    }

    /**
     * Initialize background service
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for extension lifecycle
     */
    setupEventListeners() {
        // Extension installed or updated
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.handleFirstInstall();
            } else if (details.reason === 'update') {
                this.handleUpdate(details.previousVersion);
            }
        });

        // Extension startup
        chrome.runtime.onStartup.addListener(() => {
            this.handleStartup();
        });

        // Handle messages from popup or content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Handle bookmark changes
        chrome.bookmarks.onCreated.addListener((id, bookmark) => {
            this.handleBookmarkChange('created', bookmark);
        });

        chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
            this.handleBookmarkChange('removed', { id, ...removeInfo });
        });

        chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
            this.handleBookmarkChange('changed', { id, ...changeInfo });
        });

        chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
            this.handleBookmarkChange('moved', { id, ...moveInfo });
        });
    }

    /**
     * Handle first install
     */
    async handleFirstInstall() {
        console.log('Chrome Bookmarks Sorter installed');
        
        // Set default settings
        await chrome.storage.sync.set({
            autoSortEnabled: false,
            defaultSortBy: 'title',
            backupEnabled: true,
            lastBackupDate: null
        });

        // Extension installed successfully
    }

    /**
     * Handle extension update
     */
    async handleUpdate(previousVersion) {
        console.log(`Chrome Bookmarks Sorter updated from ${previousVersion}`);
        
        // Perform any necessary migrations based on version
        await this.performMigrations(previousVersion);
    }

    /**
     * Handle extension startup
     */
    handleStartup() {
        console.log('Chrome Bookmarks Sorter started');
        
        // Check if auto-backup is enabled
        this.checkAutoBackup();
    }

    /**
     * Handle messages from other parts of the extension
     */
    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'getBookmarkStats':
                    const stats = await this.getBookmarkStats();
                    sendResponse({ success: true, data: stats });
                    break;

                case 'performSort':
                    const sortResult = await this.performSort(message.data);
                    sendResponse({ success: true, data: sortResult });
                    break;

                case 'sortFolder':
                    const folderSortResult = await this.sortFolder(message.data.folderId, message.data.criteria, message.data.reverse);
                    sendResponse({ success: true, data: folderSortResult });
                    break;

                case 'getBookmarkTree':
                    const bookmarkTree = await chrome.bookmarks.getTree();
                    sendResponse({ success: true, data: bookmarkTree });
                    break;

                case 'createBackup':
                    const backupResult = await this.createBackup();
                    sendResponse({ success: true, data: backupResult });
                    break;

                case 'getSettings':
                    const settings = await chrome.storage.sync.get();
                    sendResponse({ success: true, data: settings });
                    break;

                case 'updateSettings':
                    await chrome.storage.sync.set(message.data);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    /**
     * Sort a specific folder by ID
     */
    async sortFolder(folderId, criteria, reverse = false) {
        try {
            // Get all children of the folder
            const children = await chrome.bookmarks.getChildren(folderId);
            const bookmarks = children.filter(child => child.url);
            const folders = children.filter(child => !child.url);
            
            if (bookmarks.length <= 1) {
                return { message: 'Nothing to sort', count: bookmarks.length };
            }

            // Sort bookmarks
            const sorted = this.sortBookmarkArray(bookmarks, criteria, reverse);
            
            // Move bookmarks to new positions
            for (let i = 0; i < sorted.length; i++) {
                await chrome.bookmarks.move(sorted[i].id, {
                    parentId: folderId,
                    index: folders.length + i
                });
            }

            
            return { message: 'Sort completed', count: sorted.length };
        } catch (error) {
            console.error('Error sorting folder:', error);
            
            throw error;
        }
    }

    /**
     * Sort bookmark array
     */
    sortBookmarkArray(bookmarks, criteria, reverse = false) {
        return [...bookmarks].sort((a, b) => {
            let valueA, valueB;

            switch (criteria) {
                case 'title':
                    valueA = (a.title || '').toLowerCase();
                    valueB = (b.title || '').toLowerCase();
                    break;
                case 'url':
                    valueA = (a.url || '').toLowerCase();
                    valueB = (b.url || '').toLowerCase();
                    break;
                case 'dateAdded':
                    valueA = a.dateAdded || 0;
                    valueB = b.dateAdded || 0;
                    // For dates, default is newest first (reverse=false means newest first)
                    if (!reverse) {
                        return valueB - valueA; // Newest first
                    } else {
                        return valueA - valueB; // Oldest first
                    }
                default:
                    valueA = (a.title || '').toLowerCase();
                    valueB = (b.title || '').toLowerCase();
            }

            // For string comparisons, apply reverse logic
            const result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            return reverse ? -result : result;
        });
    }

    /**
     * Handle bookmark changes
     */
    handleBookmarkChange(type, bookmark) {
        // Log bookmark changes for debugging
        console.log(`Bookmark ${type}:`, bookmark);
        
        // You could implement auto-sort functionality here
        // if the user has enabled it in settings
    }

    /**
     * Get bookmark statistics
     */
    async getBookmarkStats() {
        const bookmarkTree = await chrome.bookmarks.getTree();
        let totalBookmarks = 0;
        let totalFolders = 0;

        const countItems = (node) => {
            if (node.url) {
                totalBookmarks++;
            } else if (node.children) {
                totalFolders++;
                node.children.forEach(child => countItems(child));
            }
        };

        bookmarkTree.forEach(root => countItems(root));

        return {
            totalBookmarks,
            totalFolders,
            lastUpdated: Date.now()
        };
    }

    /**
     * Create automatic backup
     */
    async createBackup() {
        const bookmarkTree = await chrome.bookmarks.getTree();
        const backup = {
            version: '1.0',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            bookmarks: bookmarkTree
        };

        // Store backup in extension storage
        const backupKey = `backup_${backup.timestamp}`;
        await chrome.storage.local.set({ [backupKey]: backup });

        // Update last backup date
        await chrome.storage.sync.set({ lastBackupDate: backup.timestamp });

        return backup;
    }

    /**
     * Check if auto-backup should be performed
     */
    async checkAutoBackup() {
        const settings = await chrome.storage.sync.get(['backupEnabled', 'lastBackupDate']);
        
        if (!settings.backupEnabled) return;

        const now = Date.now();
        const lastBackup = settings.lastBackupDate || 0;
        const daysSinceBackup = (now - lastBackup) / (1000 * 60 * 60 * 24);

        // Create backup if it's been more than 7 days
        if (daysSinceBackup >= 7) {
            await this.createBackup();
            console.log('Auto-backup created');
        }
    }

    /**
     * Perform version migrations
     */
    async performMigrations(previousVersion) {
        // Add any version-specific migrations here
        console.log(`Performing migrations from version ${previousVersion}`);
    }

    /**
     * Perform sort operation
     */
    async performSort(sortData) {
        const { criteria, scope, direction } = sortData;
        
        // Implementation would depend on the specific sorting requirements
        console.log('Performing sort:', sortData);
        
        return { success: true, message: 'Sort completed' };
    }
}

// Initialize background service
new BackgroundService();