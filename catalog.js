let ui = { q: "", sort: "az" },
  cur = null;
const sortFn = {
  az: (a, b) => a.title.localeCompare(b.title),
  lo: (a, b) => a.price - b.price,
  hi: (a, b) => b.price - a.price,
  av: (a, b) =>
    (status(b) == "out" ? 0 : 1) - (status(a) == "out" ? 0 : 1) ||
    a.title.localeCompare(b.title),
};
function box(p) {
  return `<div class="box" tabindex="0" role="button" onclick="openP(${p.product_id})" onkeydown="if(event.key=='Enter')openP(${p.product_id})"><img src="${p.image_url}" class="pre-product" alt="${esc(p.title)}" width="150" height="150"><p class="itemtitle">${esc(p.title)}</p><p class="pre-price">${money(p.price)}</p></div>`;
}
function render() {
  const q = ui.q.toLowerCase(),
    f = (p) =>
      !q ||
      (p.title + " " + cn(p.category_id) + " " + p.description)
        .toLowerCase()
        .includes(q),
    srt = (a) => [...a].sort(sortFn[ui.sort]);
  const all = products.filter(f);
  let h = "";
  categories.forEach((c) => {
    const l = srt(all.filter((p) => p.category_id == c.category_id));
    if (l.length)
      h += `<section id="category${c.category_id}" class="section2"><h1>${c.category_name}</h1><div class="second-category-items">${l.map(box).join("")}</div></section>`;
  });
  $("#catalog").innerHTML =
    h ||
    (products.length
      ? '<div class="empty">No products match your search. Try a different word.</div>'
      : '<div class="empty">No products yet. Please check back soon.</div>');
}
$(".dropdown-menu").innerHTML =
  '<a href="#products">All Categories</a>' +
  categories
    .map((c) => `<a href="#category${c.category_id}">${c.category_name}</a>`)
    .join("");
$("#q").oninput = (e) => {
  ui.q = e.target.value;
  render();
};
$("#so").onchange = (e) => {
  ui.sort = e.target.value;
  render();
};
function openP(id) {
  cur = products.find((p) => p.product_id == id);
  const p = cur,
    o = status(p) == "out";
  $("#dr").innerHTML =
    `<button class="x" onclick="closeAll()" aria-label="Close">✕</button><img src="${p.image_url}" alt="${esc(p.title)}"><h2 style="margin:.8rem 0 .2rem">${esc(p.title)}</h2><span class="badge">${cn(p.category_id)}</span><p>${esc(p.description)}</p><div class="row"><span class="price" style="font-size:1.6rem">${money(p.price)}</span><b class="stk ${o ? "out" : ""}">${o ? "Out of stock" : p.stock_quantity + " left in stock"}</b></div><br><button class="btn" id="inqb" onclick="openInq()">Inquire / Ask Seller About This Item</button>`;
  $("#dr").classList.add("on");
  $("#veil").classList.add("on");
}
function openInq() {
  $("#mit").textContent = "About: " + cur.title;
  $("#mi").classList.add("on");
  $("#in1").focus();
}
function closeInq() {
  $("#mi").classList.remove("on");
  $("#inqb")?.focus();
}
function sendInq() {
  if (
    !$("#in1").value.trim() ||
    !/\S+@\S+/.test($("#in2").value) ||
    !$("#in4").value.trim()
  ) {
    toast("Add your name, a valid email, and a message.");
    return;
  }
  inquiries.push({
    inquiry_id: inquiries.length + 1,
    status: "pending",
    product_id: cur.product_id,
    item: cur.title,
    price: cur.price,
    customer_name: $("#in1").value,
    customer_email: $("#in2").value,
    customer_phone: $("#in3").value,
    message: $("#in4").value,
    created_at: new Date(),
  });
  ["#in1", "#in2", "#in3", "#in4"].forEach((s) => ($(s).value = ""));
  save();
  toast("Your message has been sent!");
  closeInq();
}
function sendFb() {
  const c = $("#fb").value.trim(),
    n = $("#fn").value.trim();
  if (!n || !c) {
    toast("Add your name and your feedback.");
    return;
  }
  feedbacks.push({ customer_name: mask(n), rating: null, comment: c });
  $("#fb").value = "";
  $("#fn").value = "";
  save();
  mq();
  toast("Thank you for your feedback!");
}
function mq() {
  const h = feedbacks.length
    ? feedbacks
        .map((f) => `<span>“${f.comment}” — ${f.customer_name}</span>`)
        .join("")
    : "<span>No feedback yet. Be the first to share yours!</span>";
  $("#mq").innerHTML = h + h;
}
render();
mq();
