// Audio manager using Web Audio API

export function initAudio() {
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
audioCtx.suspend();
    let currentSource = null;
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(audioCtx.destination);

    const musicFiles = {
        abertura: 'assets/musicas/abertura.mp3',
        praia: 'assets/musicas/praia.mp3',
        synthwave: 'assets/musicas/synthwave.mp3',
        cidade: 'assets/musicas/cidade.mp3'
    };

    async function playMusic(key, loop = true) {
        if (currentSource) currentSource.stop();
        
        try {
            const response = await fetch(musicFiles[key]);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            currentSource = audioCtx.createBufferSource();
            currentSource.buffer = buffer;
            currentSource.loop = loop;
            currentSource.connect(gainNode);
            currentSource.start(0);
        } catch (e) {
            console.warn(`Music ${key} not found, silent mode.`);
        }
    }

    function pauseMusic() {
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.5);
    }

    function resumeMusic() {
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.5);
    }

    function stopMusic() {
        if (currentSource) currentSource.stop();
    }

    return {
        playMenu: () => playMusic('abertura'),
        playMap: (map) => playMusic(map),
        pause: pauseMusic,
        resume: resumeMusic,
        stop: stopMusic
    };
}
