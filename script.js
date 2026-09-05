// v3 — congrats overlay with confetti burst + fireworks (no auto-restart)
console.log('Puzzle script v3 loaded — congrats overlay with confetti + fireworks.');

var images = ['Unnamed.png'];

var currentIndex = 0;
var totalClicks = 0;

function randomizeImage() {
  let root = document.documentElement;
  root.style.setProperty('--image', 'url(' + images[currentIndex] + ')');
  currentIndex++;
  if (currentIndex >= images.length) {
    currentIndex = 0;
  }
  var puzzleItems = document.querySelectorAll('#puzz i');
  for (var i = 0; i < puzzleItems.length; i++) {
    puzzleItems[i].style.left = Math.random() * (window.innerWidth - 100) + 'px';
    puzzleItems[i].style.top = Math.random() * (window.innerHeight - 100) + 'px';
  }
}

randomizeImage();

// ===== Congrats overlay + confetti burst =====
function showCongrats() {
  try {
    var overlay = document.getElementById('congrats');
    var finalImage = document.getElementById('finalImage');
    var completedImage = images[(currentIndex - 1 + images.length) % images.length];
    finalImage.style.backgroundImage = 'url(' + completedImage + ')';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    launchConfetti();
    spawnSparkles(overlay);
  } catch (err) {
    console.error('showCongrats failed:', err);
  }
}

function spawnSparkles(container) {
  for (var i = 0; i < 40; i++) {
    (function () {
      var sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = (Math.random() * 2) + 's';
      container.appendChild(sparkle);
    })();
  }
}

function launchConfetti() {
  var canvas = document.getElementById('confettiCanvas');
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var colors = ['#ffd700', '#ff69b4', '#00e5ff', '#7cfc00', '#ff4500', '#ffffff', '#ff3860', '#a56bff'];

  // ---- confetti particles (burst from center) ----
  var confetti = [];
  var confettiCount = 200;
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;

  for (var i = 0; i < confettiCount; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 4 + Math.random() * 12;
    confetti.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      gravity: 0.15 + Math.random() * 0.1,
      drag: 0.985,
      life: 1
    });
  }

  // ---- fireworks (rockets that launch then explode into rings) ----
  var rockets = [];
  var fireworkParticles = [];

  function spawnRocket() {
    var startX = canvas.width * (0.15 + Math.random() * 0.7);
    rockets.push({
      x: startX,
      y: canvas.height,
      targetY: canvas.height * (0.15 + Math.random() * 0.35),
      vy: -(9 + Math.random() * 4),
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: []
    });
  }

  function explodeRocket(rocket) {
    var count = 60 + Math.floor(Math.random() * 40);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count;
      var speed = 2 + Math.random() * 4;
      fireworkParticles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: rocket.color,
        size: 2 + Math.random() * 2,
        gravity: 0.05,
        drag: 0.97,
        life: 1,
        decay: 0.012 + Math.random() * 0.01
      });
    }
  }

  // schedule a handful of rocket launches over the first couple seconds
  var rocketTimers = [];
  [0, 350, 700, 1050, 1450, 1850, 2300].forEach(function (delay) {
    rocketTimers.push(setTimeout(spawnRocket, delay));
  });

  var startTime = null;
  var duration = 4200;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // confetti
    confetti.forEach(function (p) {
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life = Math.max(0, 1 - elapsed / 3200);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });

    // rockets rising
    for (var r = rockets.length - 1; r >= 0; r--) {
      var rocket = rockets[r];
      rocket.trail.push({ x: rocket.x, y: rocket.y });
      if (rocket.trail.length > 8) rocket.trail.shift();
      rocket.y += rocket.vy;

      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = rocket.color;
      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
      ctx.fill();
      rocket.trail.forEach(function (t, idx) {
        ctx.globalAlpha = (idx / rocket.trail.length) * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      if (rocket.y <= rocket.targetY) {
        explodeRocket(rocket);
        rockets.splice(r, 1);
      }
    }

    // firework explosion particles
    for (var f = fireworkParticles.length - 1; f >= 0; f--) {
      var fp = fireworkParticles[f];
      fp.vx *= fp.drag;
      fp.vy = fp.vy * fp.drag + fp.gravity;
      fp.x += fp.vx;
      fp.y += fp.vy;
      fp.life -= fp.decay;

      if (fp.life <= 0) {
        fireworkParticles.splice(f, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, fp.life);
      ctx.fillStyle = fp.color;
      ctx.beginPath();
      ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    var stillGoing = elapsed < duration || rockets.length > 0 || fireworkParticles.length > 0;
    if (stillGoing) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(animate);

  window.addEventListener('resize', function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// mobile functionality
var puzzleItemsMobile = document.querySelectorAll('#puzz i');
puzzleItemsMobile.forEach(function (element) {
  element.addEventListener('mousedown', function () {
    totalClicks++;
    document.querySelector('#clicks').innerHTML = totalClicks;
  });
  element.addEventListener('click', function () {
    if (document.querySelector('.clicked')) {
      document.querySelector('.clicked').classList.toggle('clicked');
      element.classList.toggle('clicked');
    } else {
      element.classList.toggle('clicked');
    }
  });
});

var puzzleItemsDesktop = document.querySelectorAll('#puz i');
puzzleItemsDesktop.forEach(function (element) {
  element.addEventListener('click', function () {
    if (document.querySelector('.clicked')) {
      var clickedElement = document.querySelector('.clicked');
      if (clickedElement.classList.contains(element.classList)) {
        element.classList.add('dropped');
        clickedElement.classList.add('done');
        clickedElement.classList.toggle('clicked');

        if (document.querySelectorAll('.dropped').length == 9) {
          document.querySelector('#puz').classList.add('allDone');
          document.querySelector('#puz').style.border = 'none';
          document.querySelector('#puz').style.animation = 'allDone 1s linear forwards';

          setTimeout(function () {
            showCongrats();
          }, 1200);
        }
      }
    }
  });
});

// desktop drag and drop
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.className);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");

  if (ev.target.className == data) {
    ev.target.classList.add('dropped');
    document.querySelector('.' + data + "[draggable='true']").classList.add('done');

    if (document.querySelectorAll('.dropped').length == 9) {
      document.querySelector('#puz').classList.add('allDone');
      document.querySelector('#puz').style.border = 'none';
      document.querySelector('#puz').style.animation = 'allDone 1s linear forwards';

      setTimeout(function () {
        showCongrats();
      }, 1200);
    }
  }
      }
