class AudioManager {
    constructor() {
        this.soundVolume = parseInt(localStorage.getItem('soundVolume')) || 70;
        this.musicVolume = parseInt(localStorage.getItem('musicVolume')) || 70;
        this.testSound = new Audio();
        this.testSound.src = 'src/assets/audio/test_sound.mp3';
        this.testSound.volume = this.soundVolume / 100;
        this.testSound.loop = false;
    }

    updateSoundVolume(volume) {
        this.soundVolume = volume;
        localStorage.setItem('soundVolume', volume);
        this.testSound.volume = volume / 100;
        this.playTestSound();
    }

    updateMusicVolume(volume) {
        this.musicVolume = volume;
        localStorage.setItem('musicVolume', volume);
    }

    playTestSound() {
        this.testSound.currentTime = 0;
        this.testSound.volume = this.soundVolume / 100;
        this.testSound.load();
        this.testSound.play();
    }
}

const audioManager = new AudioManager();
window.audioManager = audioManager;