/**
 * Chrome Bookmarks Sorter - Main popup script
 */

class BookmarkSorter {
    constructor() {
        this.bookmarkTree = [];
        this.folders = [];
        this.init();
    }

    /**
     * Initialize the extension
     */
    async init() {
        await this.loadBookmarks();
        this.populateFolderSelect();
        this.updateStatistics();
        this.bindEvents();
    }

    /**
     * Load bookmarks from background script
     */
    async loadBookmarks() {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'getBookmarkTree' });
            if (response.success) {
                this.bookmarkTree = response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            BookmarkUtils.showStatus('Error loading bookmarks', 'error');
        }
    }

    /**
     * Populate folder dropdown with bookmark folders
     */
    populateFolderSelect() {
        const folderSelect = document.getElementById('folderSelect');
        folderSelect.innerHTML = '<option value="">Select a folder...</option>';
        
        // Add "All Bookmarks" option
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '📚 All Bookmarks (Sort Every Folder)';
        folderSelect.appendChild(allOption);
        
        // Add separator
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '─────────────────────';
        folderSelect.appendChild(separator);
        
        this.folders = [];
        this.collectFolders(this.bookmarkTree);
        
        this.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.path;
            folderSelect.appendChild(option);
        });
    }

    /**
     * Recursively collect all folders from bookmark tree
     */
    collectFolders(nodes, path = '') {
        nodes.forEach(node => {
            if (node.children) {
                const currentPath = path ? `${path} > ${node.title}` : node.title;
                
                // Skip root nodes (they don't have meaningful titles)
                if (node.title && node.id !== '0') {
                    this.folders.push({
                        id: node.id,
                        title: node.title,
                        path: currentPath
                    });
                }
                
                this.collectFolders(node.children, currentPath);
            }
        });
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = BookmarkUtils.getBookmarkStats(this.bookmarkTree);
        const allBookmarks = this.getAllBookmarks();
        const duplicates = BookmarkUtils.findDuplicates(allBookmarks);

        document.getElementById('totalBookmarks').textContent = stats.totalBookmarks;
        document.getElementById('totalFolders').textContent = stats.totalFolders;
        document.getElementById('duplicateCount').textContent = duplicates.length;
    }

    /**
     * Get all bookmarks from the tree
     */
    getAllBookmarks() {
        const bookmarks = [];
        this.bookmarkTree.forEach(root => {
            bookmarks.push(...BookmarkUtils.getAllBookmarksFromFolder(root));
        });
        return bookmarks;
    }

    /**
     * Get bookmarks from specific scope
     */
    getBookmarksByScope(scope) {
        if (scope === 'all') {
            return this.getAllBookmarks();
        }

        // Find the specific folder
        let targetFolder = null;
        
        const findFolder = (nodes) => {
            for (const node of nodes) {
                if (node.children) {
                    switch (scope) {
                        case 'bookmarks-bar':
                            if (node.id === '1') { // Bookmarks bar ID
                                targetFolder = node;
                                return;
                            }
                            break;
                        case 'other-bookmarks':
                            if (node.id === '2') { // Other bookmarks ID
                                targetFolder = node;
                                return;
                            }
                            break;
                        case 'mobile-bookmarks':
                            if (node.id === '3') { // Mobile bookmarks ID
                                targetFolder = node;
                                return;
                            }
                            break;
                    }
                    if (node.children) {
                        findFolder(node.children);
                    }
                }
            }
        };

        findFolder(this.bookmarkTree);
        return targetFolder ? BookmarkUtils.getAllBookmarksFromFolder(targetFolder) : [];
    }

    /**
     * Sort bookmarks in a specific folder
     */
    async sortBookmarksInFolder(folderId, bookmarks) {
        BookmarkUtils.updateProgress(10, 'Sorting bookmarks...');
        
        try {
            // Get existing children to preserve folders
            const folder = await chrome.bookmarks.get(folderId);
            const children = await chrome.bookmarks.getChildren(folderId);
            
            const folders = children.filter(child => !child.url);
            const existingBookmarks = children.filter(child => child.url);
            
            BookmarkUtils.updateProgress(30, 'Removing existing bookmarks...');
            
            // Remove existing bookmarks
            for (const bookmark of existingBookmarks) {
                await chrome.bookmarks.remove(bookmark.id);
            }
            
            BookmarkUtils.updateProgress(60, 'Adding sorted bookmarks...');
            
            // Add sorted bookmarks back
            for (let i = 0; i < bookmarks.length; i++) {
                await chrome.bookmarks.create({
                    parentId: folderId,
                    title: bookmarks[i].title,
                    url: bookmarks[i].url,
                    index: folders.length + i // Place after folders
                });
                
                // Update progress
                const progress = 60 + (40 * (i + 1) / bookmarks.length);
                BookmarkUtils.updateProgress(progress, `Adding bookmark ${i + 1} of ${bookmarks.length}...`);
            }
            
            BookmarkUtils.updateProgress(100, 'Sorting complete!');
            
        } catch (error) {
            console.error('Error sorting bookmarks:', error);
            BookmarkUtils.showStatus('Error sorting bookmarks', 'error');
        }
    }

    /**
     * Sort bookmarks in selected folder or all folders
     */
    async sortBookmarks() {
        const folderId = document.getElementById('folderSelect').value;
        const sortCriteria = document.getElementById('sortCriteria').value;

        if (!folderId) {
            BookmarkUtils.showStatus('Please select a folder to sort', 'error');
            return;
        }

        // Parse criteria and direction
        const isReverse = sortCriteria.includes('-desc');
        const criteria = isReverse ? sortCriteria.replace('-desc', '') : sortCriteria;

        if (folderId === 'all') {
            // Sort all bookmarks
            await this.sortAllBookmarks(criteria, isReverse);
        } else {
            // Sort specific folder
            BookmarkUtils.showStatus('Sorting folder...', 'info');
            BookmarkUtils.updateProgress(0, 'Starting sort...');

            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'sortFolder',
                    data: { folderId, criteria, reverse: isReverse }
                });

                if (response.success) {
                    BookmarkUtils.updateProgress(100, 'Sort complete!');
                    await this.loadBookmarks();
                    this.updateStatistics();
                    BookmarkUtils.showSortComplete(
                        `✓ Folder sorted successfully! ${response.data.count} bookmarks organized`,
                        response.data.count,
                        'Folder sort'
                    );
                } else {
                    throw new Error(response.error);
                }

            } catch (error) {
                console.error('Error during sorting:', error);
                BookmarkUtils.showStatus('Error sorting bookmarks', 'error');
            }
        }
    }

    /**
     * Sort all bookmark folders
     */
    async sortAllBookmarks(criteria, reverse) {
        BookmarkUtils.showStatus('Sorting all bookmarks...', 'info');
        BookmarkUtils.updateProgress(0, 'Finding folders to sort...');

        try {
            // Get all folders that contain bookmarks (including root folders)
            const allFolders = [];
            
            // Add main bookmark folders (Bookmarks bar, Other bookmarks, Mobile bookmarks)
            this.bookmarkTree.forEach(root => {
                if (root.children) {
                    root.children.forEach(folder => {
                        if (folder.children && this.folderHasDirectBookmarks(folder)) {
                            allFolders.push({ id: folder.id, title: folder.title });
                        }
                        // Also add all subfolders that have bookmarks
                        this.collectFoldersWithBookmarks(folder, allFolders);
                    });
                }
            });

            if (allFolders.length === 0) {
                BookmarkUtils.showStatus('No folders with bookmarks found', 'info');
                BookmarkUtils.updateProgress(100, 'Complete!');
                return;
            }

            let totalSorted = 0;
            let processed = 0;

            for (const folder of allFolders) {
                BookmarkUtils.updateProgress(
                    (processed / allFolders.length) * 90, 
                    `Sorting ${folder.title} (${processed + 1}/${allFolders.length})...`
                );

                try {
                    const response = await chrome.runtime.sendMessage({
                        type: 'sortFolder',
                        data: { folderId: folder.id, criteria, reverse }
                    });

                    if (response.success) {
                        totalSorted += response.data.count;
                    }
                } catch (error) {
                    console.warn(`Failed to sort folder ${folder.title}:`, error);
                }

                processed++;
            }

            BookmarkUtils.updateProgress(100, 'All folders sorted!');
            await this.loadBookmarks();
            this.updateStatistics();
            BookmarkUtils.showSortComplete(
                `🎉 All bookmarks sorted! ${totalSorted} bookmarks organized across ${processed} folders`,
                totalSorted,
                'Complete sort'
            );

        } catch (error) {
            console.error('Error during bulk sorting:', error);
            BookmarkUtils.showStatus('Error sorting all bookmarks', 'error');
        }
    }

    /**
     * Check if a folder has direct bookmarks (not counting subfolders)
     */
    folderHasDirectBookmarks(folder) {
        return folder.children && folder.children.some(child => child.url);
    }

    /**
     * Recursively collect folders that have bookmarks
     */
    collectFoldersWithBookmarks(node, folderList) {
        if (node.children) {
            node.children.forEach(child => {
                if (child.children) {
                    // It's a folder
                    if (this.folderHasDirectBookmarks(child)) {
                        folderList.push({ id: child.id, title: child.title });
                    }
                    // Recursively check subfolders
                    this.collectFoldersWithBookmarks(child, folderList);
                }
            });
        }
    }

    /**
     * Check if a folder contains bookmarks
     */
    folderHasBookmarks(folderId) {
        const findFolder = (nodes) => {
            for (const node of nodes) {
                if (node.id === folderId) {
                    return node.children && node.children.some(child => child.url);
                }
                if (node.children) {
                    const result = findFolder(node.children);
                    if (result !== undefined) return result;
                }
            }
            return false;
        };

        return findFolder(this.bookmarkTree);
    }

    /**
     * Get folder ID by scope
     */
    getFolderIdByScope(scope) {
        switch (scope) {
            case 'bookmarks-bar': return '1';
            case 'other-bookmarks': return '2';
            case 'mobile-bookmarks': return '3';
            default: return null;
        }
    }


    /**
     * Remove duplicate bookmarks
     */
    async removeDuplicates() {
        BookmarkUtils.showStatus('Finding duplicates...', 'info');
        
        try {
            const bookmarks = this.getAllBookmarks();
            const duplicates = BookmarkUtils.findDuplicates(bookmarks);
            
            if (duplicates.length === 0) {
                BookmarkUtils.showStatus('No duplicates found!', 'success');
                return;
            }

            BookmarkUtils.updateProgress(10, 'Removing duplicates...');
            let removed = 0;
            let processed = 0;

            for (const duplicateGroup of duplicates) {
                // Keep the first bookmark, remove the rest
                const toRemove = duplicateGroup.bookmarks.slice(1);
                
                for (const bookmark of toRemove) {
                    try {
                        await chrome.bookmarks.remove(bookmark.id);
                        removed++;
                    } catch (error) {
                        console.error('Error removing bookmark:', error);
                    }
                }
                
                processed++;
                const progress = 10 + (90 * processed / duplicates.length);
                BookmarkUtils.updateProgress(progress, `Processing ${processed}/${duplicates.length} duplicate groups...`);
            }

            BookmarkUtils.updateProgress(100, 'Complete!');
            await this.loadBookmarks();
            this.updateStatistics();
            BookmarkUtils.showSortComplete(
                `🧹 Duplicates removed! ${removed} duplicate bookmarks cleaned up`,
                removed,
                'Duplicate removal'
            );

        } catch (error) {
            console.error('Error removing duplicates:', error);
            BookmarkUtils.showStatus('Error removing duplicates', 'error');
        }
    }

    /**
     * Organize bookmarks by domain
     */
    async organizeByDomain() {
        BookmarkUtils.showStatus('Organizing by domain...', 'info');
        
        try {
            const bookmarks = this.getAllBookmarks();
            const domainGroups = BookmarkUtils.groupByDomain(bookmarks);
            
            // Create folders for each domain in "Other bookmarks"
            const otherBookmarksId = '2';
            
            BookmarkUtils.updateProgress(10, 'Creating domain folders...');
            
            let processed = 0;
            const totalDomains = Object.keys(domainGroups).length;
            
            for (const [domain, domainBookmarks] of Object.entries(domainGroups)) {
                if (domainBookmarks.length > 1) { // Only create folder if multiple bookmarks
                    // Create domain folder
                    const folder = await chrome.bookmarks.create({
                        parentId: otherBookmarksId,
                        title: domain
                    });
                    
                    // Move bookmarks to domain folder
                    for (const bookmark of domainBookmarks) {
                        try {
                            await chrome.bookmarks.move(bookmark.id, { parentId: folder.id });
                        } catch (error) {
                            // Bookmark might have been moved/deleted already
                            console.warn('Could not move bookmark:', bookmark.title);
                        }
                    }
                }
                
                processed++;
                const progress = 10 + (90 * processed / totalDomains);
                BookmarkUtils.updateProgress(progress, `Processing ${processed}/${totalDomains} domains...`);
            }

            BookmarkUtils.updateProgress(100, 'Organization complete!');
            await this.loadBookmarks();
            this.updateStatistics();
            BookmarkUtils.showSortComplete(
                `📁 Domain organization complete! Bookmarks grouped by website`,
                0,
                'Domain organization'
            );

        } catch (error) {
            console.error('Error organizing by domain:', error);
            BookmarkUtils.showStatus('Error organizing bookmarks', 'error');
        }
    }

    /**
     * Remove empty folders
     */
    async cleanupEmptyFolders() {
        BookmarkUtils.showStatus('Finding empty folders...', 'info');
        
        try {
            const emptyFolders = BookmarkUtils.findEmptyFolders(this.bookmarkTree);
            
            if (emptyFolders.length === 0) {
                BookmarkUtils.showStatus('No empty folders found!', 'success');
                return;
            }

            BookmarkUtils.updateProgress(10, 'Removing empty folders...');
            
            for (let i = 0; i < emptyFolders.length; i++) {
                try {
                    await chrome.bookmarks.remove(emptyFolders[i]);
                } catch (error) {
                    // Folder might have been removed already
                    console.warn('Could not remove folder:', emptyFolders[i]);
                }
                
                const progress = 10 + (90 * (i + 1) / emptyFolders.length);
                BookmarkUtils.updateProgress(progress, `Removing ${i + 1}/${emptyFolders.length} empty folders...`);
            }

            BookmarkUtils.updateProgress(100, 'Cleanup complete!');
            await this.loadBookmarks();
            this.updateStatistics();
            BookmarkUtils.showSortComplete(
                `🗂️ Cleanup complete! ${emptyFolders.length} empty folders removed`,
                emptyFolders.length,
                'Folder cleanup'
            );

        } catch (error) {
            console.error('Error cleaning up folders:', error);
            BookmarkUtils.showStatus('Error cleaning up folders', 'error');
        }
    }

    /**
     * Create bookmark backup
     */
    async createBackup() {
        try {
            const backup = BookmarkUtils.createBackup(this.bookmarkTree);
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookmarks-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            BookmarkUtils.showStatus('Backup created and downloaded!', 'success');
            
        } catch (error) {
            console.error('Error creating backup:', error);
            BookmarkUtils.showStatus('Error creating backup', 'error');
        }
    }

    /**
     * Restore bookmark backup
     */
    async restoreBackup(file) {
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            
            if (!BookmarkUtils.validateBackup(backup)) {
                BookmarkUtils.showStatus('Invalid backup file format', 'error');
                return;
            }
            
            BookmarkUtils.showStatus('Restoring bookmarks...', 'info');
            BookmarkUtils.updateProgress(10, 'Preparing restore...');
            
            // This is a complex operation and would require careful implementation
            // to avoid data loss. For now, we'll show a warning.
            BookmarkUtils.showStatus('Restore feature coming soon! Please use Chrome\'s built-in bookmark restore.', 'info');
            
        } catch (error) {
            console.error('Error restoring backup:', error);
            BookmarkUtils.showStatus('Error reading backup file', 'error');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Sort button
        document.getElementById('sortBtn').addEventListener('click', () => {
            this.sortBookmarks();
        });

        // Remove duplicates button
        document.getElementById('removeDuplicatesBtn').addEventListener('click', () => {
            this.removeDuplicates();
        });

        // Organize by domain button
        document.getElementById('organizeByDomainBtn').addEventListener('click', () => {
            this.organizeByDomain();
        });

        // Cleanup empty folders button
        document.getElementById('cleanupBtn').addEventListener('click', () => {
            this.cleanupEmptyFolders();
        });

        // Backup button
        document.getElementById('backupBtn').addEventListener('click', () => {
            this.createBackup();
        });

        // Restore button
        document.getElementById('restoreBtn').addEventListener('click', () => {
            document.getElementById('restoreInput').click();
        });

        // File input for restore
        document.getElementById('restoreInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.restoreBackup(file);
            }
        });
    }
}

// Initialize the extension when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new BookmarkSorter();
});