const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) =>
  "₱" +
  Number(n).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmt = (n) =>
  Number(n).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const CATS = [
  ["Fabrics", "Cottons, linens, silks, and more by the yard."],
  ["Threads", "Spools and skeins for every stitch."],
  ["Buttons", "Shell, wood, metal, and resin buttons."],
  ["Zippers", "Standard, invisible, and heavy-duty zips."],
  ["Needles", "Hand, machine, and specialty needles."],
  ["Ribbons", "Satin, grosgrain, and velvet ribbons."],
  ["Lace", "Delicate lace trims and edgings."],
  ["Tools", "Scissors, gauges, pins, and cutting mats."],
  ["Notions", "Elastic, interfacing, snaps, and small essentials."],
];
const categories = CATS.map((c, i) => ({
  category_id: i + 1,
  category_name: c[0],
  description: c[1],
}));
const HUE = {
  Fabrics: 310,
  Threads: 270,
  Buttons: 30,
  Zippers: 200,
  Needles: 220,
  Ribbons: 340,
  Lace: 350,
  Tools: 160,
  Notions: 50,
};
function img(cat, i, t) {
  const h = (HUE[cat] + i * 23) % 360,
    p = i % 4;
  const sh =
    p == 0
      ? `<path d="M0 40L200 0M0 100L200 60M0 160L200 120" stroke="#fff" stroke-opacity=".35" stroke-width="14"/>`
      : p == 1
        ? `<circle cx="100" cy="100" r="48" fill="#fff" fill-opacity=".4"/><circle cx="100" cy="100" r="18" fill="hsl(${h},50%,35%)"/>`
        : p == 2
          ? `<g stroke="#fff" stroke-opacity=".4" stroke-width="6"><path d="M40 0v200M100 0v200M160 0v200M0 40h200M0 100h200M0 160h200"/></g>`
          : `<ellipse cx="100" cy="100" rx="70" ry="30" fill="#fff" fill-opacity=".4" transform="rotate(-30 100 100)"/>`;
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},75%,82%)"/><stop offset="1" stop-color="hsl(${(h + 50) % 360},70%,68%)"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/>${sh}</svg>`,
    )
  );
}
let products = typeof SEED !== "undefined" ? SEED.map((p) => ({ ...p })) : [];
let orders = [],
  orderItems = [],
  inquiries = [],
  feedbacks = [];
const cn = (id) =>
  categories.find((c) => c.category_id == id)?.category_name || "";
const status = (p) =>
  p.stock_quantity <= 0 || !p.is_available
    ? "out"
    : p.stock_quantity < 5
      ? "low"
      : "in";
function closeAll() {
  $$(".drawer,.modal").forEach((e) => e.classList.remove("on"));
  $("#veil").classList.remove("on");
}
function toast(t) {
  const e = $("#toast");
  e.textContent = t;
  e.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove("on"), 2600);
}
function mask(n) {
  return n
    .split(/\s+/)
    .map((w) =>
      w.length > 2
        ? w[0] + "*".repeat(w.length - 2) + w.slice(-1)
        : w.length == 2
          ? w[0] + "*"
          : "*",
    )
    .join(" ");
}
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const KEY = "pw_state_v6";
function save() {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ products, orders, inquiries, feedbacks }),
    );
  } catch (e) {}
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (!d || !d.products) return false;
    products = d.products;
    orders = d.orders.map((o) => ({
      ...o,
      order_date: new Date(o.order_date),
    }));
    inquiries = d.inquiries.map((q) => ({
      ...q,
      created_at: new Date(q.created_at),
    }));
    feedbacks = d.feedbacks;
    return true;
  } catch (e) {
    return false;
  }
}
feedbacks.forEach((f) => (f.customer_name = mask(f.customer_name)));
if (!load()) save();
