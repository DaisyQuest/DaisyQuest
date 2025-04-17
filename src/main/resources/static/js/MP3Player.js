// mp3‑player.js
class MP3Player {
    /**
     * @param {string}  containerId  – id of an existing DOM element
     * @param {string?} initialSrc   – optional MP3 to start with
     * @param {boolean} autoplay     – start playing immediately if true
     */
    constructor(containerId, initialSrc = null, autoplay = false) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id “${containerId}” not found.`);
        }

        this.renderMarkup();
        this.cacheElements();
        this.attachEvents();

        if (initialSrc) {
            this.loadTrack(initialSrc, autoplay);
        }
    }

    /* ------------------------------------------------------------------ */
    /*                         DOM & INITIALISATION                       */
    /* ------------------------------------------------------------------ */

    renderMarkup() {
        this.container.innerHTML = `
            <div class="mp3-player">
                <h2>Audio Player</h2>
                <!-- Use a single <audio> element so UI & API stay in sync -->
                <audio id="audio-element" preload="metadata"></audio>

                <div class="time-row">
                    <span id="current-time">0:00</span>
                    <input
                        type="range"
                        id="seek-slider"
                        min="0"
                        max="100"
                        step="0.1"
                        value="0"
                    />
                    <span id="duration">0:00</span>
                </div>

                <div class="controls">
                    <button id="play-pause-btn">Play</button>
                    <label>
                        Volume
                        <input
                            type="range"
                            id="volume-slider"
                            min="0"
                            max="1"
                            step="0.01"
                            value="1"
                        />
                    </label>
                </div>
            </div>
        `;
    }

    cacheElements() {
        // <audio> element becomes the player engine
        this.audio            = this.container.querySelector('#audio-element');
        this.playPauseBtn     = this.container.querySelector('#play-pause-btn');
        this.volumeSlider     = this.container.querySelector('#volume-slider');
        this.seekSlider       = this.container.querySelector('#seek-slider');
        this.currentTimeSpan  = this.container.querySelector('#current-time');
        this.durationSpan     = this.container.querySelector('#duration');
    }

    attachEvents() {
        /* user controls */
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.volumeSlider .addEventListener('input',  e => this.setVolume(+e.target.value));
        this.seekSlider  .addEventListener('input',  e => this.seek(+e.target.value));

        /* audio element events */
        this.audio.addEventListener('timeupdate',     () => this.updateTime());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended',          () => this.onEnded());
    }

    /* ------------------------------------------------------------------ */
    /*                               API                                  */
    /* ------------------------------------------------------------------ */

    /**
     * Load a new track, optionally start playing.
     */
    loadTrack(src, autoplay = false) {
        this.audio.src = src;
        this.audio.load();
        // update UI immediately for very small files
        if (this.audio.readyState >= 1) {
            this.updateDuration();
        }
        if (autoplay) {
            // play after metadata so duration is correct
            this.audio.oncanplaythrough = () => {
                this.audio.play();
                this.playPauseBtn.textContent = 'Pause';
                this.audio.oncanplaythrough = null; // fire once
            };
        }
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

    /**
     * @param {number} sliderValue – 0‑100
     */
    seek(sliderValue) {
        if (this.audio.duration) {
            this.audio.currentTime = (sliderValue / 100) * this.audio.duration;
        }
    }

    /* ------------------------------------------------------------------ */
    /*                          UI Synchronisation                        */
    /* ------------------------------------------------------------------ */

    updateTime() {
        const { currentTime, duration } = this.audio;
        this.currentTimeSpan.textContent = this.formatTime(currentTime);
        if (duration) {
            this.seekSlider.value = (currentTime / duration) * 100;
        }
    }

    updateDuration() {
        this.durationSpan.textContent = this.formatTime(this.audio.duration);
    }

    onEnded() {
        this.playPauseBtn.textContent = 'Play';
        this.seekSlider.value = 0;
    }

    /* ------------------------------------------------------------------ */
    /*                            UTILITIES                               */
    /* ------------------------------------------------------------------ */

    formatTime(seconds = 0) {
        const mins = Math.floor(seconds / 60).toString();
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
}

/* Expose globally */
window.MP3Player = MP3Player;
