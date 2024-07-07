// mp3-player.js

class MP3Player {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found.`);
        }

        this.audio = new Audio();
        this.createPlayerElements();
        this.attachEventListeners();
    }

    createPlayerElements() {
        this.container.innerHTML = `
            <div class="mp3-player">
                <div><h2>Audio:</h2></div>
                <audio id="audio-element"></audio>
                <div class="controls">
                    <button id="play-pause-btn">Play</button>
                    <div> Volume:  <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="1"></div>
                </div>
            </.div>
        `;

        this.playPauseBtn = this.container.querySelector('#play-pause-btn');
        this.volumeSlider = this.container.querySelector('#volume-slider');
    //    this.seekSlider = this.container.querySelector('#seek-slider');
 //       this.currentTimeSpan = this.container.querySelector('#current-time');
   //     this.durationSpan = this.container.querySelector('#duration');
    }

    attachEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        //this.seekSlider.addEventListener('input', (e) => this.seek(e.target.value));

        this.audio.addEventListener('timeupdate', () => this.updateTime());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.onEnded());
    }

    loadTrack(src) {
        this.audio.src = src;
        this.audio.load();
        this.audio.loop = true;
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play();
            this.playPauseBtn.textContent = 'Pause';
        } else {
            this.audio.pause();
            this.playPauseBtn.textContent = 'Play';
        }
    }

    setVolume(value) {
        this.audio.volume = value;
    }

    seek(value) {
        const time = (value / 100) * this.audio.duration;
        this.audio.currentTime = time;
    }

    updateTime() {
        const currentTime = this.formatTime(this.audio.currentTime);
    //   this.currentTimeSpan.textContent = currentTime;
   //     this.seekSlider.value = (this.audio.currentTime / this.audio.duration) * 100;
    }

    updateDuration() {
  //      const duration = this.formatTime(this.audio.duration);
   //     this.durationSpan.textContent = duration;
    }

    onEnded() {
        this.playPauseBtn.textContent = 'Play';
        this.seekSlider.value = 0;

    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

// Make the MP3Player class globally accessible
window.MP3Player = MP3Player;