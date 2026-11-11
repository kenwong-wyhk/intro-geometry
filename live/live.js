/* Live lesson engine.

   Markup it reads:
     <section class="scene">                 one screen; add "blue" for a blue field, "title" for the title
     <... class="in" style="--i:2">           rises in when its scene opens; --i orders the stagger
     <... data-step="1">                      appears on the 1st press of Next inside the scene
     <section data-enter="name">              runs Live.onEnter("name", fn) each time the scene opens
     <button class="timer" data-sec="180">    a countdown; click to start, pause, or reset when finished
     <b data-count="36.84" data-from="38.32"> counts to the value when the scene opens
                                              (optional data-ms, data-delay, data-dp for decimal places)
     <div class="bar"><i data-w="62"></i>     the <i> grows to that percentage of its row
     <div class="btns choice">                buttons where one at a time stays selected
     <div class="sheet"> + <button data-focus="top%,height%" data-sheet="id">
                                              moves a red frame over part of an image; "none" clears it
     <body data-reading="lesson.html">        adds a link back to the reading version

   Keys: Right, Space, PageDown, Enter = next. Left, PageUp = back. Home = first scene. F = full screen.
   Most presentation clickers send PageDown and PageUp, so they work too. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scenes = [], current = -1, step = 0, run = 0, hooks = {};
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ---------- Animation helpers ---------- */
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  /* Calls fn(0..1) over ms. Stops quietly if alive() turns false, which happens when the
     presenter leaves the scene, so an animation never keeps running behind another scene. */
  function tween(ms, fn, alive) {
    alive = alive || function () { return true; };
    return new Promise(function (done) {
      if (calm || ms <= 0) { fn(1); return done(); }
      var t0 = performance.now();
      (function frame(now) {
        if (!alive()) return done();
        var p = Math.min(1, (now - t0) / ms);
        fn(p);
        if (p < 1) requestAnimationFrame(frame); else done();
      })(t0);
    });
  }
  function wait(ms, alive) { return tween(calm ? 0 : ms, function () {}, alive); }
  function countTo(node, from, to, ms, alive, dp) {
    if (dp === undefined) dp = 2;
    return tween(ms, function (p) { node.textContent = (from + (to - from) * ease(p)).toFixed(dp); }, alive);
  }
  /* Create an SVG element: Live.svg("circle", {cx: 10, cy: 10, r: 4, fill: Live.color.blue}) */
  function svg(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function token(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ---------- Scenes and steps ---------- */
  function maxStep(s) {
    var m = 0;
    each(s.querySelectorAll("[data-step]"), function (n) { m = Math.max(m, +n.dataset.step); });
    return m;
  }
  function showSteps() {
    each(scenes[current].querySelectorAll("[data-step]"), function (n) {
      n.classList.toggle("shown", +n.dataset.step <= step);
    });
  }
  function aliveFor(id) { return function () { return id === run; }; }
  function builtIns(scene, alive) {
    each(scene.querySelectorAll("[data-count]"), function (n) {
      var to = +n.dataset.count, from = n.dataset.from !== undefined ? +n.dataset.from : 0;
      var dp = n.dataset.dp !== undefined ? +n.dataset.dp : (String(n.dataset.count).split(".")[1] || "").length;
      n.textContent = from.toFixed(dp);
      wait(n.dataset.delay !== undefined ? +n.dataset.delay : 900, alive).then(function () {
        if (alive()) countTo(n, from, to, n.dataset.ms !== undefined ? +n.dataset.ms : 1800, alive, dp);
      });
    });
    each(scene.querySelectorAll(".bar i[data-w]"), function (i) {
      i.style.width = "0";
      wait(900, alive).then(function () { if (alive()) i.style.width = i.dataset.w + "%"; });
    });
  }
  function go(i, atEnd) {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    if (i === current) return;
    current = i; run++;
    scenes.forEach(function (s, k) { s.classList.toggle("active", k === i); s.classList.toggle("past", k < i); });
    step = atEnd ? maxStep(scenes[i]) : 0;
    showSteps();
    progress.style.width = (scenes.length > 1 ? i / (scenes.length - 1) * 100 : 100) + "%";
    where.textContent = (i + 1) + " / " + scenes.length;
    try { history.replaceState(null, "", "#" + (i + 1)); } catch (e) {}
    var alive = aliveFor(run);
    builtIns(scenes[i], alive);
    var name = scenes[i].dataset.enter;
    if (name && hooks[name]) hooks[name](alive, scenes[i]);
  }
  function next() { if (step < maxStep(scenes[current])) { step++; showSteps(); } else go(current + 1); }
  function back() { if (step > 0) { step--; showSteps(); } else go(current - 1, true); }
  /* Run a scene's animation again, for a "Play again" button. */
  function replay(name) {
    run++;
    if (hooks[name]) hooks[name](aliveFor(run), scenes[current]);
  }
  function fullscreen() {
    var d = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (d.requestFullscreen) d.requestFullscreen().catch(function () {});
  }

  /* ---------- Controls ---------- */
  var nav = document.createElement("div"), progress = document.createElement("div"), where = document.createElement("span");
  function button(label, title, fn) {
    var b = document.createElement("button");
    b.textContent = label; b.setAttribute("aria-label", title); b.onclick = fn;
    nav.appendChild(b);
  }
  function buildControls() {
    nav.className = "live-nav"; progress.className = "live-progress";
    var reading = document.body.dataset.reading;
    if (reading) {
      var a = document.createElement("a");
      a.href = reading; a.textContent = "Reading version";
      nav.appendChild(a);
    }
    nav.appendChild(where);
    button("←", "Back", back); button("→", "Next", next); button("Full screen", "Full screen", fullscreen);
    document.body.appendChild(nav); document.body.appendChild(progress);
    document.addEventListener("keydown", function (e) {
      var t = e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === " " || e.key === "Enter") { if (t === "BUTTON" || t === "A") return; e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); back(); }
      else if (e.key === "Home") go(0);
      else if (e.key === "f" || e.key === "F") fullscreen();
    });
  }

  /* ---------- Built-in parts ---------- */
  function clock(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function buildTimers() {
    each(document.querySelectorAll(".timer"), function (b) {
      var total = +b.dataset.sec, left = total, id = null;
      function paint() {
        b.textContent = left === 0 ? "Time" : clock(left) + (id ? "" : (left === total ? "  start" : "  paused"));
        b.style.setProperty("--left", left / total);
        b.classList.toggle("done", left === 0);
      }
      b.onclick = function () {
        if (left === 0) { left = total; paint(); return; }
        if (id) { clearInterval(id); id = null; paint(); return; }
        id = setInterval(function () { left--; if (left <= 0) { left = 0; clearInterval(id); id = null; } paint(); }, 1000);
        paint();
      };
      paint();
    });
  }
  function buildChoices() {
    each(document.querySelectorAll(".choice"), function (group) {
      each(group.querySelectorAll(".btn"), function (b) {
        b.addEventListener("click", function () {
          each(group.querySelectorAll(".btn"), function (o) { o.classList.toggle("on", o === b); });
        });
      });
    });
  }
  function buildFocus() {
    each(document.querySelectorAll("[data-focus]"), function (b) {
      b.addEventListener("click", function () {
        var sheet = document.getElementById(b.dataset.sheet) || document.querySelector(".sheet");
        var frame = sheet.querySelector(".focus"), img = sheet.querySelector("img");
        if (b.dataset.focus === "none") { frame.style.opacity = 0; sheet.scrollTop = 0; return; }
        var part = b.dataset.focus.split(","), h = img.offsetHeight, top = img.offsetTop + h * part[0] / 100;
        frame.style.top = top + "px"; frame.style.height = (h * part[1] / 100) + "px"; frame.style.opacity = 1;
        sheet.scrollTop = Math.max(0, top - sheet.clientHeight * 0.18);
      });
    });
  }

  window.Live = {
    tween: tween, wait: wait, ease: ease, countTo: countTo, svg: svg, calm: calm,
    onEnter: function (name, fn) { hooks[name] = fn; },
    replay: replay, next: next, back: back, go: go,
    color: {
      get blue() { return token("--blue"); }, get red() { return token("--red"); }, get ink() { return token("--ink"); },
      get muted() { return token("--ink-muted"); }, get frame() { return token("--frame"); }, get white() { return token("--white"); }
    }
  };

  /* Start after the page's own scripts have registered their onEnter hooks. */
  window.addEventListener("DOMContentLoaded", function () {
    scenes = Array.prototype.slice.call(document.querySelectorAll(".scene"));
    buildControls(); buildTimers(); buildChoices(); buildFocus();
    var start = parseInt((location.hash || "").slice(1), 10);
    go(start >= 1 && start <= scenes.length ? start - 1 : 0);
  });
})();
