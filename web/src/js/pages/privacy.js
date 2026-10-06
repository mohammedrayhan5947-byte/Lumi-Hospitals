import { boot } from "../core.js";
import "../../css/pages/privacy.css";
import { PRIVACY } from "../../data/legal.js";
import { $, btn } from "../render.js";
import { legalPage, bindLegal } from "../legal-page.js";
import { initConsent } from "../consent.js";

boot(() => {
  $("main").innerHTML = legalPage(PRIVACY, {
    heroExtra: `<div class="btn-row lg-cta" data-reveal>${btn("/grievance.html#request", "Make a data request", "accent", { ic: "shield" })}<button type="button" class="btn btn--line" data-consent-open><span>Privacy choices</span></button></div>`
  });
  bindLegal(PRIVACY);
  initConsent(); // idempotent; safe once core.js also calls it
});
