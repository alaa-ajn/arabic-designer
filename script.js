(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const canvas = $("editorCanvas");
  const ctx = canvas.getContext("2d");
  const status = $("statusMessage");

  const STORAGE_KEY = "arabic_designer_v8_saved_state";

  const defaultLayer = (text, size, x, y, fill, stroke, outer, name) => ({
    type: "text",
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `layer-${Date.now()}-${Math.random()}`,
    name, text, size, x, y, rotation: 0, font: "Cairo",
    fill, stroke, outer, strokeWidth: 8, strokeWidth2: 15,
    hasShadow: true, hasGlow: false, has3D: false, visible: true, align: "center", bold: false, italic: false, opacity: 100, useGradient: false, gradColor1: "#ffd54f", gradColor2: "#ff6f00"
  });

  const defaultStickerLayer = (content, isEmoji, name) => ({
    type: "sticker",
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `layer-${Date.now()}-${Math.random()}`,
    name, content, isEmoji,
    size: isEmoji ? 120 : 180,
    x: 50, y: 50, rotation: 0,
    visible: true, imgElement: null, flipH: false, flipV: false, opacity: 100, hasShadow: false
  });

  const builtinStickers = [
    "🔥", "✨", "👑", "❤️", "⭐", "🎵", "🎶", "🎬", "💥", "🎯",
    "🎧", "⚡", "💎", "🏆", "🌟", "📢", "🔴", "💯", "👇", "🚀"
  ];

  const textPresets = [
    { name: "🚗 دفع رباعي - أصفر وبدري", fill: "#ffd54f", stroke: "#29b6f6", outer: "#000000", strokeWidth: 10, strokeWidth2: 22, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ffee58", gradColor2: "#f57c00" },
    { name: "💥 كارتون أحمر وأصفر", fill: "#ffeb3b", stroke: "#d50000", outer: "#000000", strokeWidth: 10, strokeWidth2: 22, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ffff00", gradColor2: "#ff9100" },
    { name: "🟢 نيون كارتون فسفوري", fill: "#ccff00", stroke: "#004d40", outer: "#000000", strokeWidth: 10, strokeWidth2: 20, hasGlow: true, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#eeff41", gradColor2: "#76ff03" },
    { name: "🟣 سايبر وردي وبنفسجي", fill: "#ff80ab", stroke: "#4a148c", outer: "#0d001a", strokeWidth: 10, strokeWidth2: 22, hasGlow: true, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ff4081", gradColor2: "#aa00ff" },
    { name: "🔵 أزرق كارتوني ثلجي", fill: "#e0f7fa", stroke: "#0288d1", outer: "#01579b", strokeWidth: 10, strokeWidth2: 22, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#80d8ff", gradColor2: "#0091ea" },
    { name: "🧡 برتقالي حاد جمر", fill: "#fff3e0", stroke: "#bf360c", outer: "#000000", strokeWidth: 10, strokeWidth2: 22, hasGlow: true, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ffab40", gradColor2: "#dd2c00" },
    { name: "👑 ذهبي ملكي مجسم", fill: "#fff8e1", stroke: "#ff6f00", outer: "#1a0c00", strokeWidth: 10, strokeWidth2: 20, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ffe082", gradColor2: "#ff8f00" },
    { name: "💎 فضي كروم براق", fill: "#ffffff", stroke: "#37474f", outer: "#000000", strokeWidth: 8, strokeWidth2: 18, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ffffff", gradColor2: "#90a4ae" },
    { name: "🟢 أخضر زمردي شعار", fill: "#e8f5e9", stroke: "#1b5e20", outer: "#002105", strokeWidth: 10, strokeWidth2: 20, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#a5d6a7", gradColor2: "#2e7d32" },
    { name: "🔴 أحمر ناري بطولي", fill: "#ffffff", stroke: "#b71c1c", outer: "#210000", strokeWidth: 10, strokeWidth2: 22, hasGlow: true, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ff5252", gradColor2: "#d50000" },
    { name: "🔮 بنفسجي نيون حالم", fill: "#f3e5f5", stroke: "#6a1b9a", outer: "#12001c", strokeWidth: 10, strokeWidth2: 20, hasGlow: true, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#e040fb", gradColor2: "#7b1fa2" },
    { name: "💛 أصفر وأسود رياضي", fill: "#ffff8d", stroke: "#212121", strokeWidth: 12, outer: "#ffd600", strokeWidth2: 24, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ffff00", gradColor2: "#ffab00" },
    { name: "🏖️ صيفي فيروزي ووردي", fill: "#e0f2f1", stroke: "#d81b60", outer: "#004d40", strokeWidth: 10, strokeWidth2: 22, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#18ffff", gradColor2: "#ff4081" },
    { name: "🖤 ذهبي على أسود", fill: "#ffd54f", stroke: "#000000", outer: "#ffb300", strokeWidth: 10, strokeWidth2: 20, hasGlow: false, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#ffe082", gradColor2: "#ff8f00" },
    { name: "🎮 جيمينج فوشيا وأزرق", fill: "#00e5ff", stroke: "#c51162", outer: "#0a0014", strokeWidth: 10, strokeWidth2: 22, hasGlow: true, hasShadow: true, has3D: true, useGradient: true, gradColor1: "#00b0ff", gradColor2: "#f50057" }
  ];

  let nextLayerNumber = 3;
  let layers = [
    defaultLayer("اكتب عبارتك هنا", 100, 50, 30, "#ffffff", "#2962ff", "#050b1e", "النص 1"),
    defaultLayer("علاء البصراوي", 86, 50, 72, "#ffe082", "#bf360c", "#1a0c00", "النص 2")
  ];
  let activeLayerId = layers[0].id;
  let backgroundImage = null;
  let bgBase64 = null;
  let customFontCount = 0;
  let brightness = 100;
  let ratio = "landscape";

  let activePreset = "none";
  let filterIntensity = 100;
  let bgBlur = 0;
  let vignetteVal = 0;
  let contrastVal = 100;
  let saturationVal = 100;

  let isInteracting = false;
  let isRestoring = false;

  const currentIndex = () => layers.findIndex(layer => layer.id === activeLayerId);
  const current = () => layers[Math.max(0, currentIndex())];
  const val = id => Number($(id).value);

  function showStatus(message, error = false) {
    status.textContent = message;
    status.style.color = error ? "#fca5a5" : "#86efac";
  }

  // === LOCAL STORAGE SAVE & LOAD ===
  let saveTimeout = null;
  function triggerAutoSave() {
    if (isRestoring) return;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToLocalStorage, 300);
  }

  function compressImageForStorage(img, maxWidth = 1280, quality = 0.7) {
    try {
      const c = document.createElement("canvas");
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      c.width = w;
      c.height = h;
      const cx = c.getContext("2d");
      cx.drawImage(img, 0, 0, w, h);
      return c.toDataURL("image/jpeg", quality);
    } catch (e) {
      return null;
    }
  }

  function saveToLocalStorage() {
    if (isRestoring) return;
    try {
      const state = {
        version: "8.1",
        ratio,
        brightness,
        filterIntensity,
        bgBlur,
        vignetteVal,
        contrastVal,
        saturationVal,
        activePreset,
        nextLayerNumber,
        activeLayerId,
        bgBase64,
        layers: layers.map(l => {
          const { imgElement, ...rest } = l;
          return rest;
        })
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      if (e.name === "QuotaExceededError" && bgBase64) {
        // If image is too large for LocalStorage, try saving without background image to prevent crashing
        try {
          const stateNoBg = {
            version: "8.1",
            ratio,
            brightness,
            filterIntensity,
            bgBlur,
            vignetteVal,
            contrastVal,
            saturationVal,
            activePreset,
            nextLayerNumber,
            activeLayerId,
            bgBase64: null,
            layers: layers.map(l => {
              const { imgElement, ...rest } = l;
              return rest;
            })
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateNoBg));
          showStatus("تم حفظ النصوص والتعديلات (تنبيه: حجم صورة الخلفية كبير جداً للحفظ تلقائياً).");
        } catch (err) {
          console.warn("Could not save to LocalStorage:", err);
        }
      } else {
        console.warn("Could not save to LocalStorage:", e);
      }
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const state = JSON.parse(saved);
      if (!state.layers || !Array.isArray(state.layers) || state.layers.length === 0) return false;

      isRestoring = true;

      layers = state.layers.map(l => {
        if (l.type === "sticker" && !l.isEmoji && l.content) {
          const img = new Image();
          img.onload = () => drawEverything();
          img.src = l.content;
          l.imgElement = img;
        }
        return l;
      });

      if (state.nextLayerNumber) nextLayerNumber = state.nextLayerNumber;
      if (state.ratio) {
        ratio = state.ratio;
        if (ratio === "landscape") {
          canvas.width = 1920; canvas.height = 1080;
          $("ratioLandscape").classList.add("active");
          $("ratioPortrait").classList.remove("active");
          $("dimensionLabel").textContent = "الأبعاد: 1920 × 1080";
          $("ratioLabel").textContent = "النسبة: 16:9 أفقي";
        } else {
          canvas.width = 1080; canvas.height = 1920;
          $("ratioPortrait").classList.add("active");
          $("ratioLandscape").classList.remove("active");
          $("dimensionLabel").textContent = "الأبعاد: 1080 × 1920";
          $("ratioLabel").textContent = "النسبة: 9:16 عمودي";
        }
      }

      if (state.bgBase64) {
        bgBase64 = state.bgBase64;
        const img = new Image();
        img.onload = () => drawEverything();
        img.src = bgBase64;
        backgroundImage = img;
      } else {
        backgroundImage = null;
        bgBase64 = null;
      }

      if (state.brightness !== undefined) {
        brightness = state.brightness;
        $("bgBrightness").value = brightness;
      }
      if (state.filterIntensity !== undefined) {
        filterIntensity = state.filterIntensity;
        $("filterIntensity").value = filterIntensity;
        $("filterIntensityVal").textContent = `${filterIntensity}%`;
      }
      if (state.bgBlur !== undefined) {
        bgBlur = state.bgBlur;
        $("bgBlur").value = bgBlur;
        $("bgBlurVal").textContent = `${bgBlur} px`;
      }
      if (state.vignetteVal !== undefined) {
        vignetteVal = state.vignetteVal;
        $("vignette").value = vignetteVal;
        $("vignetteVal").textContent = `${vignetteVal}%`;
      }
      if (state.contrastVal !== undefined) {
        contrastVal = state.contrastVal;
        $("contrast").value = contrastVal;
        $("contrastVal").textContent = `${contrastVal}%`;
      }
      if (state.saturationVal !== undefined) {
        saturationVal = state.saturationVal;
        $("saturation").value = saturationVal;
        $("saturationVal").textContent = `${saturationVal}%`;
      }
      if (state.activePreset) {
        activePreset = state.activePreset;
        document.querySelectorAll(".preset-btn").forEach(b => {
          b.classList.toggle("active", b.dataset.preset === activePreset);
        });
      }

      if (state.activeLayerId && layers.some(l => l.id === state.activeLayerId)) {
        activeLayerId = state.activeLayerId;
      } else {
        activeLayerId = layers[0] ? layers[0].id : null;
      }

      syncControls();
      syncColorControls();
      renderLayerList();
      
      isRestoring = false;
      drawEverything();
      showStatus("تم استرجاع تعديلاتك والصورة بنجاح من الـ LocalStorage! 🔄✨");
      return true;
    } catch (e) {
      isRestoring = false;
      console.warn("Could not load from LocalStorage:", e);
      return false;
    }
  }

  function renderStickersGrid() {
    const grid = $("stickersGrid");
    if (!grid) return;
    grid.innerHTML = "";
    builtinStickers.forEach(emoji => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sticker-item-btn";
      btn.textContent = emoji;
      btn.addEventListener("click", () => addStickerLayer(emoji, true));
      grid.appendChild(btn);
    });
  }

  function addStickerLayer(content, isEmoji, customName) {
    const layer = defaultStickerLayer(content, isEmoji, customName || (isEmoji ? `ملصق ${content}` : "ملصق جديد"));
    if (!isEmoji) {
      const img = new Image();
      img.onload = () => {
        layer.imgElement = img;
        drawEverything();
      };
      img.src = content;
    }
    layers.push(layer);
    activeLayerId = layer.id;
    syncControls();
    syncColorControls();
    renderLayerList();
    drawEverything();
    showStatus(`تم إضافة الملصق: ${layer.name}`);
  }

  function renderStylePresets() {
    const grid = $("stylePresetsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    textPresets.forEach(p => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "style-preset-btn";
      btn.textContent = p.name;
      btn.addEventListener("click", () => applyTextPreset(p));
      grid.appendChild(btn);
    });
  }

  function applyTextPreset(preset) {
    const l = current();
    if (l.type !== "text") return;
    l.fill = preset.fill;
    l.stroke = preset.stroke;
    l.outer = preset.outer;
    l.strokeWidth = preset.strokeWidth;
    l.strokeWidth2 = preset.strokeWidth2;
    l.hasGlow = preset.hasGlow;
    l.hasShadow = preset.hasShadow;
    l.has3D = preset.has3D;
    l.useGradient = !!preset.useGradient;
    if (preset.gradColor1) l.gradColor1 = preset.gradColor1;
    if (preset.gradColor2) l.gradColor2 = preset.gradColor2;

    syncColorControls();
    if ($("textShadowToggle")) $("textShadowToggle").checked = l.hasShadow;
    if ($("textGlowToggle")) $("textGlowToggle").checked = l.hasGlow;
    if ($("text3DToggle")) $("text3DToggle").checked = l.has3D;

    drawEverything();
    showStatus(`تم تطبيق النمط: ${preset.name}`);
  }

  function renderLayerList() {
    const list = $("layerList");
    list.innerHTML = "";
    layers.forEach((layer, index) => {
      const item = document.createElement("div");
      item.className = `layer-list-item${layer.id === activeLayerId ? " active" : ""}${layer.visible ? "" : " hidden-layer"}`;
      item.dataset.layerId = layer.id;

      const select = document.createElement("button");
      select.type = "button";
      select.className = "layer-select-btn";
      
      const titleText = layer.type === "sticker" ? (layer.isEmoji ? `ملصق ${layer.content}` : layer.name) : (layer.text.trim() || layer.name);
      select.innerHTML = `<span class="layer-order">${index + 1}</span><span class="layer-title"></span><span class="layer-visibility">${layer.visible ? "👁" : "🚫"}</span>`;
      select.querySelector(".layer-title").textContent = titleText;
      select.title = "تحديد الطبقة للتحرير";
      select.addEventListener("click", () => selectLayer(layer.id));

      const visibility = select.querySelector(".layer-visibility");
      visibility.setAttribute("aria-label", layer.visible ? "إخفاء" : "إظهار");
      visibility.addEventListener("click", event => {
        event.stopPropagation();
        layer.visible = !layer.visible;
        renderLayerList();
        drawEverything();
      });
      item.appendChild(select);
      list.appendChild(item);
    });
    $("deleteLayerBtn").disabled = layers.length <= 1;
    $("moveLayerUpBtn").disabled = currentIndex() <= 0;
    $("moveLayerDownBtn").disabled = currentIndex() < 0 || currentIndex() >= layers.length - 1;
    $("deleteLayerBtn").style.opacity = layers.length <= 1 ? ".45" : "1";
  }

  function selectLayer(id) {
    if (!layers.some(layer => layer.id === id)) return;
    activeLayerId = id;
    syncControls();
    syncColorControls();
    renderLayerList();
  }

  function syncControls() {
    const l = current();
    if (!l) return;
    $("fontSize").value = l.size;
    $("xSlider").value = l.x;
    $("ySlider").value = l.y;
    $("rotationSlider").value = l.rotation || 0;
    $("fontSizeVal").textContent = `${l.size} px`;
    if ($("opacitySlider")) { $("opacitySlider").value = l.opacity !== undefined ? l.opacity : 100; $("opacityVal").textContent = `${$("opacitySlider").value}%`; }
    if ($("stickerShadowToggle") && l.type === "sticker") { $("stickerShadowToggle").checked = !!l.hasShadow; }
    if ($("stickerSizeSlider")) { $("stickerSizeSlider").value = l.size; $("stickerSizeVal").textContent = `${l.size} px`; }
    $("xSliderVal").textContent = `${l.x}%`;
    $("ySliderVal").textContent = `${l.y}%`;
    $("rotationVal").textContent = `${l.rotation || 0}°`;

    if (l.type === "text") {
      $("textInput").value = l.text || "";
      $("fontSelect").value = l.font || "Cairo";
      if ($("textShadowToggle")) $("textShadowToggle").checked = l.hasShadow !== false;
      if ($("textGlowToggle")) $("textGlowToggle").checked = !!l.hasGlow;
      if ($("text3DToggle")) $("text3DToggle").checked = !!l.has3D;
    }
  }

  function syncColorControls() {
    const l = current();
    if (!l) return;
    if (l.type === "text") {
      $("textColor").value = l.fill || "#ffffff";
      $("strokeColor").value = l.stroke || "#000000";
      $("strokeColor2").value = l.outer || "#000000";
      $("strokeWidth").value = l.strokeWidth || 8;
      $("strokeWidth2").value = l.strokeWidth2 || 15;
      $("strokeWidthVal").textContent = `${l.strokeWidth || 8} px`;
      $("strokeWidth2Val").textContent = `${l.strokeWidth2 || 15} px`;
      if ($("gradientToggle")) $("gradientToggle").checked = !!l.useGradient;
      if ($("gradientColorsGroup")) $("gradientColorsGroup").style.display = l.useGradient ? "grid" : "none";
      if ($("gradColor1")) $("gradColor1").value = l.gradColor1 || "#ffd54f";
      if ($("gradColor2")) $("gradColor2").value = l.gradColor2 || "#ff6f00";
    }
    $("selectedLayerColorName").textContent = l.name;
  }

  function switchTab(tabId, button) {
    document.querySelectorAll(".panel-content").forEach(p => p.classList.toggle("active", p.id === tabId));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === button));
  }

  function setRatio(nextRatio) {
    ratio = nextRatio;
    if (ratio === "landscape") {
      canvas.width = 1920; canvas.height = 1080;
      $("ratioLandscape").classList.add("active");
      $("ratioPortrait").classList.remove("active");
      $("dimensionLabel").textContent = "الأبعاد: 1920 × 1080";
      $("ratioLabel").textContent = "النسبة: 16:9 أفقي";
    } else {
      canvas.width = 1080; canvas.height = 1920;
      $("ratioPortrait").classList.add("active");
      $("ratioLandscape").classList.remove("active");
      $("dimensionLabel").textContent = "الأبعاد: 1080 × 1920";
      $("ratioLabel").textContent = "النسبة: 9:16 عمودي";
    }
    drawEverything();
  }

  function getCanvasFilterString() {
    const b = brightness;
    const c = contrastVal;
    const s = saturationVal;
    const blur = bgBlur;
    let filterStr = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${blur}px)`;

    const factor = filterIntensity / 100;
    if (factor <= 0 || activePreset === "none") return filterStr;

    switch (activePreset) {
      case "cinematic": filterStr += ` sepia(${25 * factor}%) hue-rotate(${-12 * factor}deg) saturate(${125 * factor}%)`; break;
      case "cool": filterStr += ` hue-rotate(${180 * factor}deg) saturate(${95 * factor}%)`; break;
      case "warm": filterStr += ` sepia(${40 * factor}%) saturate(${135 * factor}%)`; break;
      case "dramatic": filterStr += ` contrast(${150 * factor}%) saturate(${75 * factor}%)`; break;
      case "night": filterStr += ` brightness(${65 * factor}%) hue-rotate(${195 * factor}deg) contrast(${120 * factor}%)`; break;
      case "vintage": filterStr += ` sepia(${60 * factor}%) contrast(${90 * factor}%) brightness(${95 * factor}%)`; break;
      case "cyberpunk": filterStr += ` hue-rotate(${300 * factor}deg) contrast(${160 * factor}%) saturate(${180 * factor}%)`; break;
      case "bw": filterStr += ` grayscale(${100 * factor}%)`; break;
      case "sepia": filterStr += ` sepia(${100 * factor}%)`; break;
      case "saturate": filterStr += ` saturate(${220 * factor}%)`; break;
      case "fade": filterStr += ` opacity(${80 * factor}%) contrast(${85 * factor}%)`; break;
      case "invert": filterStr += ` invert(${100 * factor}%)`; break;
      case "pop": filterStr += ` saturate(${250 * factor}%) contrast(${120 * factor}%)`; break;
    }
    return filterStr;
  }

  function drawLayer(layer) {
    if (!layer.visible) return;
    
    if (layer.type === "sticker") {
      drawSticker(layer);
      return;
    }
    
    if (!layer.text || !layer.text.trim()) return;
    const x = canvas.width * layer.x / 100;
    const y = canvas.height * layer.y / 100;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((layer.rotation || 0) * Math.PI / 180);

    const fontStyle = layer.italic ? "italic " : "";
    const fontWeight = layer.bold ? "900" : (layer.font === "Amiri" ? "700" : "900");
    ctx.font = `${fontStyle}${fontWeight} ${layer.size}px "${layer.font}", Arial, sans-serif`;
    ctx.textAlign = layer.align || "center";
    ctx.globalAlpha = (layer.opacity !== undefined ? layer.opacity : 100) / 100;
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    if (layer.has3D) {
      const depth = Math.max(3, Math.round(layer.size * 0.08));
      ctx.fillStyle = "#000000";
      for (let i = depth; i > 0; i--) {
        ctx.fillText(layer.text, i, i, canvas.width * .92);
      }
    }

    if (layer.hasGlow) {
      ctx.shadowColor = layer.fill || "#ffffff";
      ctx.shadowBlur = Math.max(20, layer.size * 0.3);
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    } else if (layer.hasShadow !== false) {
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = Math.max(2, layer.size * .04);
      ctx.shadowOffsetY = Math.max(2, layer.size * .03);
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    if (layer.strokeWidth2 > 0) {
      ctx.strokeStyle = layer.outer;
      ctx.lineWidth = layer.strokeWidth2;
      ctx.strokeText(layer.text, 0, 0, canvas.width * .92);
    }
    if (layer.strokeWidth > 0) {
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = layer.strokeWidth;
      ctx.strokeText(layer.text, 0, 0, canvas.width * .92);
    }
    if (layer.useGradient) {
      const grad = ctx.createLinearGradient(0, -layer.size / 2, 0, layer.size / 2);
      grad.addColorStop(0, layer.gradColor1 || "#ffd54f");
      grad.addColorStop(1, layer.gradColor2 || "#ff6f00");
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = layer.fill;
    }
    ctx.fillText(layer.text, 0, 0, canvas.width * .92);

    if (layer.id === activeLayerId && isInteracting) {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      const metrics = ctx.measureText(layer.text);
      const w = metrics.width + 24;
      const h = layer.size + 24;
      ctx.strokeStyle = "rgba(255, 193, 7, 0.9)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  function drawSticker(layer) {
    const x = canvas.width * layer.x / 100;
    const y = canvas.height * layer.y / 100;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((layer.rotation || 0) * Math.PI / 180);

    ctx.globalAlpha = (layer.opacity !== undefined ? layer.opacity : 100) / 100;
    if (layer.flipH || layer.flipV) {
      ctx.scale(layer.flipH ? -1 : 1, layer.flipV ? -1 : 1);
    }

    if (layer.hasShadow) {
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    }

    if (layer.isEmoji) {
      ctx.font = `${layer.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.content, 0, 0);
    } else if (layer.imgElement) {
      const w = layer.size;
      const h = layer.size * (layer.imgElement.naturalHeight / layer.imgElement.naturalWidth);
      ctx.drawImage(layer.imgElement, -w / 2, -h / 2, w, h);
    }

    if (layer.id === activeLayerId && isInteracting) {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      const w = layer.size + 20;
      const h = layer.size + 20;
      ctx.strokeStyle = "rgba(255, 193, 7, 0.9)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  function drawVignette() {
    if (vignetteVal <= 0) return;
    ctx.save();
    const outerRadius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, outerRadius * 0.3,
      canvas.width / 2, canvas.height / 2, outerRadius
    );
    const alpha = (vignetteVal / 100) * 0.85;
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function drawEverything() {
    if (!ctx) return;
    brightness = val("bgBrightness");
    $("bgBrightnessVal").textContent = `${brightness}%`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.filter = getCanvasFilterString();

    if (backgroundImage) {
      const scale = Math.max(canvas.width / backgroundImage.naturalWidth, canvas.height / backgroundImage.naturalHeight);
      const w = backgroundImage.naturalWidth * scale;
      const h = backgroundImage.naturalHeight * scale;
      ctx.drawImage(backgroundImage, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#202b45");
      gradient.addColorStop(.55, "#111827");
      gradient.addColorStop(1, "#351f35");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    drawVignette();

    layers.forEach(drawLayer);
    if (current()) {
      $("fontSizeVal").textContent = `${current().size} px`;
      $("xSliderVal").textContent = `${current().x}%`;
      $("ySliderVal").textContent = `${current().y}%`;
      $("rotationVal").textContent = `${current().rotation || 0}°`;
      if (current().type === "text") {
        $("strokeWidthVal").textContent = `${current().strokeWidth} px`;
        $("strokeWidth2Val").textContent = `${current().strokeWidth2} px`;
      }
    }

    triggerAutoSave();
  }

  function updateTextControls() {
    const l = current();
    if (!l) return;
    l.size = val("fontSize");
    l.x = val("xSlider");
    l.y = val("ySlider");
    l.rotation = val("rotationSlider");
    if (l.type === "text") {
      l.text = $("textInput").value;
      l.font = $("fontSelect").value;
    }
    renderLayerList();
    drawEverything();
  }

  function updateColorControls() {
    const l = current();
    if (!l || l.type !== "text") return;
    l.fill = $("textColor").value;
    l.stroke = $("strokeColor").value;
    l.outer = $("strokeColor2").value;
    l.strokeWidth = val("strokeWidth");
    l.strokeWidth2 = val("strokeWidth2");
    syncColorControls();
    drawEverything();
  }

  function moveText(direction) {
    const l = current();
    if (!l) return;
    const step = 2;
    if (direction === "up") l.y = Math.max(0, l.y - step);
    if (direction === "down") l.y = Math.min(100, l.y + step);
    if (direction === "left") l.x = Math.max(0, l.x - step);
    if (direction === "right") l.x = Math.min(100, l.x + step);
    if (direction === "reset") { l.x = 50; l.y = currentIndex() === 0 ? 30 : Math.min(90, 30 + currentIndex() * 20); l.rotation = 0; }
    $("xSlider").value = l.x;
    $("ySlider").value = l.y;
    $("rotationSlider").value = l.rotation;
    
    isInteracting = true;
    drawEverything();
    clearTimeout(window.interactionTimeout);
    window.interactionTimeout = setTimeout(() => {
      isInteracting = false;
      drawEverything();
    }, 800);
  }

  function addLayer(copyCurrent = false) {
    const source = copyCurrent ? current() : null;
    const number = nextLayerNumber++;
    const layer = source ? {
      ...source,
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `layer-${Date.now()}-${Math.random()}`,
      name: `النص ${number}`,
      text: source.text || "نص جديد",
      x: Math.min(90, source.x + 3),
      y: Math.min(90, source.y + 8),
      visible: true
    } : defaultLayer("اكتب النص الجديد هنا", 76, 50, Math.min(90, 30 + layers.length * 10), "#ffffff", "#ff5722", "#111111", `النص ${number}`);
    layers.push(layer);
    activeLayerId = layer.id;
    syncControls();
    syncColorControls();
    renderLayerList();
    showStatus(copyCurrent ? "تم نسخ الطبقة." : "تمت إضافة نص جديد.");
  }

  function deleteLayer() {
    if (layers.length <= 1) return;
    const index = currentIndex();
    const deleted = layers.splice(index, 1)[0];
    activeLayerId = layers[Math.max(0, index - 1)].id;
    syncControls();
    syncColorControls();
    renderLayerList();
    showStatus(`تم حذف ${deleted.name}.`);
  }

  function reorderLayer(direction) {
    const index = currentIndex();
    const next = index + direction;
    if (index < 0 || next < 0 || next >= layers.length) return;
    [layers[index], layers[next]] = [layers[next], layers[index]];
    renderLayerList();
    drawEverything();
  }

  document.querySelectorAll(".tab-btn").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab, b)));
  ["textInput", "fontSize", "xSlider", "ySlider", "rotationSlider", "fontSelect"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", () => {
      isInteracting = true;
      updateTextControls();
      clearTimeout(window.interactionTimeout);
      window.interactionTimeout = setTimeout(() => {
        isInteracting = false;
        drawEverything();
      }, 800);
    });
  });

  ["textColor", "strokeColor", "strokeColor2", "strokeWidth", "strokeWidth2"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", updateColorControls);
  });

  $("bgBrightness").addEventListener("input", drawEverything);
  $("ratioLandscape").addEventListener("click", () => setRatio("landscape"));
  $("ratioPortrait").addEventListener("click", () => setRatio("portrait"));
  document.querySelectorAll("[data-move]").forEach(b => b.addEventListener("click", () => moveText(b.dataset.move)));
  $("addLayerBtn").addEventListener("click", () => addLayer(false));
  $("duplicateLayerBtn").addEventListener("click", () => addLayer(true));
  $("deleteLayerBtn").addEventListener("click", deleteLayer);
  $("moveLayerUpBtn").addEventListener("click", () => reorderLayer(-1));
  $("moveLayerDownBtn").addEventListener("click", () => reorderLayer(1));

  $("rotateLeftBtn").addEventListener("click", () => {
    const l = current();
    if (!l) return;
    l.rotation = Math.max(-180, (l.rotation || 0) - 15);
    $("rotationSlider").value = l.rotation;
    isInteracting = true;
    drawEverything();
    clearTimeout(window.interactionTimeout);
    window.interactionTimeout = setTimeout(() => { isInteracting = false; drawEverything(); }, 800);
  });
  $("rotateRightBtn").addEventListener("click", () => {
    const l = current();
    if (!l) return;
    l.rotation = Math.min(180, (l.rotation || 0) + 15);
    $("rotationSlider").value = l.rotation;
    isInteracting = true;
    drawEverything();
    clearTimeout(window.interactionTimeout);
    window.interactionTimeout = setTimeout(() => { isInteracting = false; drawEverything(); }, 800);
  });
  $("rotateResetBtn").addEventListener("click", () => {
    const l = current();
    if (!l) return;
    l.rotation = 0;
    $("rotationSlider").value = 0;
    isInteracting = true;
    drawEverything();
    clearTimeout(window.interactionTimeout);
    window.interactionTimeout = setTimeout(() => { isInteracting = false; drawEverything(); }, 800);
  });

  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      activePreset = e.target.dataset.preset;
      drawEverything();
    });
  });

  $("filterIntensity").addEventListener("input", (e) => {
    filterIntensity = Number(e.target.value);
    $("filterIntensityVal").textContent = `${filterIntensity}%`;
    drawEverything();
  });

  $("bgBlur").addEventListener("input", (e) => {
    bgBlur = Number(e.target.value);
    $("bgBlurVal").textContent = `${bgBlur} px`;
    drawEverything();
  });

  $("vignette").addEventListener("input", (e) => {
    vignetteVal = Number(e.target.value);
    $("vignetteVal").textContent = `${vignetteVal}%`;
    drawEverything();
  });

  $("contrast").addEventListener("input", (e) => {
    contrastVal = Number(e.target.value);
    $("contrastVal").textContent = `${contrastVal}%`;
    drawEverything();
  });

  $("saturation").addEventListener("input", (e) => {
    saturationVal = Number(e.target.value);
    $("saturationVal").textContent = `${saturationVal}%`;
    drawEverything();
  });

  if ($("textShadowToggle")) {
    $("textShadowToggle").addEventListener("change", (e) => {
      if (current() && current().type === "text") current().hasShadow = e.target.checked;
      drawEverything();
    });
  }

  if ($("textGlowToggle")) {
    $("textGlowToggle").addEventListener("change", (e) => {
      if (current() && current().type === "text") current().hasGlow = e.target.checked;
      drawEverything();
    });
  }

  if ($("text3DToggle")) {
    $("text3DToggle").addEventListener("change", (e) => {
      if (current() && current().type === "text") current().has3D = e.target.checked;
      drawEverything();
    });
  }

  $("resetFiltersBtn").addEventListener("click", () => {
    activePreset = "none";
    filterIntensity = 100;
    bgBlur = 0;
    vignetteVal = 0;
    contrastVal = 100;
    saturationVal = 100;
    $("filterIntensity").value = 100; $("filterIntensityVal").textContent = "100%";
    $("bgBlur").value = 0; $("bgBlurVal").textContent = "0 px";
    $("vignette").value = 0; $("vignetteVal").textContent = "0%";
    $("contrast").value = 100; $("contrastVal").textContent = "100%";
    $("saturation").value = 100; $("saturationVal").textContent = "100%";
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('.preset-btn[data-preset="none"]').classList.add("active");
    drawEverything();
    showStatus("تمت إعادة ضبط جميع الفلاتر والتأثيرات.");
  });

  if ($("stickerUpload")) {
    $("stickerUpload").addEventListener("change", event => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return showStatus("الرجاء اختيار ملف صورة صالح للملصق.", true);
      const url = URL.createObjectURL(file);
      addStickerLayer(url, false, file.name);
    });
  }

  if ($("bgUpload")) {
    $("bgUpload").addEventListener("change", event => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return showStatus("الرجاء اختيار ملف صورة صالح.", true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const tempImg = new Image();
        tempImg.onload = () => {
          // Compress image to ensure it fits easily into LocalStorage 5MB limit
          bgBase64 = compressImageForStorage(tempImg);
          backgroundImage = tempImg;
          drawEverything();
          showStatus(`تم تحميل الخلفية وحفظها بالـ LocalStorage: ${file.name}`);
        };
        tempImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  $("clearBgBtn").addEventListener("click", () => {
    backgroundImage = null;
    bgBase64 = null;
    if ($("bgUpload")) $("bgUpload").value = "";
    drawEverything();
    showStatus("تمت إزالة الخلفية وتحديث الـ LocalStorage.");
  });

  $("fontUpload").addEventListener("change", async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const name = `CustomFont${++customFontCount}`;
    try {
      const font = new FontFace(name, `url("${url}")`);
      await font.load();
      document.fonts.add(font);
      const option = document.createElement("option");
      option.value = name; option.textContent = `${file.name} — خط مضاف`;
      $("fontSelect").appendChild(option);
      if (current() && current().type === "text") {
        current().font = name;
        $("fontSelect").value = name;
      }
      drawEverything(); showStatus(`تم تحميل الخط "${file.name}".`);
    } catch {
      showStatus("تعذر تحميل الخط. تأكد من أن الملف صالح.", true);
      URL.revokeObjectURL(url);
    }
  });

  $("downloadBtn").addEventListener("click", async () => {
    try {
      isInteracting = false;
      await document.fonts.ready;
      drawEverything();
      const link = document.createElement("a");
      link.download = ratio === "landscape" ? "arabic-designer-16x9.png" : "arabic-designer-9x16.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      showStatus(`تم تصدير الصورة بالأبعاد ${canvas.width} × ${canvas.height}.`);
    } catch {
      showStatus("تعذر حفظ الصورة. جرّب مرة أخرى.", true);
    }
  });

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialLayerX = 0;
  let initialLayerY = 0;

  let initialTouchDistance = null;
  let initialFontSize = null;
  let initialTouchAngle = null;
  let initialRotation = null;

  function getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getAngle(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  function getLayerAtPosition(canvasX, canvasY) {
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (!l.visible) continue;

      const x = canvas.width * l.x / 100;
      const y = canvas.height * l.y / 100;

      let w = l.size + 20;
      let h = l.size + 20;

      if (l.type === "text") {
        if (!l.text || !l.text.trim()) continue;
        ctx.font = `${l.font === "Amiri" ? 700 : 900} ${l.size}px "${l.font}", Arial, sans-serif`;
        const metrics = ctx.measureText(l.text);
        w = metrics.width + 20;
        h = l.size + 20;
      }

      const rad = -(l.rotation || 0) * Math.PI / 180;
      const dx = canvasX - x;
      const dy = canvasY - y;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

      if (Math.abs(rx) <= w / 2 && Math.abs(ry) <= h / 2) {
        return l.id;
      }
    }
    return null;
  }

  function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = getCanvasCoords(touch.clientX, touch.clientY);
      const clickedId = getLayerAtPosition(pos.x, pos.y);

      if (clickedId) {
        selectLayer(clickedId);
        isDragging = true;
        isInteracting = true;
        dragStartX = pos.x;
        dragStartY = pos.y;
        initialLayerX = current().x;
        initialLayerY = current().y;
        drawEverything();
      } else {
        isInteracting = false;
        drawEverything();
      }
    } else if (e.touches.length === 2) {
      e.preventDefault();
      isDragging = false;
      isInteracting = true;
      initialTouchDistance = getDistance(e.touches[0], e.touches[1]);
      initialTouchAngle = getAngle(e.touches[0], e.touches[1]);
      initialFontSize = current() ? current().size : 100;
      initialRotation = current() ? (current().rotation || 0) : 0;
      drawEverything();
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getCanvasCoords(touch.clientX, touch.clientY);
      const dxPercent = ((pos.x - dragStartX) / canvas.width) * 100;
      const dyPercent = ((pos.y - dragStartY) / canvas.height) * 100;

      const l = current();
      if (!l) return;
      l.x = Math.max(0, Math.min(100, Math.round(initialLayerX + dxPercent)));
      l.y = Math.max(0, Math.min(100, Math.round(initialLayerY + dyPercent)));

      $("xSlider").value = l.x;
      $("ySlider").value = l.y;
      drawEverything();
    } else if (e.touches.length === 2 && initialTouchDistance) {
      e.preventDefault();
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const currentAng = getAngle(e.touches[0], e.touches[1]);

      const scaleFactor = currentDist / initialTouchDistance;
      let newSize = Math.round(initialFontSize * scaleFactor);
      newSize = Math.max(20, Math.min(1000, newSize));

      let angleDiff = Math.round(currentAng - initialTouchAngle);
      let newRot = initialRotation + angleDiff;
      if (newRot > 180) newRot -= 360;
      if (newRot < -180) newRot += 360;

      const l = current();
      if (!l) return;
      l.size = newSize;
      l.rotation = newRot;

      $("fontSize").value = newSize;
      $("rotationSlider").value = newRot;
      drawEverything();
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    if (e.touches.length === 0) {
      isDragging = false;
      isInteracting = false;
      initialTouchDistance = null;
      drawEverything();
    } else if (e.touches.length === 1) {
      initialTouchDistance = null;
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    const pos = getCanvasCoords(e.clientX, e.clientY);
    const clickedId = getLayerAtPosition(pos.x, pos.y);

    if (clickedId) {
      selectLayer(clickedId);
      isDragging = true;
      isInteracting = true;
      dragStartX = pos.x;
      dragStartY = pos.y;
      initialLayerX = current().x;
      initialLayerY = current().y;
      drawEverything();
    } else {
      isInteracting = false;
      drawEverything();
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const pos = getCanvasCoords(e.clientX, e.clientY);
    const dxPercent = ((pos.x - dragStartX) / canvas.width) * 100;
    const dyPercent = ((pos.y - dragStartY) / canvas.height) * 100;

    const l = current();
    if (!l) return;
    l.x = Math.max(0, Math.min(100, Math.round(initialLayerX + dxPercent)));
    l.y = Math.max(0, Math.min(100, Math.round(initialLayerY + dyPercent)));

    $("xSlider").value = l.x;
    $("ySlider").value = l.y;
    drawEverything();
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      isInteracting = false;
      drawEverything();
    }
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const l = current();
    if (!l) return;
    const delta = e.deltaY < 0 ? 4 : -4;
    let newSize = Math.max(20, Math.min(1000, l.size + delta));
    l.size = newSize;
    $("fontSize").value = newSize;
    
    isInteracting = true;
    drawEverything();
    clearTimeout(window.interactionTimeout);
    window.interactionTimeout = setTimeout(() => { isInteracting = false; drawEverything(); }, 800);
  }, { passive: false });

  if ($("stickerSizeSlider")) {
    $("stickerSizeSlider").addEventListener("input", (e) => {
      const l = current();
      if (!l) return;
      l.size = Number(e.target.value);
      $("fontSize").value = l.size;
      $("fontSizeVal").textContent = `${l.size} px`;
      if ($("opacitySlider")) { $("opacitySlider").value = l.opacity !== undefined ? l.opacity : 100; $("opacityVal").textContent = `${$("opacitySlider").value}%`; }
      if ($("stickerShadowToggle") && l.type === "sticker") { $("stickerShadowToggle").checked = !!l.hasShadow; }
      $("stickerSizeVal").textContent = `${l.size} px`;
      isInteracting = true;
      drawEverything();
      clearTimeout(window.interactionTimeout);
      window.interactionTimeout = setTimeout(() => { isInteracting = false; drawEverything(); }, 800);
    });
  }

  function multiplyStickerScale(factor) {
    const l = current();
    if (!l) return;
    l.size = Math.max(20, Math.min(1000, Math.round(l.size * factor)));
    $("fontSize").value = l.size;
    $("fontSizeVal").textContent = `${l.size} px`;
    if ($("opacitySlider")) { $("opacitySlider").value = l.opacity !== undefined ? l.opacity : 100; $("opacityVal").textContent = `${$("opacitySlider").value}%`; }
    if ($("stickerShadowToggle") && l.type === "sticker") { $("stickerShadowToggle").checked = !!l.hasShadow; }
    if ($("stickerSizeSlider")) {
      $("stickerSizeSlider").value = l.size;
      $("stickerSizeVal").textContent = `${l.size} px`;
    }
    isInteracting = true;
    drawEverything();
    showStatus(`تم تغيير حجم الطبقة إلى ${l.size} px`);
    clearTimeout(window.interactionTimeout);
    window.interactionTimeout = setTimeout(() => { isInteracting = false; drawEverything(); }, 800);
  }

  if ($("stickerScaleHalfBtn")) $("stickerScaleHalfBtn").addEventListener("click", () => multiplyStickerScale(0.5));
  if ($("stickerScaleDoubleBtn")) $("stickerScaleDoubleBtn").addEventListener("click", () => multiplyStickerScale(2.0));
  if ($("stickerScaleTripleBtn")) $("stickerScaleTripleBtn").addEventListener("click", () => multiplyStickerScale(3.0));

  if ($("alignLeftBtn")) $("alignLeftBtn").addEventListener("click", () => { const l = current(); if (l && l.type==="text") { l.align = "left"; drawEverything(); } });
  if ($("alignCenterBtn")) $("alignCenterBtn").addEventListener("click", () => { const l = current(); if (l && l.type==="text") { l.align = "center"; drawEverything(); } });
  if ($("alignRightBtn")) $("alignRightBtn").addEventListener("click", () => { const l = current(); if (l && l.type==="text") { l.align = "right"; drawEverything(); } });

  if ($("boldToggleBtn")) $("boldToggleBtn").addEventListener("click", () => { const l = current(); if (l && l.type==="text") { l.bold = !l.bold; drawEverything(); showStatus(`خط عريض: ${l.bold ? "مفعل" : "معطل"}`); } });
  if ($("italicToggleBtn")) $("italicToggleBtn").addEventListener("click", () => { const l = current(); if (l && l.type==="text") { l.italic = !l.italic; drawEverything(); showStatus(`خط مائل: ${l.italic ? "مفعل" : "معطل"}`); } });

  if ($("centerPosBtn")) $("centerPosBtn").addEventListener("click", () => { const l = current(); if (l) { l.x = 50; l.y = 50; $("xSlider").value = 50; $("ySlider").value = 50; drawEverything(); showStatus("تم تموضع الطبقة في المنتصف تماماً 🎯"); } });
  if ($("centerStickerBtn")) $("centerStickerBtn").addEventListener("click", () => { const l = current(); if (l) { l.x = 50; l.y = 50; $("xSlider").value = 50; $("ySlider").value = 50; drawEverything(); showStatus("تم تمركز الملصق في المنتصف 🎯"); } });

  if ($("opacitySlider")) {
    $("opacitySlider").addEventListener("input", (e) => {
      const l = current();
      if (!l) return;
      l.opacity = Number(e.target.value);
      $("opacityVal").textContent = `${l.opacity}%`;
      drawEverything();
    });
  }

  if ($("flipHBtn")) $("flipHBtn").addEventListener("click", () => { const l = current(); if (l && l.type==="sticker") { l.flipH = !l.flipH; drawEverything(); showStatus("تم الانعكاس الأفقي للملصق"); } });
  if ($("flipVBtn")) $("flipVBtn").addEventListener("click", () => { const l = current(); if (l && l.type==="sticker") { l.flipV = !l.flipV; drawEverything(); showStatus("تم الانعكاس الرأسي للملصق"); } });

  if ($("stickerShadowToggle")) {
    $("stickerShadowToggle").addEventListener("change", (e) => {
      const l = current();
      if (l && l.type === "sticker") { l.hasShadow = e.target.checked; drawEverything(); }
    });
  }

  if ($("saveProjectBtn")) {
    $("saveProjectBtn").addEventListener("click", () => {
      const projectData = {
        version: "8.1",
        ratio,
        brightness,
        filterIntensity,
        bgBlur,
        vignetteVal,
        contrastVal,
        saturationVal,
        activePreset,
        bgBase64,
        layers: layers.map(l => {
          const { imgElement, ...rest } = l;
          return rest;
        })
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `arabic_designer_project_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showStatus("تم حفظ ملف المشروع (JSON) بنجاح! 📁");
    });
  }

  if ($("loadProjectInput")) {
    $("loadProjectInput").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const project = JSON.parse(event.target.result);
          if (!project.layers) throw new Error("ملف مشروع غير صالح");
          layers.length = 0;
          project.layers.forEach(l => {
            if (l.type === "sticker" && !l.isEmoji && l.content) {
              const img = new Image();
              img.onload = () => drawEverything();
              img.src = l.content;
              l.imgElement = img;
            }
            layers.push(l);
          });
          if (project.ratio) setRatio(project.ratio);
          if (project.brightness) $("bgBrightness").value = project.brightness;
          if (project.bgBase64) {
            bgBase64 = project.bgBase64;
            const img = new Image();
            img.onload = () => drawEverything();
            img.src = bgBase64;
            backgroundImage = img;
          }
          activeLayerId = layers[0] ? layers[0].id : null;
          syncControls();
          syncColorControls();
          renderLayerList();
          drawEverything();
          showStatus("تم فتح المشروع بنجاح! 📂✨");
        } catch (err) {
          showStatus("خطأ في قراءة ملف المشروع.", true);
        }
      };
      reader.readAsText(file);
    });
  }

  if ($("gradientToggle")) {
    $("gradientToggle").addEventListener("change", (e) => {
      const l = current();
      if (l && l.type === "text") {
        l.useGradient = e.target.checked;
        $("gradientColorsGroup").style.display = l.useGradient ? "grid" : "none";
        drawEverything();
      }
    });
  }

  if ($("gradColor1")) {
    $("gradColor1").addEventListener("input", (e) => {
      const l = current();
      if (l && l.type === "text") {
        l.gradColor1 = e.target.value;
        drawEverything();
      }
    });
  }

  if ($("gradColor2")) {
    $("gradColor2").addEventListener("input", (e) => {
      const l = current();
      if (l && l.type === "text") {
        l.gradColor2 = e.target.value;
        drawEverything();
      }
    });
  }

  // === APP INIT ORDER ===
  renderStylePresets();
  renderStickersGrid();

  // Try loading saved state first
  const restored = loadFromLocalStorage();
  if (!restored) {
    setRatio("landscape");
    selectLayer(layers[0].id);
    showStatus("المصمم العربي V8.1 (الحفظ التلقائي في LocalStorage) جاهز بالكامل!");
  }
})();
