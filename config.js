// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyAnL3vOigfnlsOnr1wg04OuqKTi1KgHniM';

// YouTube API Functions
async function searchYouTubeVideos(query, pageToken = '') {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}${pageToken ? '&pageToken=' + pageToken : ''}`
        );
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('YouTube search error:', error);
        throw error;
    }
}

async function getPlaylistVideos(playlistId, pageToken = '') {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}${pageToken ? '&pageToken=' + pageToken : ''}`
        );
        if (!response.ok) throw new Error('Playlist fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Playlist fetch error:', error);
        throw error;
    }
}

async function getVideoDetails(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        if (!response.ok) throw new Error('Video details fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Video details error:', error);
        throw error;
    }
}
