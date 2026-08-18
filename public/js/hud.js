/* JARVIS v10 — Avengers: Age of Ultron tarzı HUD arka planı
   Yoğun yuvarlak/parçalı yapı, halka içinde halka, çok katmanlı oval bölgeler. */

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

  const COLOR = "255, 204, 0";
  const COLOR_ACCENT = "255, 150, 0";

  let t = 0;

  // Yuvarlak parçalı yapı — her parça ayrı açıklıkta, dönen
  function drawSegmentedRing(radius, segs, rot, alpha, lw, color, gapRatio) {
    const r = Math.max(2, radius);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = "rgba(" + (color || COLOR) + "," + alpha + ")";
    ctx.lineWidth = lw * dpr;
    ctx.setLineDash([]);

    const gap = gapRatio || 0.25; // her parçanın açıklık oranı
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2 / segs) * (1 - gap);
      ctx.beginPath();
      ctx.arc(0, 0, r, a0, a1);
      ctx.stroke();

      // parça uçlarında büyük noktalar (Ultron tarzı)
      ctx.fillStyle = "rgba(" + (color || COLOR) + "," + (alpha * 0.9) + ")";
      const ax = Math.cos(a0) * r, ay = Math.sin(a0) * r;
      ctx.beginPath();
      ctx.arc(ax, ay, 3.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // İç içe yoğun oval bölgeler (Age of Ultron'daki JARVIS yüzeyi)
  function drawOvalBands(radius, bands, rot, alpha, color) {
    const r = Math.max(2, radius);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = "rgba(" + (color || COLOR) + "," + alpha + ")";
    ctx.lineWidth = 1.6 * dpr;

    for (let b = 0; b < bands; b++) {
      const rr = r * (0.6 + (b / bands) * 0.4);
      const segs = 3 + b * 2;
      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = a0 + (Math.PI * 2 / segs) * 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, rr, a0, a1);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawTicks(radius, count, rot, alpha, color) {
    const r = Math.max(2, radius);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = "rgba(" + (color || COLOR) + "," + alpha + ")";
    ctx.lineWidth = 1.2 * dpr;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const len = (i % 6 === 0 ? 16 : 5) * dpr;
      const x0 = Math.cos(a) * r, y0 = Math.sin(a) * r;
      const x1 = Math.cos(a) * (r + len), y1 = Math.sin(a) * (r + len);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRadialGrid(alpha, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(" + (color || COLOR) + "," + alpha + ")";
    ctx.lineWidth = 1 * dpr;
    const spokes = 48;
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

  // Konumlandırılmış daireler (Ultron'daki "yörünge" parçaları)
  function drawOrbitalCircles(radius, count, rot, alpha, color) {
    const r = Math.max(2, radius);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const ox = Math.cos(a) * r, oy = Math.sin(a) * r;
      ctx.strokeStyle = "rgba(" + (color || COLOR) + "," + alpha + ")";
      ctx.lineWidth = 1.4 * dpr;
      ctx.beginPath();
      ctx.arc(ox, oy, r * 0.12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawScanSweep() {
    const r = Math.max(W, H) * 0.65;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.9);
    const grad = ctx.createConicGradient ? ctx.createConicGradient(0, 0, 0) : null;
    if (grad) {
      grad.addColorStop(0, "rgba(" + COLOR + ",0.0)");
      grad.addColorStop(0.1, "rgba(" + COLOR + ",0.16)");
      grad.addColorStop(0.12, "rgba(" + COLOR + ",0.0)");
      grad.addColorStop(1, "rgba(" + COLOR + ",0.0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.rotate(Math.PI);
    ctx.rotate(-t * 0.5);
    const grad2 = ctx.createConicGradient ? ctx.createConicGradient(0, 0, 0) : null;
    if (grad2) {
      grad2.addColorStop(0, "rgba(" + COLOR_ACCENT + ",0.0)");
      grad2.addColorStop(0.06, "rgba(" + COLOR_ACCENT + ",0.10)");
      grad2.addColorStop(0.08, "rgba(" + COLOR_ACCENT + ",0.0)");
      grad2.addColorStop(1, "rgba(" + COLOR_ACCENT + ",0.0)");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCore() {
    const pulse = 0.4 + 0.6 * Math.sin(t * 3.0);
    const r = (16 + pulse * 12) * dpr;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(" + COLOR + ",0.95)";
    ctx.shadowColor = "rgba(" + COLOR + ",1)";
    ctx.shadowBlur = 40 * dpr;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(" + COLOR + "," + (0.12 + pulse * 0.08) + ")";
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawScanline() {
    const y = (t * 60 * dpr) % H;
    ctx.fillStyle = "rgba(" + COLOR + ",0.05)";
    ctx.fillRect(0, y, W, 2 * dpr);
  }

  function frame() {
    t += 0.012;
    ctx.fillStyle = "rgba(3, 5, 9, 0.34)";
    ctx.fillRect(0, 0, W, H);

    const base = Math.min(W, H) * 0.5;

    // radyal ızgara
    drawRadialGrid(0.05);

    // dış parçalı halka — büyük, yavaş
    drawSegmentedRing(base * 0.98, 12, t * 0.06, 0.22, 2.2, null, 0.30);

    // dış-orta halka — ters yön, yoğun parçalı
    drawSegmentedRing(base * 0.82, 20, -t * 0.14, 0.28, 1.8, null, 0.22);

    // orbital daireler (Age of Ultron'daki küçük yörünge halkaları)
    drawOrbitalCircles(base * 0.70, 8, t * 0.20, 0.35, COLOR_ACCENT);

    // iç içe oval bandlar (Ultron yüzeyi gibi)
    drawOvalBands(base * 0.60, 6, t * 0.28, 0.30, null);

    // orta parçalı halka — hızlı, turuncu
    drawSegmentedRing(base * 0.52, 8, -t * 0.35, 0.42, 2.6, COLOR_ACCENT, 0.28);

    // iç halka — çok hızlı, yoğun
    drawSegmentedRing(base * 0.40, 6, t * 0.55, 0.50, 2.0, null, 0.20);

    // en iç halka — ters, yoğun parçalı
    drawSegmentedRing(base * 0.28, 10, -t * 0.72, 0.55, 2.4, COLOR_ACCENT, 0.25);

    // derece işaretleri
    drawTicks(base * 0.76, 96, t * 0.05, 0.22);
    drawTicks(base * 0.58, 72, -t * 0.09, 0.30, COLOR_ACCENT);

    // tarayıcı ışınları
    drawScanSweep();

    // tarama çizgisi
    drawScanline();

    // merkez çekirdek
    drawCore();

    requestAnimationFrame(frame);
  }

  frame();
})();
