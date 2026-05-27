(() => {
  const spriteSize = 32;
  const edgePadding = 8;
  const chaseEase = 0.018;
  const maxStepPx = 1.15;
  const frameIntervalMs = 280;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!finePointer || reducedMotion) {
    return;
  }

  // Sprites from crgimenes/neko, BSD-2-Clause. See /static/neko/LICENSE.
  const assetPath = "/static/neko/";
  const walkingSprites = [
    "up",
    "upright",
    "right",
    "downright",
    "down",
    "downleft",
    "left",
    "upleft",
  ];
  const idleSprites = ["awake", "wash1", "wash2", "yawn1", "yawn2", "sleep1", "sleep2"];
  const preloadedSprites = [
    "awake",
    ...idleSprites,
    ...walkingSprites.flatMap((name) => [`${name}1`, `${name}2`]),
  ];

  preloadedSprites.forEach((name) => {
    const img = new Image();
    img.src = `${assetPath}${name}.png`;
  });

  const neko = document.createElement("img");
  neko.className = "coffee-neko";
  neko.alt = "";
  neko.setAttribute("aria-hidden", "true");
  neko.decoding = "async";
  neko.src = `${assetPath}awake.png`;
  document.body.appendChild(neko);

  const startX = Math.max(edgePadding, window.innerWidth - spriteSize - 28);
  const startY = Math.max(edgePadding, window.innerHeight - spriteSize - 28);

  const state = {
    x: startX,
    y: startY,
    targetX: startX,
    targetY: startY,
    lastFrameAt: 0,
    frame: 0,
    idleFrame: 0,
    sprite: "awake",
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const maxX = () => window.innerWidth - spriteSize - edgePadding;
  const maxY = () => window.innerHeight - spriteSize - edgePadding;

  const setSprite = (name) => {
    if (name === state.sprite) {
      return;
    }

    state.sprite = name;
    neko.src = `${assetPath}${name}.png`;
  };

  const spriteForDirection = (dx, dy) => {
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalized = (angle + 360) % 360;

    if (normalized <= 22.5 || normalized > 337.5) return "right";
    if (normalized <= 67.5) return "downright";
    if (normalized <= 112.5) return "down";
    if (normalized <= 157.5) return "downleft";
    if (normalized <= 202.5) return "left";
    if (normalized <= 247.5) return "upleft";
    if (normalized <= 292.5) return "up";
    return "upright";
  };

  const setTarget = (event) => {
    state.targetX = clamp(event.clientX - spriteSize / 2, edgePadding, maxX());
    state.targetY = clamp(event.clientY - spriteSize / 2, edgePadding, maxY());
  };

  window.addEventListener("pointermove", setTarget, { passive: true });
  window.addEventListener("resize", () => {
    state.targetX = clamp(state.targetX, edgePadding, maxX());
    state.targetY = clamp(state.targetY, edgePadding, maxY());
  });

  const tick = (now) => {
    const dx = state.targetX - state.x;
    const dy = state.targetY - state.y;
    const linearDistance = Math.hypot(dx, dy);
    const nekoDistance = Math.abs(dx) + Math.abs(dy);
    const isWalking = nekoDistance >= spriteSize;
    const step = Math.min(linearDistance * chaseEase, maxStepPx);

    if (linearDistance > 0.1 && isWalking) {
      state.x += (dx / linearDistance) * step;
      state.y += (dy / linearDistance) * step;
    }
    neko.style.setProperty("--neko-x", `${state.x}px`);
    neko.style.setProperty("--neko-y", `${state.y}px`);

    if (now - state.lastFrameAt > frameIntervalMs) {
      state.lastFrameAt = now;

      if (isWalking) {
        const direction = spriteForDirection(dx, dy);
        state.frame = 1 - state.frame;
        setSprite(`${direction}${state.frame + 1}`);
      } else {
        state.idleFrame = (state.idleFrame + 1) % idleSprites.length;
        setSprite(idleSprites[state.idleFrame]);
      }
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
})();
