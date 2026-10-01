/* WhatsApp + email forms. Add to any form:
     <form data-wa="Appointment request"> … fields with name= (optional data-label=) …
       <button type="submit">            → opens WhatsApp with a formatted message
       <button type="button" data-send="email"> → opens the mail client with the same message
       <div class="form-done" hidden>    → shown after sending
   No data leaves the browser except through the visitor's own WhatsApp/email app. */
import { BIZ } from "../data/site.js";
import { $$, wa } from "./render.js";

export function formMessage(form) {
  const lines = [`*${form.dataset.wa}* · ${BIZ.name}`, ""];
  $$("[name]", form).forEach(f => {
    if (f.disabled || (["checkbox", "radio"].includes(f.type) && !f.checked)) return;
    let v = f.value?.trim(); if (!v) return;
    if (f.tagName === "SELECT") v = f.options[f.selectedIndex].text;
    const label = f.dataset.label || f.closest(".field")?.querySelector("label")?.textContent.replace("*", "").trim() || f.name;
    lines.push(`${label}: ${v}`);
  });
  return lines.join("\n");
}

export function bindForms(root = document) {
  $$("form[data-wa]", root).forEach(form => {
    const done = () => { const d = form.querySelector(".form-done"); if (d) { d.hidden = false; d.scrollIntoView({ block: "nearest", behavior: "smooth" }); } };
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      window.open(wa(formMessage(form)), "_blank", "noopener");
      done();
    });
    form.querySelector('[data-send="email"]')?.addEventListener("click", () => {
      if (!form.reportValidity()) return;
      const body = formMessage(form).replace(/\*/g, "");
      location.href = `mailto:${BIZ.email}?subject=${encodeURIComponent(form.dataset.wa + " · " + BIZ.name)}&body=${encodeURIComponent(body)}`;
      done();
    });
  });
}
