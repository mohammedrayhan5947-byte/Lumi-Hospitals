import { boot } from "../core.js";
import "../../css/pages/disclaimer.css";
import { BIZ } from "../../data/site.js";
import { DISCLAIMER } from "../../data/legal.js";
import { $, esc, tel, icon } from "../render.js";
import { legalPage, bindLegal } from "../legal-page.js";
import { initConsent } from "../consent.js";

boot(() => {
  $("main").innerHTML = legalPage(DISCLAIMER, {
    heroExtra: `<a class="ds-em" href="${tel(BIZ.emergency)}" data-reveal><span class="ds-em-ic">${icon("phone")}</span><span><small class="label">24/7 emergency</small><b>${esc(BIZ.emergency)}</b></span><span class="ds-em-alt">or dial <b>112</b> / <b>108</b></span></a>`
  });
  bindLegal(DISCLAIMER);
  initConsent();
});
