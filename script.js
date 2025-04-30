// Music player logic
const audio = document.getElementById("audio");
const playButton = document.getElementById("play");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const seekBar = document.getElementById("seek");
const volumeBar = document.getElementById("volume");
const songTitle = document.getElementById("song-title");
const songMeta = document.getElementById("song-meta");
const fileInput = document.getElementById("fileInput");
const addSongButton = document.getElementById("addSong");
const playlistElement = document.getElementById("playlist");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const volumeIcon = document.getElementById("volumeIcon");

let playlist = [], songIndex = 0;

// Toggle play/pause
function togglePlay() {
  if (audio.paused) {
    audio.play();
    playButton.textContent = "⏸️";
  } else {
    audio.pause();
    playButton.textContent = "▶️";
  }
}

// Load song by index
function loadSong(index) {
  if (playlist.length > 0) {
    const song = playlist[index];
    audio.src = URL.createObjectURL(song.file);
    songTitle.textContent = song.name;
    songMeta.textContent = song.meta || "Unknown Artist - Unknown Album";
    audio.play();
    playButton.textContent = "⏸️";
  }
}

// Go to next or previous song
function changeSong(step) {
  if (playlist.length > 0) {
    songIndex = (songIndex + step + playlist.length) % playlist.length;
    loadSong(songIndex);
  }
}

// Format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Update volume icon
function updateVolumeIcon(volume) {
  volumeIcon.textContent = volume == 0 ? "🔇" : (volume <= 0.5 ? "🔉" : "🔊");
}

// Sync time and seek bar
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    seekBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalTimeEl.textContent = formatTime(audio.duration);
  }
});

// Seek functionality
seekBar.addEventListener("input", () => {
  audio.currentTime = (seekBar.value / 100) * audio.duration;
});

// Volume control
volumeBar.addEventListener("input", () => {
  audio.volume = volumeBar.value;
  updateVolumeIcon(audio.volume);
});


// Add songs to playlist with metadata
addSongButton.addEventListener("click", () => {
  Array.from(fileInput.files).forEach(file => {
    const name = file.name;
    const song = { name, file, meta: "" };

    jsmediatags.read(file, {
      onSuccess: tag => {
        const artist = tag.tags.artist || "Unknown Artist";
        const album = tag.tags.album || "Unknown Album";
        song.meta = `${artist} - ${album}`;
      },
      onError: () => {
        song.meta = "Unknown Artist - Unknown Album";
      }
    });

    playlist.push(song);

    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => {
      songIndex = playlist.findIndex(s => s.name === name);
      loadSong(songIndex);
    };
    playlistElement.appendChild(li);
  });
});

// Handle player events
playButton.addEventListener("click", togglePlay);
nextButton.addEventListener("click", () => changeSong(1));
prevButton.addEventListener("click", () => changeSong(-1));
audio.addEventListener("ended", () => changeSong(1));
