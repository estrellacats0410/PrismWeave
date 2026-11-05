let admin = null,
  cart = {};
function route() {
  $("#adm").classList.toggle("hide", !admin);
  closeAll();
  if (admin) dash();
  else {
    $("#ml").classList.add("on");
    $("#veil").classList.add("on");
  }
}
function login() {
  if ($("#lu").value == "admin" && $("#lp").value == "admin123") {
    admin = { name: "Kim" };
    closeAll();
    route();
  } else
    $("#le").textContent =
      "Username or password is incorrect. Demo login: admin / admin123.";
}
const SL = {
    pending: "Pending",
    replied: "Replied",
  },
  SC = {
    pending: "badge-pending",
    replied: "badge-replied",
  };
function openMsgs() {
  $("#mlist").innerHTML = inquiries.length
    ? [...inquiries]
        .reverse()
        .map((q) => {
          const s = q.status || "pending";
          return `<div class="rc"><div class="row"><b>${esc(q.item)} · ${money(q.price)}</b><span class="status-badge ${SC[s]}">${SL[s]}</span>
          </div>From: ${esc(q.customer_name)} · ${esc(q.customer_email)}${q.customer_phone ? " · " + esc(q.customer_phone) : ""}
          <br><span style="color:#6b6580">${q.created_at.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
          </span><div style="margin-top:.4rem;white-space:pre-wrap">${esc(q.message)}</div><div class="acts" style="justify-content:flex-start;margin-top:.6rem">
          ${s != "replied" ? `<button class="btn sm ghost" onclick="setStatus(${q.inquiry_id},'replied')">Mark as replied</button>` : ""}
         ${s != "pending" ? `<button class="btn sm ghost" onclick="setStatus(${q.inquiry_id},'pending')">Reset to pending</button>` : ""}</div></div>`;
        })
        .join("")
    : '<p class="empty">No customer messages yet.</p>';
  $("#mm").classList.add("on");
  $("#veil").classList.add("on");
}
function setStatus(id, s) {
  const q = inquiries.find((x) => x.inquiry_id == id);
  if (q) {
    q.status = s;
    save();
    openMsgs();
    dash();
  }
}
function logout() {
  admin = null;
  location.href = "index.html";
}
let range = "weekly";
function invList() {
  const v = $("#isort")?.value || "az",
    s = [...products];
  ({
    az: () => s.sort((a, b) => a.title.localeCompare(b.title)),
    lo: () => s.sort((a, b) => a.price - b.price),
    hi: () => s.sort((a, b) => b.price - a.price),
    stk: () => s.sort((a, b) => a.stock_quantity - b.stock_quantity),
    stkh: () => s.sort((a, b) => b.stock_quantity - a.stock_quantity),
  })[v]();
  return s;
}
function dash() {
  $("#an").textContent = admin.name;
  $("#mc").textContent = inquiries.filter(
    (q) => (q.status || "pending") == "pending",
  ).length;
  const days = range == "weekly" ? 7 : 30,
    since = Date.now() - days * 864e5;
  const sales = orders
    .filter((o) => +o.order_date >= since)
    .reduce((a, o) => a + o.total_amount, 0);
  $("#stats").innerHTML =
    `<div class="stat-card"><span class="stat-label">Total Products</span><span class="stat-value">${products.length}</span></div><div class="stat-card"><span class="stat-label">Low Stock (under 5)</span><span class="stat-value">${products.filter((p) => p.stock_quantity < 5).length}</span></div><div class="stat-card"><span class="stat-label">Orders</span><span class="stat-value">${orders.length}</span></div><div class="stat-card"><span class="stat-label">Sales <select onchange="range=this.value;dash()"><option value="weekly" ${range == "weekly" ? "selected" : ""}>Weekly</option><option value="monthly" ${range == "monthly" ? "selected" : ""}>Monthly</option></select></span><span class="stat-value">${money(sales)}</span></div>`;
  $("#inv").innerHTML =
    (products.length
      ? ""
      : '<tr><td colspan="6" class="empty">No products yet. Use “Add New Product” to start.</td></tr>') +
    invList()
      .map((p) => {
        const s = status(p);
        return `<tr><td>${p.title}</td><td>${cn(p.category_id)}</td><td>${money(p.price)}</td><td>${p.stock_quantity}</td><td><span class="status-badge ${{ in: "available", low: "low-stock", out: "out-stock" }[s]}">${{ in: "In Stock", low: "Low Stock", out: "Out of Stock" }[s]}</span></td><td><button class="btn sm ghost" onclick="editP(${p.product_id})">Edit</button></td></tr>`;
      })
      .join("");
  $("#rcs").innerHTML =
    (orders.length ? "" : '<p class="empty">No orders yet.</p>') +
    [...orders]
      .sort((a, b) => b.order_date - a.order_date)
      .map(
        (o) =>
          `<div class="rc"><b>${o.order_number}</b> · ${o.order_date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}<div style="margin:.35rem 0">${o.items.map((i) => `<div style="display:flex;justify-content:space-between;gap:.5rem"><span>${i.title}</span><span>${i.quantity} x ${fmt(i.unit_price)}</span></div>`).join("")}</div><b>Total: ${fmt(o.total_amount)}</b> · Staff ${o.created_by_staff_id}</div>`,
      )
      .join("");
}
function editP(id) {
  $("#pc").innerHTML = categories
    .map((c) => `<option value="${c.category_id}">${c.category_name}</option>`)
    .join("");
  const p = products.find((x) => x.product_id == id);
  $("#mpt").textContent = p ? "Edit Product" : "Add New Product";
  $("#pid").value = id || "";
  $("#pn").value = p?.title || "";
  $("#pc").value = p?.category_id || 1;
  $("#pp").value = p?.price || "";
  $("#ps").value = p?.stock_quantity ?? "";
  $("#pd").value = p?.description || "";
  newImg = null;
  $("#pf").value = "";
  $("#pv").style.display = p ? "block" : "none";
  if (p) $("#pv").src = p.image_url;
  $("#pdel").classList.toggle("hide", !p);
  $("#mp").classList.add("on");
  $("#veil").classList.add("on");
}
let newImg = null;
$("#pf").onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 480 / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = im.width * k;
      c.height = im.height * k;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      newImg = c.toDataURL("image/jpeg", 0.8);
      $("#pv").src = newImg;
      $("#pv").style.display = "block";
    };
    im.src = r.result;
  };
  r.readAsDataURL(f);
};
function saveP() {
  const t = $("#pn").value.trim(),
    pr = +$("#pp").value,
    st = +$("#ps").value;
  if (!t || !(pr >= 0) || !(st >= 0) || $("#ps").value === "") {
    toast("Title, price, and stock are required.");
    return;
  }
  let p = products.find((x) => x.product_id == $("#pid").value);
  const cid = +$("#pc").value;
  if (!p) {
    p = { product_id: Math.max(0, ...products.map((x) => x.product_id)) + 1 };
    products.unshift(p);
    p.image_url = img(cn(cid), p.product_id, t);
  }
  Object.assign(p, {
    title: t,
    category_id: cid,
    price: pr,
    stock_quantity: st,
    is_available: st > 0,
    description: $("#pd").value || t,
  });
  if (newImg) p.image_url = newImg;
  save();
  closeAll();
  dash();
  toast("Product saved");
}
let delId = 0;
function askDel() {
  delId = +$("#pid").value;
  const p = products.find((x) => x.product_id == delId);
  $("#mdt").textContent = p
    ? `“${p.title}” will be removed from the catalog and inventory.`
    : "";
  $("#mp").classList.remove("on");
  $("#md").classList.add("on");
}
function doDel() {
  products = products.filter((p) => p.product_id != delId);
  save();
  closeAll();
  dash();
  toast("Product deleted");
}
function openPos() {
  cart = {};
  $("#pos").classList.add("on");
  posR();
}
function closePos() {
  $("#pos").classList.remove("on");
}
function posR() {
  const q = $("#pq").value.toLowerCase();
  $("#pg").innerHTML = products
    .filter((p) => p.title.toLowerCase().includes(q))
    .slice(0, 60)
    .map(
      (p) =>
        `<button class="card" onclick="add(${p.product_id})"><img src="${p.image_url}" alt=""><h4>${p.title}</h4><div class="row"><span class="price" style="font-size:.9rem">${money(p.price)}</span><span class="stk ${p.stock_quantity ? "" : "out"}">${p.stock_quantity} left</span></div></button>`,
    )
    .join("");
  cartR();
}
$("#pq").oninput = posR;
function add(id) {
  const p = products.find((x) => x.product_id == id);
  if ((cart[id] || 0) >= p.stock_quantity) {
    toast("No more stock for " + p.title);
    return;
  }
  cart[id] = (cart[id] || 0) + 1;
  cartR();
}
function setQ(id, v) {
  const p = products.find((x) => x.product_id == id);
  v = Math.max(0, Math.min(+v || 0, p.stock_quantity));
  if (v) cart[id] = v;
  else delete cart[id];
  cartR();
}
function cartR() {
  const ids = Object.keys(cart);
  let t = 0;
  $("#ci").innerHTML = ids.length
    ? ids
        .map((i) => {
          const p = products.find((x) => x.product_id == i);
          t += p.price * cart[i];
          return `<div class="ci"><span>${p.title} <b>${cart[i]} x ${fmt(p.price)}</b></span><span class="qb"><button onclick="setQ(${i},${cart[i] - 1})" aria-label="Decrease quantity">−</button><button onclick="setQ(${i},${cart[i] + 1})" aria-label="Increase quantity">+</button><button onclick="setQ(${i},0)" aria-label="Remove item">✕</button></span></div>`;
        })
        .join("")
    : '<p class="empty">Tap items to add them to the order.</p>';
  $("#ct").textContent = "Total: " + fmt(t);
}
function checkout() {
  const ids = Object.keys(cart);
  if (!ids.length) {
    toast("Add at least one item first.");
    return;
  }
  let tot = 0;
  const its = ids.map((i) => {
    const p = products.find((x) => x.product_id == i),
      q = cart[i];
    p.stock_quantity -= q;
    p.is_available = p.stock_quantity > 0;
    tot += q * p.price;
    return {
      product_id: p.product_id,
      title: p.title,
      quantity: q,
      unit_price: p.price,
    };
  });
  const n = orders.length + 1;
  orders.push({
    order_id: n,
    order_number: "PW-" + (1000 + n),
    order_date: new Date(),
    total_amount: tot,
    created_by_staff_id: "AD-01",
    items: its,
  });
  const low = its.filter(
    (i) =>
      products.find((p) => p.product_id == i.product_id).stock_quantity < 5,
  ).length;
  save();
  closePos();
  dash();
  toast(
    low
      ? `Order recorded. ${low} item(s) now low on stock.`
      : "Order recorded. Inventory updated.",
  );
}
route();
