(function () {
    "use strict";

    var btn = document.getElementById("startBtn");
    var countdownEl = document.getElementById("countdown");
    var running = false;

    function createPigSqueal() {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var duration = 1.2;
        var now = audioCtx.currentTime;

        // Main high-pitched squeal
        var osc1 = audioCtx.createOscillator();
        var gain1 = audioCtx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(800, now);
        osc1.frequency.linearRampToValueAtTime(1800, now + 0.1);
        osc1.frequency.linearRampToValueAtTime(1200, now + 0.3);
        osc1.frequency.linearRampToValueAtTime(2000, now + 0.5);
        osc1.frequency.linearRampToValueAtTime(900, now + 0.8);
        osc1.frequency.linearRampToValueAtTime(1600, now + 1.0);
        osc1.frequency.linearRampToValueAtTime(600, now + duration);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain1.gain.setValueAtTime(0.3, now + 0.8);
        gain1.gain.linearRampToValueAtTime(0, now + duration);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);

        // Secondary wobble for "squealing" character
        var osc2 = audioCtx.createOscillator();
        var gain2 = audioCtx.createGain();
        osc2.type = "square";
        osc2.frequency.setValueAtTime(1200, now);
        osc2.frequency.linearRampToValueAtTime(2400, now + 0.15);
        osc2.frequency.linearRampToValueAtTime(1600, now + 0.4);
        osc2.frequency.linearRampToValueAtTime(2200, now + 0.6);
        osc2.frequency.linearRampToValueAtTime(1000, now + duration);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain2.gain.setValueAtTime(0.1, now + 0.7);
        gain2.gain.linearRampToValueAtTime(0, now + duration);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);

        // Noise burst for realism
        var bufferSize = audioCtx.sampleRate * duration;
        var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = noiseBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        var noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        noiseGain.gain.setValueAtTime(0.08, now + 0.6);
        noiseGain.gain.linearRampToValueAtTime(0, now + duration);

        // Bandpass filter on noise
        var filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 2000;
        filter.Q.value = 2;
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        osc1.start(now);
        osc1.stop(now + duration);
        osc2.start(now);
        osc2.stop(now + duration);
        noise.start(now);
        noise.stop(now + duration);

        return duration;
    }

    function startCountdown() {
        if (running) return;
        running = true;
        btn.disabled = true;

        var count = 5;
        countdownEl.textContent = count;
        countdownEl.classList.add("active");
        countdownEl.classList.remove("boom");

        var interval = setInterval(function () {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
                countdownEl.classList.add("boom");
                setTimeout(function () {
                    countdownEl.classList.remove("boom");
                }, 400);
            } else {
                clearInterval(interval);
                countdownEl.textContent = "🐷";
                countdownEl.classList.add("boom");

                var soundDuration = createPigSqueal();

                setTimeout(function () {
                    resetTimer();
                }, soundDuration * 1000 + 500);
            }
        }, 1000);
    }

    function resetTimer() {
        running = false;
        btn.disabled = false;
        countdownEl.textContent = "5";
        countdownEl.classList.remove("active", "boom");
    }

    btn.addEventListener("click", startCountdown);
})();
