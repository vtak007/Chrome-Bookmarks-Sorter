/**
 * Utility functions for Chrome Bookmarks Sorter
 */

class BookmarkUtils {
    /**
     * Sort bookmarks based on criteria and direction
     * @param {Array} bookmarks - Array of bookmark objects
     * @param {string} criteria - Sort criteria ('title', 'url', 'dateAdded')
     * @param {boolean} descending - Sort in descending order
     * @returns {Array} Sorted bookmarks array
     */
    static sortBookmarks(bookmarks, criteria, descending = false) {
        const sorted = [...bookmarks].sort((a, b) => {
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
                    break;
                default:
                    valueA = (a.title || '').toLowerCase();
                    valueB = (b.title || '').toLowerCase();
            }

            // Handle numeric comparison for dates
            if (criteria === 'dateAdded') {
                return descending ? valueB - valueA : valueA - valueB;
            }

            // Handle string comparison
            if (valueA < valueB) return descending ? 1 : -1;
            if (valueA > valueB) return descending ? -1 : 1;
            return 0;
        });

        return sorted;
    }

    /**
     * Find duplicate bookmarks based on URL
     * @param {Array} bookmarks - Array of bookmark objects
     * @returns {Array} Array of duplicate bookmark groups
     */
    static findDuplicates(bookmarks) {
        const urlMap = new Map();
        const duplicates = [];

        // Group bookmarks by URL
        bookmarks.forEach(bookmark => {
            if (bookmark.url) {
                const url = bookmark.url.toLowerCase();
                if (!urlMap.has(url)) {
                    urlMap.set(url, []);
                }
                urlMap.get(url).push(bookmark);
            }
        });

        // Find groups with more than one bookmark
        for (const [url, group] of urlMap) {
            if (group.length > 1) {
                duplicates.push({
                    url,
                    bookmarks: group,
                    count: group.length
                });
            }
        }

        return duplicates;
    }

    /**
     * Group bookmarks by domain
     * @param {Array} bookmarks - Array of bookmark objects
     * @returns {Object} Object with domain as key and bookmarks array as value
     */
    static groupByDomain(bookmarks) {
        const domainGroups = {};

        bookmarks.forEach(bookmark => {
            if (bookmark.url) {
                try {
                    const domain = new URL(bookmark.url).hostname;
                    const cleanDomain = domain.replace(/^www\./, '');
                    
                    if (!domainGroups[cleanDomain]) {
                        domainGroups[cleanDomain] = [];
                    }
                    domainGroups[cleanDomain].push(bookmark);
                } catch (error) {
                    // Handle invalid URLs
                    if (!domainGroups['invalid-url']) {
                        domainGroups['invalid-url'] = [];
                    }
                    domainGroups['invalid-url'].push(bookmark);
                }
            }
        });

        return domainGroups;
    }

    /**
     * Get all bookmarks from a specific folder
     * @param {Object} folder - Chrome bookmark folder object
     * @returns {Array} Flattened array of all bookmarks in the folder
     */
    static getAllBookmarksFromFolder(folder) {
        const bookmarks = [];

        if (folder.children) {
            folder.children.forEach(child => {
                if (child.url) {
                    // It's a bookmark
                    bookmarks.push(child);
                } else if (child.children) {
                    // It's a folder, recursively get its bookmarks
                    bookmarks.push(...this.getAllBookmarksFromFolder(child));
                }
            });
        }

        return bookmarks;
    }

    /**
     * Get statistics about bookmarks
     * @param {Array} bookmarkTree - Chrome bookmark tree
     * @returns {Object} Statistics object
     */
    static getBookmarkStats(bookmarkTree) {
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
            totalFolders
        };
    }

    /**
     * Find empty folders in bookmark tree
     * @param {Array} bookmarkTree - Chrome bookmark tree
     * @returns {Array} Array of empty folder IDs
     */
    static findEmptyFolders(bookmarkTree) {
        const emptyFolders = [];

        const checkFolder = (node) => {
            if (node.children && node.children.length === 0) {
                // Folder is empty
                emptyFolders.push(node.id);
            } else if (node.children) {
                // Check subfolders
                let hasBookmarks = false;
                node.children.forEach(child => {
                    if (child.url) {
                        hasBookmarks = true;
                    } else if (child.children) {
                        checkFolder(child);
                        // Check if subfolder has any bookmarks
                        if (this.getAllBookmarksFromFolder(child).length > 0) {
                            hasBookmarks = true;
                        }
                    }
                });

                // If folder has no bookmarks (only empty subfolders), mark as empty
                if (!hasBookmarks) {
                    emptyFolders.push(node.id);
                }
            }
        };

        bookmarkTree.forEach(root => {
            if (root.children) {
                root.children.forEach(child => {
                    if (child.children) {
                        checkFolder(child);
                    }
                });
            }
        });

        return emptyFolders;
    }

    /**
     * Create backup of bookmarks
     * @param {Array} bookmarkTree - Chrome bookmark tree
     * @returns {Object} Backup object with metadata
     */
    static createBackup(bookmarkTree) {
        return {
            version: '1.0',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            bookmarks: bookmarkTree,
            stats: this.getBookmarkStats(bookmarkTree)
        };
    }

    /**
     * Validate bookmark backup format
     * @param {Object} backup - Backup object to validate
     * @returns {boolean} True if valid backup format
     */
    static validateBackup(backup) {
        return (
            backup &&
            backup.version &&
            backup.timestamp &&
            backup.bookmarks &&
            Array.isArray(backup.bookmarks)
        );
    }

    /**
     * Extract domain from URL
     * @param {string} url - URL to extract domain from
     * @returns {string} Domain name or 'unknown' if invalid
     */
    static extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace(/^www\./, '');
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Format date for display
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date string
     */
    static formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp).toLocaleDateString();
    }

    /**
     * Debounce function to limit rapid function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show status message to user
     * @param {string} message - Message to display
     * @param {string} type - Message type ('success', 'error', 'info')
     * @param {number} duration - Duration to show message (ms)
     */
    static showStatus(message, type = 'info', duration = 3000) {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.classList.remove('hidden');

        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, duration);
    }

    /**
     * Show sort completion with a 1-second beep
     * @param {string} message - Success message to display
     * @param {number} count - Number of items sorted
     * @param {string} operation - Type of operation completed
     */
    static showSortComplete(message, count = 0, operation = 'sort') {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) return;

        // Clear any existing classes and add sort-complete styling
        statusElement.className = 'status-message success sort-complete';
        statusElement.textContent = message;
        statusElement.classList.remove('hidden');

        // Play 1-second beep sound
        this.playCompletionBeep();

        // Auto-hide after longer duration for success messages
        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, 5000);

        // Add temporary pulse animation to any sort buttons
        this.pulseButtons();
    }

    /**
     * Play 1-second completion beep (using Web Audio API)
     */
    static playCompletionBeep() {
        try {
            // Create a 1-second beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Create a clear beep sound at 800Hz
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';

            // Set volume and fade out at the end
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.8);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1.0);
        } catch (error) {
            // Silently fail if Web Audio API is not supported
        }
    }

    /**
     * Add pulse animation to buttons temporarily
     */
    static pulseButtons() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        buttons.forEach(button => {
            button.style.animation = 'pulse 0.6s ease';
            setTimeout(() => {
                button.style.animation = '';
            }, 600);
        });
    }

    /**
     * Update progress bar
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} text - Progress text
     */
    static updateProgress(progress, text = 'Processing...') {
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressContainer && progressBar && progressText) {
            if (progress === 0) {
                progressContainer.classList.add('hidden');
            } else {
                progressContainer.classList.remove('hidden');
                progressBar.style.width = `${Math.min(progress, 100)}%`;
                progressText.textContent = text;

                if (progress >= 100) {
                    setTimeout(() => {
                        progressContainer.classList.add('hidden');
                    }, 1000);
                }
            }
        }
    }

    /**
     * Update link check progress bar
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} text - Progress text
     */
    static updateLinkProgress(progress, text = 'Checking links...') {
        const progressContainer = document.getElementById('linkCheckProgress');
        const progressBar = document.getElementById('linkProgressBar');
        const progressText = document.getElementById('linkProgressText');

        if (progressContainer && progressBar && progressText) {
            if (progress === 0) {
                progressContainer.classList.add('hidden');
            } else {
                progressContainer.classList.remove('hidden');
                progressBar.style.width = `${Math.min(progress, 100)}%`;
                progressText.textContent = text;

                if (progress >= 100) {
                    setTimeout(() => {
                        progressContainer.classList.add('hidden');
                    }, 2000);
                }
            }
        }
    }

    /**
     * Check if URL is valid HTTP/HTTPS
     * @param {string} url - URL to check
     * @returns {boolean} True if valid HTTP/HTTPS URL
     */
    static isValidHttpUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Check if a single link is dead
     * @param {string} url - URL to check
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Object>} Result object with status and error info
     */
    static async checkSingleLink(url, timeout = 5000) {
        // Skip non-HTTP URLs
        if (!this.isValidHttpUrl(url)) {
            return {
                url,
                isDead: false,
                isSkipped: true,
                error: 'Non-HTTP URL (skipped)',
                status: null
            };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'HEAD', // Use HEAD to avoid downloading content
                signal: controller.signal,
                mode: 'no-cors' // Allow cross-origin requests
            });

            clearTimeout(timeoutId);

            // In no-cors mode, response.status is always 0 for cross-origin requests
            // We'll consider the request successful if it doesn't throw
            return {
                url,
                isDead: false,
                isSkipped: false,
                error: null,
                status: response.status || 'OK (no-cors)'
            };

        } catch (error) {
            let isDead = true;
            let errorMessage = error.message;

            // Handle different types of errors
            if (error.name === 'AbortError') {
                errorMessage = 'Timeout (5s)';
            } else if (error.message.includes('Failed to fetch')) {
                // This could be CORS, network error, or dead link
                // In no-cors mode, we'll try a different approach
                try {
                    // Try with GET request as fallback
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => controller2.abort(), timeout);

                    await fetch(url, {
                        method: 'GET',
                        signal: controller2.signal,
                        mode: 'no-cors'
                    });

                    clearTimeout(timeoutId2);
                    isDead = false;
                    errorMessage = 'OK (fallback)';
                } catch (fallbackError) {
                    if (fallbackError.name === 'AbortError') {
                        errorMessage = 'Timeout (5s)';
                    } else {
                        errorMessage = 'Network error or dead link';
                    }
                }
            }

            return {
                url,
                isDead,
                isSkipped: false,
                error: errorMessage,
                status: null
            };
        }
    }

    /**
     * Check multiple links with concurrency limit
     * @param {Array} bookmarks - Array of bookmark objects
     * @param {Function} progressCallback - Callback for progress updates
     * @param {Object} cancelToken - Object with cancelled property to check for cancellation
     * @returns {Promise<Array>} Array of dead link results
     */
    static async checkDeadLinks(bookmarks, progressCallback, cancelToken = { cancelled: false }) {
        const deadLinks = [];
        const total = bookmarks.length;
        let checked = 0;
        const concurrency = 5; // Check 5 links simultaneously

        // Filter only HTTP/HTTPS bookmarks
        const httpBookmarks = bookmarks.filter(bookmark =>
            bookmark.url && this.isValidHttpUrl(bookmark.url)
        );

        const skippedCount = total - httpBookmarks.length;

        if (skippedCount > 0) {
            console.log(`Skipping ${skippedCount} non-HTTP bookmarks`);
        }

        // Process bookmarks in batches
        for (let i = 0; i < httpBookmarks.length; i += concurrency) {
            if (cancelToken.cancelled) {
                progressCallback(0, 'Cancelled');
                break;
            }

            const batch = httpBookmarks.slice(i, i + concurrency);
            const batchPromises = batch.map(bookmark =>
                this.checkSingleLink(bookmark.url, 5000).then(result => ({
                    ...result,
                    bookmark
                }))
            );

            try {
                const batchResults = await Promise.all(batchPromises);

                // Add dead links to results
                batchResults.forEach(result => {
                    if (result.isDead) {
                        deadLinks.push(result);
                    }
                });

                checked += batch.length;
                const progress = Math.round((checked / httpBookmarks.length) * 100);
                progressCallback(progress, `Checked ${checked} of ${httpBookmarks.length} links...`);

            } catch (error) {
                console.error('Batch processing error:', error);
                checked += batch.length;
            }

            // Small delay between batches to be respectful to servers
            if (i + concurrency < httpBookmarks.length && !cancelToken.cancelled) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return deadLinks;
    }

    /**
     * Generate HTML report for dead links
     * @param {Array} deadLinks - Array of dead link results
     * @param {Object} stats - Statistics object
     * @returns {string} HTML content for the report
     */
    static generateDeadLinksReport(deadLinks, stats) {
        const now = new Date();
        const timestamp = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString();

        // Group dead links by folder
        const linksByFolder = {};
        deadLinks.forEach(result => {
            const bookmark = result.bookmark;
            const folderPath = bookmark.folderPath || 'Unknown Folder';

            if (!linksByFolder[folderPath]) {
                linksByFolder[folderPath] = [];
            }
            linksByFolder[folderPath].push(result);
        });

        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dead Bookmarks Report - ${timestamp}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f8fafc; }
        .container { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 1000px; margin: 0 auto; }
        h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
        .stats { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .stat { text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #dc2626; }
        .stat-label { color: #64748b; font-size: 0.9em; }
        .folder-section { margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 8px; }
        .folder-header { background: #f8fafc; padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
        .link-item { padding: 16px; border-bottom: 1px solid #f1f5f9; }
        .link-item:last-child { border-bottom: none; }
        .link-title { font-weight: 500; color: #1e293b; margin-bottom: 6px; }
        .link-url { color: #3b82f6; text-decoration: none; font-family: monospace; }
        .link-url:hover { text-decoration: underline; }
        .error-badge { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 8px; }
        .timestamp { color: #64748b; font-size: 0.9em; margin-bottom: 20px; }
        .no-dead-links { text-align: center; color: #059669; font-size: 1.2em; padding: 40px; }
        .footer { text-align: center; color: #94a3b8; font-size: 0.9em; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 Dead Bookmarks Report</h1>
        <p class="timestamp">Generated on ${timestamp}</p>`;

        if (deadLinks.length === 0) {
            html += `
        <div class="no-dead-links">
            ✅ Great news! No dead links found in your bookmarks.
        </div>`;
        } else {
            html += `
        <div class="stats">
            <div class="stat">
                <div class="stat-number">${deadLinks.length}</div>
                <div class="stat-label">Dead Links Found</div>
            </div>
            <div class="stat">
                <div class="stat-number">${Object.keys(linksByFolder).length}</div>
                <div class="stat-label">Affected Folders</div>
            </div>
            <div class="stat">
                <div class="stat-number">${stats.totalChecked || 0}</div>
                <div class="stat-label">Total Links Checked</div>
            </div>
        </div>`;

            // Add dead links grouped by folder
            Object.entries(linksByFolder).forEach(([folderPath, links]) => {
                html += `
        <div class="folder-section">
            <div class="folder-header">📁 ${folderPath} (${links.length} dead links)</div>`;

                links.forEach(result => {
                    const bookmark = result.bookmark;
                    html += `
            <div class="link-item">
                <div class="link-title">${bookmark.title || 'Untitled Bookmark'}</div>
                <a href="${result.url}" target="_blank" class="link-url">${result.url}</a>
                <span class="error-badge">${result.error || 'Dead Link'}</span>
            </div>`;
                });

                html += `
        </div>`;
            });
        }

        html += `
        <div class="footer">
            Report generated by Chrome Bookmarks Sorter<br>
            Click on any link above to verify if it's truly dead
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Download dead links report as HTML file
     * @param {string} htmlContent - HTML content to download
     */
    static downloadDeadLinksReport(htmlContent) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dead-bookmarks-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookmarkUtils;
} else {
    window.BookmarkUtils = BookmarkUtils;
}