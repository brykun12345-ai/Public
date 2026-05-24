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

    // --- Pig squeal sound ---
    function createPigSqueal() {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var duration = 1.2;
        var now = audioCtx.currentTime;

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

        var bufferSize = audioCtx.sampleRate * duration;
        var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = noiseBuffer.getChannelData(0);
        for (var k = 0; k < bufferSize; k++) {
            data[k] = (Math.random() * 2 - 1) * 0.15;
        }
        var noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        noiseGain.gain.setValueAtTime(0.08, now + 0.6);
        noiseGain.gain.linearRampToValueAtTime(0, now + duration);

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

    // --- Countdown ---
    function startCountdown() {
        if (running) return;
        running = true;
        btn.disabled = true;

        var count = 5;
        countdownEl.textContent = count;
        countdownEl.classList.add("active");
        countdownEl.classList.remove("boom", "finish");

        var label = document.querySelector(".countdown-label");
        if (label) label.textContent = "секунд";

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
                countdownEl.classList.remove("active");
                countdownEl.classList.add("finish");

                if (label) label.textContent = "ВИЗГ!";

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

        var label = document.querySelector(".countdown-label");
        if (label) label.textContent = "секунд";
    }

    btn.addEventListener("click", startCountdown);
})();
