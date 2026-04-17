document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const blowDisplay = document.querySelector(".blow-display");
  const celebrationOverlay = document.getElementById("celebrationOverlay");
  const celebrationImage = document.getElementById("celebrationImage");
  const birthdayAudio = document.getElementById("birthdayAudio");
  const restartBtn = document.getElementById("restartBtn");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let allBlownOut = false;
  let isMusicEnabled = true;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    
    // Check if all candles are blown out
    if (activeCandles === 0 && candles.length > 0 && !allBlownOut) {
      allBlownOut = true;
      celebrateAfterBlowOut();
    }
  }

  function triggerConfetti() {
    // Create and trigger confetti
    const confettiSettings = {
      target: 'confetti-canvas',
      max: 100,
      size: 1,
      animate: true,
      props: ['circle', 'square'],
      colors: [[255, 213, 0], [46, 124, 184], [169, 3, 15], [255, 200, 0], [100, 200, 255]],
      clock: 50,
      rotate: true,
      width: window.innerWidth,
      height: window.innerHeight,
      particles: 100,
      velocity: 2,
      duration: 3000
    };

    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
  }

  function celebrateAfterBlowOut() {
    // Hide the "Blow the cake" display
    blowDisplay.classList.add("hidden");
    
    // Show celebration overlay with fade-in effect
    celebrationOverlay.classList.add("show");
    
    // Change background to bgpic.png with fade effect
    document.body.style.backgroundImage = "url('bgpic.png')";
    document.body.classList.add("fade-bg");
    
    // Play happy birthday song only if music is enabled
    if (isMusicEnabled) {
      birthdayAudio.play().catch(err => console.log("Could not play audio: " + err));
    }
    
    // Trigger confetti automatically
    triggerConfetti();
    
    // Show music toggle and restart buttons
    musicToggleBtn.style.display = "block";
    restartBtn.style.display = "block";
  }

  function initializeCandlesFixed() {
    // Clear any existing candles
    candles.forEach(candle => candle.remove());
    candles = [];
    
    // Create exactly 24 candles with random positions above the icing
    const candleCount = 24;
    const cakeWidth = 250;
    const cakeIcingTop = 2; // Top of the icing (from CSS)
    const candleHeightOffset = 5; // Position above the icing
    
    for (let i = 0; i < candleCount; i++) {
      // Random position across the cake width (above the icing)
      const left = Math.random() * (cakeWidth - 30) + 15; // 30 for candle width, centered
      const top = cakeIcingTop - candleHeightOffset + (Math.random() * 15 - 7.5); // Add slight variation
      
      const candle = document.createElement("div");
      candle.className = "candle";
      candle.style.left = left + "px";
      candle.style.top = top + "px";

      const flame = document.createElement("div");
      flame.className = "flame";
      candle.appendChild(flame);

      cake.appendChild(candle);
      candles.push(candle);
    }
    
    updateCandleCount();
  }

  // Initialize 24 candles on page load
  initializeCandlesFixed();

  // Restart button functionality
  restartBtn.addEventListener("click", function () {
    // Reset all variables and states
    allBlownOut = false;
    celebrationOverlay.classList.remove("show");
    birthdayAudio.pause();
    birthdayAudio.currentTime = 0;
    restartBtn.style.display = "none";
    musicToggleBtn.style.display = "none";
    blowDisplay.classList.remove("hidden");
    
    // Clear confetti canvas
    const confettiCanvas = document.getElementById("confetti-canvas");
    if (confettiCanvas) {
      const ctx = confettiCanvas.getContext("2d");
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    
    // Reset background to initial image
    document.body.style.backgroundImage = "url('initialbg.png')";
    document.body.classList.remove("fade-bg");
    
    // Reinitialize candles
    initializeCandlesFixed();
  });

  // Music toggle button functionality
  musicToggleBtn.addEventListener("click", function () {
    isMusicEnabled = !isMusicEnabled;
    
    if (isMusicEnabled) {
      musicToggleBtn.textContent = "🔊 Music: ON";
      birthdayAudio.play().catch(err => console.log("Could not play audio: " + err));
    } else {
      musicToggleBtn.textContent = "🔇 Music: OFF";
      birthdayAudio.pause();
    }
  });

  function isBlowing() {
    if (!analyser) return false; // Check if analyser is initialized
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 30; // Lowered threshold from 40 to 30 for better detection
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});
