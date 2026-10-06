import sharp from "sharp"; import { readdirSync } from "node:fs";
const files = readdirSync("raw").filter(f => f.endsWith(".jpg")).sort((a, b) => parseInt(a) - parseInt(b));
const W = 260, H = 180, cols = 7;
const tiles = await Promise.all(files.map(async (f, i) => {
  const img = await sharp("raw/" + f).resize(W, H, { fit: "cover" }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="${H}"><rect width="44" height="28" fill="#000"/><text x="6" y="21" font-size="20" fill="#fff" font-family="Arial">${parseInt(f)}</text></svg>`);
  return { input: await sharp(img).composite([{ input: label }]).toBuffer(), left: (i % cols) * W, top: Math.floor(i / cols) * H };
}));
await sharp({ create: { width: cols * W, height: Math.ceil(files.length / cols) * H, channels: 3, background: "#fff" } }).composite(tiles).jpeg().toFile(".shots/contact.jpg");
for (const f of files) { const m = await sharp("raw/" + f).metadata(); process.stdout.write(`${parseInt(f)}:${m.width}x${m.height} `); }
