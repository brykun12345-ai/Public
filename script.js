(function () {
    "use strict";

    var btn = document.getElementById("startBtn");
    var countdownEl = document.getElementById("countdown");
    var running = false;

    // --- Particle background ---
    var canvas = document.getElementById("particles");
    var ctx = canvas.getContext("2d");
    var particles = [];
    var PARTICLE_COUNT = 50;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function Particle() {
        this.reset();
    }

    Particle.prototype.reset = function () {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() > 0.5 ? 340 : 260;
    };

    Particle.prototype.update = function () {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    };

    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + this.hue + ", 80%, 70%, " + this.opacity + ")";
        ctx.fill();
    };

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var j = 0; j < particles.length; j++) {
            particles[j].update();
            particles[j].draw();
        }

        for (var a = 0; a < particles.length; a++) {
            for (var b = a + 1; b < particles.length; b++) {
                var dx = particles[a].x - particles[b].x;
                var dy = particles[a].y - particles[b].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.strokeStyle = "rgba(200, 180, 255, " + (0.08 * (1 - dist / 120)) + ")";
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- Pig squeal sound (realistic & funny) ---
    function createPigSqueal() {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var duration = 2.0;
        var now = audioCtx.currentTime;
        var master = audioCtx.createGain();
        master.gain.setValueAtTime(0.45, now);
        master.connect(audioCtx.destination);

        // Squeal 1: rising high-pitched shriek
        var osc1 = audioCtx.createOscillator();
        var gain1 = audioCtx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(600, now);
        osc1.frequency.exponentialRampToValueAtTime(2200, now + 0.08);
        osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
        osc1.frequency.exponentialRampToValueAtTime(2600, now + 0.4);
        osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.6);
        osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.75);
        osc1.frequency.exponentialRampToValueAtTime(1000, now + 1.0);
        osc1.frequency.exponentialRampToValueAtTime(2800, now + 1.15);
        osc1.frequency.exponentialRampToValueAtTime(1600, now + 1.4);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 1.7);
        osc1.frequency.exponentialRampToValueAtTime(400, now + duration);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.35, now + 0.04);
        gain1.gain.setValueAtTime(0.35, now + 1.2);
        gain1.gain.linearRampToValueAtTime(0, now + duration);
        osc1.connect(gain1);
        gain1.connect(master);

        // Vibrato LFO on squeal for warbling effect
        var lfo = audioCtx.createOscillator();
        var lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(30, now);
        lfo.frequency.linearRampToValueAtTime(45, now + 0.5);
        lfo.frequency.linearRampToValueAtTime(25, now + 1.5);
        lfoGain.gain.setValueAtTime(150, now);
        lfoGain.gain.linearRampToValueAtTime(300, now + 0.5);
        lfoGain.gain.linearRampToValueAtTime(80, now + duration);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        // Squeal 2: nasal honk layer
        var osc2 = audioCtx.createOscillator();
        var gain2 = audioCtx.createGain();
        osc2.type = "square";
        osc2.frequency.setValueAtTime(900, now);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
        osc2.frequency.exponentialRampToValueAtTime(2000, now + 0.55);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.9);
        osc2.frequency.exponentialRampToValueAtTime(1500, now + 1.1);
        osc2.frequency.exponentialRampToValueAtTime(500, now + 1.6);
        osc2.frequency.exponentialRampToValueAtTime(300, now + duration);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain2.gain.setValueAtTime(0.12, now + 1.0);
        gain2.gain.linearRampToValueAtTime(0, now + duration);
        osc2.connect(gain2);
        gain2.connect(master);

        // Squeal 3: short stuttered squeaks (oink-oink effect)
        for (var s = 0; s < 4; s++) {
            var oink = audioCtx.createOscillator();
            var oinkGain = audioCtx.createGain();
            var startTime = now + 0.15 + s * 0.22;
            oink.type = "sawtooth";
            oink.frequency.setValueAtTime(1200 + s * 200, startTime);
            oink.frequency.exponentialRampToValueAtTime(2500 + s * 100, startTime + 0.04);
            oink.frequency.exponentialRampToValueAtTime(800 + s * 100, startTime + 0.12);
            oinkGain.gain.setValueAtTime(0, startTime);
            oinkGain.gain.linearRampToValueAtTime(0.15, startTime + 0.015);
            oinkGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);
            oink.connect(oinkGain);
            oinkGain.connect(master);
            oink.start(startTime);
            oink.stop(startTime + 0.15);
        }

        // Tremolo on squeal 2 for stuttering
        var trem = audioCtx.createOscillator();
        var tremGain = audioCtx.createGain();
        trem.frequency.setValueAtTime(18, now);
        trem.frequency.linearRampToValueAtTime(12, now + duration);
        tremGain.gain.setValueAtTime(0.06, now);
        trem.connect(tremGain);
        tremGain.connect(gain2.gain);

        // Breath noise with formant filter
        var bufferSize = Math.floor(audioCtx.sampleRate * duration);
        var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = noiseBuffer.getChannelData(0);
        for (var k = 0; k < bufferSize; k++) {
            data[k] = (Math.random() * 2 - 1);
        }
        var noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;

        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.06, now + 0.04);
        noiseGain.gain.setValueAtTime(0.06, now + 1.0);
        noiseGain.gain.linearRampToValueAtTime(0, now + duration);

        var filter1 = audioCtx.createBiquadFilter();
        filter1.type = "bandpass";
        filter1.frequency.setValueAtTime(1800, now);
        filter1.frequency.linearRampToValueAtTime(3000, now + 0.3);
        filter1.frequency.linearRampToValueAtTime(1500, now + duration);
        filter1.Q.value = 4;

        var filter2 = audioCtx.createBiquadFilter();
        filter2.type = "peaking";
        filter2.frequency.value = 2500;
        filter2.gain.value = 8;
        filter2.Q.value = 3;

        noise.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(noiseGain);
        noiseGain.connect(master);

        // Second ending grunt
        var grunt = audioCtx.createOscillator();
        var gruntGain = audioCtx.createGain();
        grunt.type = "sawtooth";
        grunt.frequency.setValueAtTime(200, now + 1.5);
        grunt.frequency.exponentialRampToValueAtTime(120, now + 1.9);
        gruntGain.gain.setValueAtTime(0, now + 1.5);
        gruntGain.gain.linearRampToValueAtTime(0.2, now + 1.55);
        gruntGain.gain.exponentialRampToValueAtTime(0.001, now + 1.95);
        grunt.connect(gruntGain);
        gruntGain.connect(master);

        osc1.start(now);
        osc1.stop(now + duration);
        lfo.start(now);
        lfo.stop(now + duration);
        osc2.start(now);
        osc2.stop(now + duration);
        trem.start(now);
        trem.stop(now + duration);
        noise.start(now);
        noise.stop(now + duration);
        grunt.start(now + 1.5);
        grunt.stop(now + 2.0);

        return duration;
    }

    var pigFaces = ["🐷", "🐽", "🐖", "🐷", "🐽"];
    var pigIndex = 0;

    // --- Countdown ---
    function startCountdown() {
        if (running) return;
        running = true;
        btn.disabled = true;

        var count = 5;
        countdownEl.textContent = count;
        countdownEl.classList.add("active");
        countdownEl.classList.remove("boom", "finish");

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

                var face = pigFaces[pigIndex % pigFaces.length];
                pigIndex++;
                countdownEl.textContent = face;
                countdownEl.classList.remove("active");
                countdownEl.classList.add("finish");

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
        countdownEl.classList.remove("active", "boom", "finish");
    }

    btn.addEventListener("click", startCountdown);
})();
