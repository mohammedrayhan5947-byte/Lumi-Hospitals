// Hospital identity used wherever the DB-backed ClinicSettings row hasn't loaded yet
// (print templates, notifications). Values come from prisma/lumi-data.json, which
// `npm run sync:site` exports from the website's src/data/site.js. Edit the website data
// (or Website Content → Settings in this CRM), not this file.
import data from "../../prisma/lumi-data.json"

export const CLINIC_INFO = {
  name: data.biz.name,
  address: data.biz.address,
  landmark: "",
  phone: data.biz.phone,
  email: data.biz.email,
  tagline: data.biz.tagline,
}
