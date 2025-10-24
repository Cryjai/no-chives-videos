// DOM Elements
const urlInput = document.getElementById('url-input');
const searchInput = document.getElementById('search-input');
const playlistInput = document.getElementById('playlist-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const playlistContainer = document.getElementById('playlist-container');
const videoPlayer = document.getElementById('video-player');
const loadMoreButton = document.getElementById('load-more');

let nextPageToken = '';
let currentPlaylistId = '';

// Mode Toggle
document.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        document.querySelectorAll('.input-mode').forEach(mode => {
            mode.style.display = 'none';
        });
        document.getElementById(button.dataset.mode).style.display = 'block';
    });
});

// Search Videos Function
async function handleVideoSearch(query, newSearch = true) {
    try {
        if (newSearch) {
            searchResults.innerHTML = '<div class="spinner"></div>';
            nextPageToken = '';
        }

        const data = await searchYouTubeVideos(query, newSearch ? '' : nextPageToken);
        
        if (newSearch) {
            searchResults.innerHTML = '';
        }

        nextPageToken = data.nextPageToken;
        loadMoreButton.style.display = data.nextPageToken ? 'block' : 'none';

        data.items.forEach(item => {
            const videoCard = createVideoCard(item);
            searchResults.appendChild(videoCard);
        });
    } catch (error) {
        showToast('Search failed. Please try again.', 'error');
        searchResults.innerHTML = '<div class="empty-state">Search failed. Please try again.</div>';
    }
}

// Handle Playlist Function
async function handlePlaylist(playlistId) {
    try {
        playlistContainer.innerHTML = '<div class="spinner"></div>';
        currentPlaylistId = playlistId;

        const data = await getPlaylistVideos(playlistId);
        
        const playlistHTML = `
            <div class="playlist-header">
                <h3 class="playlist-title">Playlist</h3>
                <div class="playlist-stats">${data.items.length} videos</div>
            </div>
            <div class="playlist-items">
                ${data.items.map((item, index) => createPlaylistItem(item, index)).join('')}
            </div>
        `;
        
        playlistContainer.innerHTML = playlistHTML;
        playlistContainer.style.display = 'block';

        // Add click events to playlist items
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.dataset.videoId;
                loadVideo(videoId);
                document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Load first video
        if (data.items.length > 0) {
            const firstVideoId = data.items[0].snippet.resourceId.videoId;
            loadVideo(firstVideoId);
        }
    } catch (error) {
        showToast('Failed to load playlist. Please check the playlist ID and try again.', 'error');
        playlistContainer.innerHTML = '<div class="empty-state">Failed to load playlist</div>';
    }
}

// Create Video Card
function createVideoCard(item) {
    const videoId = item.id.videoId;
    const snippet = item.snippet;
    
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `
        <div class="search-thumbnail">
            <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}">
        </div>
        <div class="search-result-info">
            <div class="search-result-title">${snippet.title}</div>
            <div class="search-result-channel">${snippet.channelTitle}</div>
            <div class="search-result-stats">
                <span>${new Date(snippet.publishTime).toLocaleDateString()}</span>
            </div>
        </div>
    `;
    
    div.addEventListener('click', () => loadVideo(videoId));
    return div;
}

// Create Playlist Item
function createPlaylistItem(item, index) {
    const videoId = item.snippet.resourceId.videoId;
    const snippet = item.snippet;
    
    return `
        <div class="playlist-item" data-video-id="${videoId}">
            <div class="playlist-item-index">${index + 1}</div>
            <div class="playlist-item-thumb">
                <img src="${snippet.thumbnails.default.url}" alt="${snippet.title}">
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${snippet.title}</div>
                <div class="playlist-item-channel">${snippet.channelTitle}</div>
            </div>
        </div>
    `;
}

// Load Video
function loadVideo(videoId) {
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
    videoPlayer.parentElement.style.display = 'block';
}

// Extract Video/Playlist ID
function extractId(url) {
    let id = '';
    
    // For video URLs
    const videoMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoMatch) return { type: 'video', id: videoMatch[1] };
    
    // For playlist URLs
    const playlistMatch = url.match(/[?&]list=([^&]+)/);
    if (playlistMatch) return { type: 'playlist', id: playlistMatch[1] };
    
    return null;
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Event Listeners
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        handleVideoSearch(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            handleVideoSearch(query);
        }
    }
});

loadMoreButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        handleVideoSearch(query, false);
    }
});

// URL Input Handler
urlInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const url = urlInput.value.trim();
        const result = extractId(url);
        
        if (result) {
            if (result.type === 'video') {
                loadVideo(result.id);
            } else if (result.type === 'playlist') {
                handlePlaylist(result.id);
            }
        } else {
            showToast('Invalid YouTube URL', 'error');
        }
    }
});

// Playlist Input Handler
playlistInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const playlistId = playlistInput.value.trim();
        if (playlistId) {
            handlePlaylist(playlistId);
        }
    }
});
