document.addEventListener('DOMContentLoaded', function() {
    // Audio context and elements
    const audio = new Audio();
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;
    
    // Combined playlist (default + uploaded songs)
    let playlist = [
        {
            title: "Kiss Me More",
            artist: "Doja Cat ft. SZA",
            cover: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
            audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        },
        {
            title: "Good 4 U",
            artist: "Olivia Rodrigo",
            cover: "https://i.scdn.co/image/ab67616d00001e02c8b444df094279e70d0ed856",
            audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        }
    ];
    
    // DOM elements
    const playButton = document.getElementById('play');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const shuffleButton = document.getElementById('shuffle');
    const repeatButton = document.getElementById('repeat');
    const progressFill = document.querySelector('.progress-fill');
    const progressTrack = document.querySelector('.progress-track');
    const currentTimeElement = document.getElementById('current-time');
    const durationElement = document.getElementById('duration');
    const volumeControl = document.getElementById('volume');
    const nowPlayingImage = document.querySelector('.now-playing-image');
    const songName = document.querySelector('.song-name a');
    const songArtist = document.querySelector('.song-artist a');
    const likeButton = document.querySelector('.like-button');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    
    // Initialize player with first track
    function loadTrack(index) {
        const track = playlist[index];
        
        // Handle both URL and local file objects
        if (track.audio instanceof Blob) {
            audio.src = URL.createObjectURL(track.audio);
        } else {
            audio.src = track.audio;
        }
        
        nowPlayingImage.src = track.cover || 'default-cover.jpg'; // Fallback image
        songName.textContent = track.title;
        songArtist.textContent = track.artist;
        
        // Reset progress bar
        progressFill.style.width = '0%';
        currentTimeElement.textContent = '0:00';
        
        // Load metadata
        audio.addEventListener('loadedmetadata', function() {
            durationElement.textContent = formatTime(audio.duration);
        });
        
        // If player was playing, continue playing
        if (isPlaying) {
            audio.play().catch(e => console.error("Playback failed:", e));
            updatePlayButton();
        }
    }
    
    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Update play/pause button
    function updatePlayButton() {
        const icon = playButton.querySelector('i');
        if (isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    }
    
    // Play/pause toggle
    function togglePlay() {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error("Playback failed:", e));
        }
        isPlaying = !isPlaying;
        updatePlayButton();
    }
    
    // Play next track
    function nextTrack() {
        if (isShuffle) {
            currentTrackIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        loadTrack(currentTrackIndex);
    }
    
    // Play previous track
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    }
    
    // Toggle shuffle
    function toggleShuffle() {
        isShuffle = !isShuffle;
        shuffleButton.classList.toggle('active', isShuffle);
    }
    
    // Toggle repeat
    function toggleRepeat() {
        isRepeat = !isRepeat;
        repeatButton.classList.toggle('active', isRepeat);
        audio.loop = isRepeat;
    }
    
    // Update progress bar
    function updateProgress() {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${progress}%`;
            currentTimeElement.textContent = formatTime(audio.currentTime);
        }
    }
    
    // Seek in track
    function seek(e) {
        const rect = progressTrack.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    }
    
    // Set volume
    function setVolume() {
        audio.volume = volumeControl.value;
    }
    
    // Handle file uploads
    function handleFileUpload(event) {
        const files = event.target.files;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Create a URL for the file
            const fileUrl = URL.createObjectURL(file);
            
            // Extract metadata from filename (you could use a library like music-metadata-browser for more accurate metadata)
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const artist = "Unknown Artist";
            const title = fileName;
            
            // Add to playlist
            playlist.push({
                title: title,
                artist: artist,
                cover: 'default-cover.jpg', // You can use a default image or extract from file
                audio: file // Store the file object directly
            });
        }
        
        // Refresh the player if playlist was empty
        if (playlist.length === files.length) {
            loadTrack(0);
        }
        
        // Optional: Show success message
        alert(`Added ${files.length} song(s) to your library`);
    }
    
    // Event listeners
    playButton.addEventListener('click', togglePlay);
    prevButton.addEventListener('click', prevTrack);
    nextButton.addEventListener('click', nextTrack);
    shuffleButton.addEventListener('click', toggleShuffle);
    repeatButton.addEventListener('click', toggleRepeat);
    progressTrack.addEventListener('click', seek);
    volumeControl.addEventListener('input', setVolume);
    likeButton.addEventListener('click', function() {
        this.classList.toggle('liked');
    });
    
    // File upload listeners
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileUpload);
    
    // Audio event listeners
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', function() {
        if (!isRepeat) {
            nextTrack();
        }
    });
    
    // Initialize with first track if available
    if (playlist.length > 0) {
        loadTrack(0);
    }
    
    // Make cards playable
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.addEventListener('click', function() {
            // In a real app, you would match the card to a track in your playlist
            currentTrackIndex = index % playlist.length; // Simple mapping for demo
            loadTrack(currentTrackIndex);
            if (!isPlaying) {
                togglePlay();
            }
        });
    });
});