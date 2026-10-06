import { boot } from "../core.js";
import "../../css/pages/terms.css";
import { TERMS } from "../../data/legal.js";
import { $ } from "../render.js";
import { legalPage, bindLegal } from "../legal-page.js";
import { initConsent } from "../consent.js";

boot(() => {
  $("main").innerHTML = legalPage(TERMS);
  bindLegal(TERMS);
  initConsent();
});
