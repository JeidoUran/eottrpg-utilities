export class UnionGauge {
  static async renderUnionGauge(value, max) {
    // Supprime la jauge précédente
    document.getElementById("union-resource-bar")?.remove();

    const template_file =
      "modules/eottrpg-utilities/templates/union-gauge.hbs";
    const percent = (value / max) * 100;

    const template_data = {
      barFirstColor: "#0E5C5D",
      barSecondColor: "#00EEFF",
      animation: "img-bubbles",
      value,
      max,
      percent,
    };

    const rendered_html = await foundry.applications.handlebars.renderTemplate(
      template_file,
      template_data
    );

    const wrapper = document.createElement("div");
    wrapper.id = "union-resource-bar";
    wrapper.innerHTML = rendered_html;
    wrapper.classList.add("fade-in");
    document.body.appendChild(wrapper);

    let unionGaugeObservers = {
      mo: null,
      ro: null,
      domMo: null,
      boundTarget: null,
      raf: 0,
    };

    function isElementVisible(el) {
      if (!el) return false;

      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
        return false;
      }

      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }


    function hideUnionGauge() {
      const gauge = document.getElementById("union-resource-bar");
      if (!gauge) return;
      gauge.style.opacity = "0";
      gauge.style.pointerEvents = "none";
    }

    function showUnionGauge() {
      const gauge = document.getElementById("union-resource-bar");
      if (!gauge) return;
      gauge.style.opacity = "1";
      gauge.style.pointerEvents = "";
      gauge.classList.add("appear");
    }

    function positionUnionGauge() {
      const gauge = document.getElementById("union-resource-bar");
      const target = document.querySelector(".bg3-hotbar-container")

      if (!gauge || !isElementVisible(target)) {
        hideUnionGauge();
        return false;
      }

      const rect = target.getBoundingClientRect();

      // Mesure la gauge (si elle est opacity:0 ça ne casse pas la mesure)
      const gaugeRect = gauge.getBoundingClientRect();

      const GAP = 70;

      const top = Math.round(rect.top - gaugeRect.height - GAP);
      const left = Math.round(rect.left + (rect.width - gaugeRect.width) / 2); // ou centre si tu préfères

      gauge.style.position = "fixed";
      gauge.style.top = `${top}px`;
      gauge.style.left = `${left}px`;
      gauge.style.zIndex = "21";

      showUnionGauge();
      return true;
    }

    function schedulePosition() {
      cancelAnimationFrame(unionGaugeObservers.raf);
      unionGaugeObservers.raf = requestAnimationFrame(positionUnionGauge);
    }

    function bindToHotbarTarget(target) {
      // Si on est déjà bind sur ce node, rien à faire
      if (unionGaugeObservers.boundTarget === target) return;

      // cleanup anciens observers
      unionGaugeObservers.mo?.disconnect();
      unionGaugeObservers.ro?.disconnect();

      unionGaugeObservers.boundTarget = target;

      // Recalcule dès qu’il y a des changements internes (icônes, lignes, etc.)
      unionGaugeObservers.mo = new MutationObserver(schedulePosition);
      unionGaugeObservers.mo.observe(target, { childList: true, subtree: true, attributes: true });

      // Recalcule si la taille change (multi-lignes)
      unionGaugeObservers.ro = new ResizeObserver(schedulePosition);
      unionGaugeObservers.ro.observe(target);

      // Position initiale
      schedulePosition();
    }

    function watchHotbarLifecycle() {
      // Observer global : détecte la disparition/réapparition de #bg3-hotbar-container
      unionGaugeObservers.domMo?.disconnect();

      unionGaugeObservers.domMo = new MutationObserver(() => {
        const target = document.querySelector(".bg3-hotbar-container")

        if (!target || !isElementVisible(target)) {
          // hotbar absente ou masquée pendant le switch => on cache la gauge
          hideUnionGauge();
          unionGaugeObservers.boundTarget = null; // force rebind quand ça revient
          return;
        }

        // hotbar présente => (re)bind dessus
        bindToHotbarTarget(target);
      });

      unionGaugeObservers.domMo.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // resize fenêtre
      window.addEventListener("resize", schedulePosition);

      // premier bind si déjà là
      const target = document.querySelector(".bg3-hotbar-container");
      if (target && isElementVisible(target)) bindToHotbarTarget(target);
      else hideUnionGauge();
    }

    function tryAttachGauge() {
      const gauge = document.getElementById("union-resource-bar");
      if (!gauge) return false;

      // Petit style pour le hide/show propre
      gauge.style.transition = "opacity 120ms ease";
      watchHotbarLifecycle();
      return true;
    }



    if (!tryAttachGauge()) {
      const observer = new MutationObserver(() => {
        if (tryAttachGauge()) observer.disconnect();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  static async displayUnionGauge() {
    const res = window.pr.api
      .resources()
      .resources.find((r) => r.id === "union");
    if (!res) return;
    await this.renderUnionGauge(res.value, res.max_value);
  }

  static async updateUnionGauge(setting, data) {
    if (setting.key == "eottrpg-utilities.union-display" && setting.value == true) {
      this.displayUnionGauge();
    } else {
      document.getElementById("union-resource-bar")?.remove();
    }
    if (setting.key == "fvtt-party-resources.union") {
      const gaugeEnabled = game.settings.get("eottrpg-utilities", "union-display");
      if (!gaugeEnabled) return;
      const res = window.pr.api
        .resources()
        .resources.find((r) => r.id === "union");
      if (!res) return;
      await this.renderUnionGauge(setting.value, res.max_value);
    }
  }
}
