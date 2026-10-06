// Stock photography credits. All images are Pexels License or Unsplash License (free for commercial use).
// Licence verified on each photo page on 2026-10-01. Originals are in /raw-stock.
const s = (slot, alt, credit, url, focal = "50% 40%") => ({
  src: `/img/stock/${slot}.webp`,
  sm: `/img/stock/${slot}-sm.webp`,
  alt, credit, url, focal,
});

export const STOCK = {
  "dept-cardiology": s("dept-cardiology", "Doctor listening to a patient's heart with a stethoscope during a clinic check-up", "Imad Clicks / Pexels", "https://www.pexels.com/photo/14558557/", "60% 45%"),
  "dept-neurology": s("dept-neurology", "Young man in glasses holding his forehead with a headache", "Towfiqu barbhuiya / Pexels", "https://www.pexels.com/photo/11091976/", "55% 35%"),
  "dept-orthopaedics": s("dept-orthopaedics", "Physiotherapist guiding a patient through a leg rehabilitation exercise", "World Sikh Organization of Canada / Pexels", "https://www.pexels.com/photo/14797757/", "50% 40%"),
  "dept-obgyn": s("dept-obgyn", "Grandmother cradling a newborn baby in a hospital room", "Shifa Parmar / Pexels", "https://www.pexels.com/photo/39537314/", "45% 40%"),
  "dept-paediatrics": s("dept-paediatrics", "Doctor gently checking a young boy's ear with an otoscope", "Mike Sangma / Pexels", "https://www.pexels.com/photo/7179255/", "35% 45%"),
  "dept-general-medicine": s("dept-general-medicine", "Doctor examining a senior man with a stethoscope in a consultation room", "World Sikh Organization of Canada / Pexels", "https://www.pexels.com/photo/18870282/", "55% 40%"),
  "dept-pulmonology": s("dept-pulmonology", "Doctor listening to a patient's lungs with a stethoscope on the back", "Thirdman / Pexels", "https://www.pexels.com/photo/5327586/", "60% 40%"),
  "dept-nephro-uro": s("dept-nephro-uro", "Dialysis machine beside a treatment chair in a calm, clean room", "Ezebunwo Omachi / Unsplash", "https://unsplash.com/photos/su-Lv2OJuY0", "55% 50%"),
  "dept-gastro": s("dept-gastro", "Doctor performing an abdominal ultrasound scan", "Jorge Chan / Pexels", "https://www.pexels.com/photo/16388112/", "55% 40%"),
  "dept-diagnostics": s("dept-diagnostics", "Doctor reassuring a patient lying on the MRI scanner table", "Charlss GonzHu / Pexels", "https://www.pexels.com/photo/15277947/", "45% 45%"),
  "people-consult": s("people-consult", "Doctor explaining a spine model to a young patient during a consultation", "World Sikh Organization of Canada / Pexels", "https://www.pexels.com/photo/14797760/", "50% 45%"),
  "people-nurse": s("people-nurse", "Caring hand holding an elderly patient's hand fitted with a pulse oximeter", "Muskan Anand / Pexels", "https://www.pexels.com/photo/3934328/", "55% 45%"),
  "people-family": s("people-family", "Indian grandparents laughing with their grandson in a garden", "Sagar Ahire / Pexels", "https://www.pexels.com/photo/18394078/", "50% 40%"),
  "people-elderly": s("people-elderly", "Smiling senior man in an orange turban", "VARAN NM / Pexels", "https://www.pexels.com/photo/6472469/", "65% 30%"),
  "people-team": s("people-team", "Surgical team operating under bright theatre lights", "Mukul Kumar / Pexels", "https://www.pexels.com/photo/29602696/", "50% 55%"),
  "people-doctor-portrait": s("people-doctor-portrait", "Portrait of a confident South Asian doctor in a white coat with a stethoscope", "Oys Photography / Pexels", "https://www.pexels.com/photo/19438563/", "50% 30%"),
  "post-heart-attack-signs": s("post-heart-attack-signs", "Man clutching his chest with both hands", "Towfiqu barbhuiya / Pexels", "https://www.pexels.com/photo/14569658/", "55% 45%"),
  "post-monsoon-fevers": s("post-monsoon-fevers", "Woman in a sari walking with an umbrella through a rain-soaked lane", "Sk Siddique Ali / Pexels", "https://www.pexels.com/photo/18228801/", "35% 55%"),
  "post-knee-pain": s("post-knee-pain", "Person on a sofa holding a painful knee", "Towfiqu barbhuiya / Pexels", "https://www.pexels.com/photo/11349880/", "60% 50%"),
  "post-pregnancy-first-trimester": s("post-pregnancy-first-trimester", "Smiling pregnant woman holding her bump in a lush garden", "Ashwin Shrigiri / Pexels", "https://www.pexels.com/photo/7522678/", "70% 40%"),
  "post-diabetes-plate": s("post-diabetes-plate", "Home-style Indian thali with chapati, dal, bhindi, rice and curd", "Rajani33 / Pexels", "https://www.pexels.com/photo/35008222/", "50% 50%"),
  "post-child-fever": s("post-child-fever", "Mother checking her daughter's temperature in bed", "Ron Lach / Pexels", "https://www.pexels.com/photo/9874629/", "40% 45%"),
};
