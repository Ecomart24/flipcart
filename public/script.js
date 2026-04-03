const products = [
  { id: 1, emoji: "📱", name: "Smartphone X1", price: 14999, mrp: 17999 },
  { id: 2, emoji: "🎧", name: "Wireless Headphones", price: 1999, mrp: 2999 },
  { id: 3, emoji: "⌚", name: "Smart Watch", price: 2499, mrp: 3999 },
  { id: 4, emoji: "💻", name: "Laptop Air 14", price: 42999, mrp: 48999 },
  { id: 5, emoji: "🧳", name: "Travel Bag", price: 1199, mrp: 1899 },
  { id: 6, emoji: "📷", name: "Action Camera", price: 7999, mrp: 9999 },
];

const cart = new Map();

const productGrid = document.getElementById("product-grid");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartItems = document.getElementById("cart-items");
const cartToggle = document.getElementById("cart-toggle");
const cartClose = document.getElementById("cart-close");
const cartDrawer = document.getElementById("cart-drawer");
const checkoutForm = document.getElementById("checkout-form");
const orderMessage = document.getElementById("order-message");

function formatINR(value) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (p) => `
      <article class="product-card">
        <div class="product-image">${p.emoji}</div>
        <div class="product-content">
          <h4>${p.name}</h4>
          <div class="price-line">
            <span class="price">${formatINR(p.price)}</span>
            <span class="mrp">${formatINR(p.mrp)}</span>
          </div>
          <button class="btn btn-primary" data-add="${p.id}" type="button">Add to Cart</button>
        </div>
      </article>
    `,
    )
    .join("");
}

function syncCartMeta() {
  let count = 0;
  let total = 0;

  cart.forEach((item) => {
    count += item.qty;
    total += item.qty * item.price;
  });

  cartCount.textContent = String(count);
  cartTotal.textContent = formatINR(total);

  if (cart.size === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItems.innerHTML = [...cart.values()]
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item-top">
          <strong>${item.name}</strong>
          <button class="btn btn-ghost" data-remove="${item.id}" type="button">Remove</button>
        </div>
        <div>${formatINR(item.price)}</div>
        <div class="qty-row">
          <button class="btn btn-ghost" data-dec="${item.id}" type="button">-</button>
          <span>Qty: ${item.qty}</span>
          <button class="btn btn-ghost" data-inc="${item.id}" type="button">+</button>
        </div>
      </div>
    `,
    )
    .join("");
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const current = cart.get(id);
  if (current) {
    current.qty += 1;
  } else {
    cart.set(id, { ...product, qty: 1 });
  }
  syncCartMeta();
}

function updateQty(id, delta) {
  const current = cart.get(id);
  if (!current) return;

  current.qty += delta;
  if (current.qty <= 0) {
    cart.delete(id);
  }
  syncCartMeta();
}

function removeFromCart(id) {
  cart.delete(id);
  syncCartMeta();
}

productGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const addId = target.getAttribute("data-add");
  if (!addId) return;
  addToCart(Number(addId));
});

cartItems.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const removeId = target.getAttribute("data-remove");
  if (removeId) {
    removeFromCart(Number(removeId));
    return;
  }

  const incId = target.getAttribute("data-inc");
  if (incId) {
    updateQty(Number(incId), 1);
    return;
  }

  const decId = target.getAttribute("data-dec");
  if (decId) {
    updateQty(Number(decId), -1);
  }
});

cartToggle.addEventListener("click", () => {
  cartDrawer.classList.toggle("hidden");
  cartDrawer.setAttribute(
    "aria-hidden",
    cartDrawer.classList.contains("hidden") ? "true" : "false",
  );
});

cartClose.addEventListener("click", () => {
  cartDrawer.classList.add("hidden");
  cartDrawer.setAttribute("aria-hidden", "true");
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  orderMessage.textContent = "";

  if (cart.size === 0) {
    orderMessage.style.color = "#b91c1c";
    orderMessage.textContent = "Add at least one item to cart before placing order.";
    return;
  }

  const cardNumber = document.getElementById("card-number").value.replace(/\s/g, "");
  const cardExpiry = document.getElementById("card-expiry").value.trim();
  const cardCvv = document.getElementById("card-cvv").value.trim();

  if (!/^\d{16}$/.test(cardNumber)) {
    orderMessage.style.color = "#b91c1c";
    orderMessage.textContent = "Enter a valid 16-digit card number.";
    return;
  }

  if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    orderMessage.style.color = "#b91c1c";
    orderMessage.textContent = "Enter expiry in MM/YY format.";
    return;
  }

  if (!/^\d{3}$/.test(cardCvv)) {
    orderMessage.style.color = "#b91c1c";
    orderMessage.textContent = "Enter a valid 3-digit CVV.";
    return;
  }

  const orderId = `ORD${Math.floor(Math.random() * 900000 + 100000)}`;
  orderMessage.style.color = "#0f7a28";
  orderMessage.textContent = `Order placed successfully. Order ID: ${orderId}`;

  cart.clear();
  syncCartMeta();
  checkoutForm.reset();
});

document.getElementById("card-number").addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const digits = target.value.replace(/\D/g, "").slice(0, 16);
  target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
});

document.getElementById("card-expiry").addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const digits = target.value.replace(/\D/g, "").slice(0, 4);
  target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

document.getElementById("card-cvv").addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  target.value = target.value.replace(/\D/g, "").slice(0, 3);
});

renderProducts();
syncCartMeta();

