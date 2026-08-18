/* JARVIS v10 — Avengers tarzı hareketli HUD arka planı
   Sarı dönen halkalar, radyal ızgaralar, tarayıcı çizgiler. */

(function () {
  const canvas = document.getElementById("hud");
  const ctx = canvas.getContext("2d");
  let W, H, cx, cy, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.width = window.innerWidth * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    cx = W / 2;
    cy = H / 2;
  }
  window.addEventListener("resize", resize);
  resize();

  const COLOR = "255, 204, 0"; // JARVIS sarısı

  let t = 0;

  function drawRing(radius, segs, rot, alpha, dashed) {
    const r = Math.max(2, radius);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = "rgba(" + COLOR + "," + alpha + ")";
    ctx.lineWidth = 1.4 * dpr;
    if (dashed) ctx.setLineDash([8 * dpr, 6 * dpr]);
    else ctx.setLineDash([]);

    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2 / segs) * 0.72; // aralıklı segmentler
      ctx.beginPath();
      ctx.arc(0, 0, r, a0, a1);
      ctx.stroke();
    }

    // segment uçlarında noktalar
    ctx.fillStyle = "rgba(" + COLOR + "," + alpha + ")";
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2.2 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawTicks(radius, count, rot, alpha) {
    const r = Math.max(2, radius);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = "rgba(" + COLOR + "," + alpha + ")";
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const len = (i % 5 === 0 ? 14 : 6) * dpr;
      const x0 = Math.cos(a) * r;
      const y0 = Math.sin(a) * r;
      const x1 = Math.cos(a) * (r + len);
      const y1 = Math.sin(a) * (r + len);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRadialGrid(alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(" + COLOR + "," + alpha + ")";
    ctx.lineWidth = 1 * dpr;
    const spokes = 36;
    const maxR = Math.max(W, H);
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * maxR, Math.sin(a) * maxR);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawScanSweep() {
    // dönen tarayıcı ışını
    const r = Math.max(W, H) * 0.6;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.6);
    const grad = ctx.createConicGradient
      ? ctx.createConicGradient(0, 0, 0)
      : null;
    if (grad) {
      grad.addColorStop(0, "rgba(" + COLOR + ",0.0)");
      grad.addColorStop(0.08, "rgba(" + COLOR + ",0.12)");
      grad.addColorStop(0.1, "rgba(" + COLOR + ",0.0)");
      grad.addColorStop(1, "rgba(" + COLOR + ",0.0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(" + COLOR + ",0.10)";
      ctx.lineWidth = 40 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, r, -0.3, 0.05);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCore() {
    // merkezi çekirdek + nabız
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    const r = (10 + pulse * 6) * dpr;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(" + COLOR + ",0.9)";
    ctx.shadowColor = "rgba(" + COLOR + ",1)";
    ctx.shadowBlur = 24 * dpr;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    t += 0.01;

    // hafif fade (iz bırakma efekti yerine temiz temiz)
    ctx.fillStyle = "rgba(4, 7, 13, 0.30)";
    ctx.fillRect(0, 0, W, H);

    const base = Math.min(W, H) * 0.5;

    drawRadialGrid(0.04);

    // büyük dış halka (yavaş, saat yönü)
    drawRing(base * 0.95, 8, t * 0.10, 0.18, true);

    // orta halka (ters yön)
    drawRing(base * 0.72, 12, -t * 0.22, 0.30, false);

    // iç halka (hızlı)
    drawRing(base * 0.50, 6, t * 0.40, 0.45, false);

    // derece işaretleri
    drawTicks(base * 0.60, 60, t * 0.05, 0.20);
    drawTicks(base * 0.85, 90, -t * 0.03, 0.12);

    // tarayıcı ışını
    drawScanSweep();

    // merkez çekirdek
    drawCore();

    requestAnimationFrame(frame);
  }

  frame();
})();
