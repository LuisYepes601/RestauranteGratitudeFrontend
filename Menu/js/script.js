/* ==========================
       Productos desde backend
   ========================== */

// Variables globales
let PRODUCTS = [];
let cart = JSON.parse(localStorage.getItem("dv_cart") || "[]");
let categories = [];
let filteredProducts = [];

/* ------------------ Helpers ------------------ */
const currency = (v) => "$" + Number(v).toFixed(2);

function saveCart() {
  localStorage.setItem("dv_cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.innerText = count;
    cartCountEl.style.display = count > 0 ? "inline-block" : "none";
  }
}

/* ------------------ Limpiar imagen ------------------ */
function limpiarImagen(valor) {
  if (!valor) return "https://via.placeholder.com/200x200?text=Sin+Imagen";
  return valor.replace(/^"|"$/g, "").trim();
}

/* ------------------ Cargar productos desde backend ------------------ */
async function cargarProductos() {
  try {
    const response = await fetch("http://localhost:8080/producto/obtener/todos");
    if (!response.ok) throw new Error(`Error al obtener productos: ${response.status}`);

    const data = await response.json();
    console.log("📦 Productos cargados:", data);

    PRODUCTS = data.map((p) => ({
      id: String(p.id),
      title: p.nombre || "Sin nombre",
      category: p.categoria?.trim() || "Sin categoría",
      price: p.precio || 0,
      desc: p.descripcion || "Sin descripción",
      img: limpiarImagen(p.imagen),
    }));

    filteredProducts = PRODUCTS.slice();
    renderCategories();
    renderProducts();
  } catch (error) {
    console.error("Error cargando productos:", error);
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          No se pudieron cargar los productos del servidor.
        </div>
      </div>`;
  }
}

/* ------------------ Render categorías ------------------ */
function renderCategories() {
  categories = [...new Set(PRODUCTS.map((p) => p.category))];
  const container = document.getElementById("categoriaList");
  if (!container) return;
  container.innerHTML = "";

  const all = document.createElement("button");
  all.className = "btn category-btn text-start active";
  all.innerText = "Todos";
  all.onclick = () => {
    document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("active"));
    all.classList.add("active");
    filteredProducts = PRODUCTS.slice();
    applyFiltersAndSort();
  };
  container.appendChild(all);

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "btn category-btn text-start";
    btn.innerText = cat;
    btn.onclick = () => {
      document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filteredProducts = PRODUCTS.filter((p) => p.category === cat);
      applyFiltersAndSort();
    };
    container.appendChild(btn);
  });
}

/* ------------------ Render productos ------------------ */
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (filteredProducts.length === 0) {
    grid.innerHTML =
      '<div class="col-12"><div class="alert alert-info">No hay productos disponibles.</div></div>';
    return;
  }

  filteredProducts.forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-3 fade-in";

    col.innerHTML = `
      <div class="p-3 product-card h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge-category">${p.category}</span>
          <small class="text-muted">${currency(p.price)}</small>
        </div>
        <div class="mb-3" style="flex:1">
          <img src="${p.img}" alt="${p.title}" 
            class="img-fluid rounded" style="height:200px; object-fit:cover; width:100%">
          <p class="mt-2 mb-0 text-muted" style="font-size:0.9rem">${p.desc}</p>
        </div>
        <h6 class="mt-2 text-center fw-bold">${p.title}</h6>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-sm w-100" 
            style="background:var(--verde-medio); color:white" 
            onclick="addToCart('${p.id}')">Agregar</button>
          <button class="btn btn-outline-secondary btn-sm" 
            onclick="showQuick('${p.id}')">Detalles</button>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

/* ------------------ Animación visual ------------------ */
function animateProducts() {
  const grid = document.getElementById("productsGrid");
  grid.classList.add("fade-out");

  setTimeout(() => {
    renderProducts();
    grid.classList.remove("fade-out");
    grid.classList.add("fade-in");

    setTimeout(() => {
      grid.classList.remove("fade-in");
    }, 400);
  }, 300);
}

/* ------------------ Filtros ------------------ */
function filtrarPorTitulo(texto) {
  const query = texto.toLowerCase().trim();
  filteredProducts = query
    ? PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    )
    : PRODUCTS.slice();
  applyFiltersAndSort();
}

function filtrarPorPrecio(min, max) {
  filteredProducts = PRODUCTS.filter(
    (p) => p.price >= (min || 0) && p.price <= (max || Infinity)
  );
  applyFiltersAndSort();
}

/* ------------------ Ordenamiento ------------------ */
function sortProducts() {
  const sortSelect = document.getElementById("sortSelect");
  const sortValue = sortSelect ? sortSelect.value : "default";
  if (sortValue === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }
  // "default" sorting keeps the original order
}

/* ------------------ Aplicar filtros y ordenamiento ------------------ */
function applyFiltersAndSort() {
  // Start with all products
  filteredProducts = PRODUCTS.slice();

  // Apply title filter
  const searchInput = document.getElementById("searchInput");
  if (searchInput && searchInput.value) {
    const query = searchInput.value.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  // Apply category filter
  const activeCategoryBtn = document.querySelector(".category-btn.active");
  const selectedCategory = activeCategoryBtn ? activeCategoryBtn.innerText : "Todos";
  if (selectedCategory !== "Todos") {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory);
  }

  // Apply price range filter
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");
  const minPrice = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
  const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;
  if (minPrice > 0 || maxPrice < Infinity) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice
    );
  }

  // Apply sorting
  sortProducts();

  // Render the filtered and sorted products
  animateProducts();
}

/* ------------------ Carrito ------------------ */
function addToCart(productId) {
  const prod = PRODUCTS.find((p) => p.id == productId);
  if (!prod) return;


  const existing = cart.find((i) => i.id == productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: prod.id, title: prod.title, price: prod.price, qty: 1, img: prod.img });

  saveCart();
  renderCart();
  updateCartCount();

  const off = new bootstrap.Offcanvas(document.getElementById("cartOffcanvas"));
  off.show();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = '<div class="text-center text-muted">Tu carrito está vacío</div>';
  }

  cart.forEach((item) => {
    const el = document.createElement("div");
    el.className = "d-flex align-items-center gap-2 mb-2";
    el.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${item.title}</div>
        <div class="text-muted small">${currency(item.price)} x ${item.qty}</div>
      </div>
      <div class="d-flex gap-1 align-items-center">
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty('${item.id}', -1)">
          <i class="bi bi-dash"></i></button>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty('${item.id}', 1)">
          <i class="bi bi-plus"></i></button>
        <button class="btn btn-sm btn-light" onclick="removeFromCart('${item.id}')">
          <i class="bi bi-trash"></i></button>
      </div>
    `;
    container.appendChild(el);
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("cartTotal").innerText = currency(total);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id == id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id != id);
  saveCart();
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id != id);
  saveCart();
  renderCart();
  updateCartCount();
}

document.getElementById("clearCart")?.addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
});

/* ------------------ Detalle rápido ------------------ */
function showQuick(id) {
  const p = PRODUCTS.find((x) => x.id == id);
  if (!p) return;

  const modalImg = document.getElementById("modalImg");
  modalImg.src = p.img || "https://via.placeholder.com/400x300?text=Sin+imagen";
  document.getElementById("modalTitle").textContent = p.title;
  document.getElementById("modalDesc").textContent = p.desc;
  document.getElementById("modalPrice").textContent = currency(p.price);

  const modal = new bootstrap.Modal(document.getElementById("productModal"));
  modal.show();
}

/* ------------------ Inicialización ------------------ */
async function init() {
  await cargarProductos();
  renderCart();
  updateCartCount();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => filtrarPorTitulo(e.target.value));
  }

  // Price range filter
  const applyPriceBtn = document.getElementById("applyPrice");
  if (applyPriceBtn) {
    applyPriceBtn.addEventListener("click", () => {
      const minPrice = parseFloat(document.getElementById("minPrice")?.value) || 0;
      const maxPrice = parseFloat(document.getElementById("maxPrice")?.value) || Infinity;
      if (minPrice < 0 || maxPrice < 0 || (minPrice > maxPrice && maxPrice !== Infinity)) {
        Swal.fire({
          icon: "error",
          title: "Error en el filtro de precio",
          text: "El precio mínimo no puede ser mayor que el máximo, y los valores no pueden ser negativos.",
          confirmButtonColor: "#2e7d32",
        });
        return;
      }
      filtrarPorPrecio(minPrice, maxPrice);
    });
  }

  // Sorting
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applyFiltersAndSort();
    });
  }

  // Existing price filter (optional, can be removed if not needed)
  const priceFilter = document.getElementById("priceFilter");
  if (priceFilter) {
    priceFilter.addEventListener("change", () => {
      const value = priceFilter.value;
      if (value === "low") filtrarPorPrecio(0, 10000);
      else if (value === "mid") filtrarPorPrecio(10000, 30000);
      else if (value === "high") filtrarPorPrecio(30000, Infinity);
      else applyFiltersAndSort();
    });
  }
}

window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.showQuick = showQuick;
window.filtrarPorTitulo = filtrarPorTitulo;

/* ------------------ Redirección del botón "Hacer reserva" ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const reserveBtn = document.getElementById("reserveFromCart");

  if (reserveBtn) {

    reserveBtn.addEventListener("click", () => {
      window.location.href = "../Reservas/index copy.html";
    })
  }


});

document.addEventListener("DOMContentLoaded", () => {
  let btn_check = document.getElementById("checkoutBtn");

  if (!btn_check) {

    return
  }

  btn_check.addEventListener("click", () => {

    window.location.href = "/checkout/index.html";

  })


})

init();

/* ------------------ Estilos visuales ------------------ */
const style = document.createElement("style");
style.textContent = `
  .fade-in {
    opacity: 0;
    transform: scale(0.95);
    animation: fadeIn 0.4s ease-in-out forwards;
  }

  .fade-out {
    animation: fadeOut 0.3s ease-in forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
`;

document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("usuario");
  if (userData) {
    const user = JSON.parse(userData);
    if (user.credenciales) {
      const { nombre, rol } = user.credenciales;
      document.getElementById("userName").textContent = nombre || "Usuario";

    }
  }
});
document.head.appendChild(style);


document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");


  if (!usuario) {

    localStorage.setItem("redirectAfterLogin", window.location.href);
    console.log(localStorage.getItem("redirectAfterLogin"));


    Swal.fire({
      icon: "warning",
      title: "No has iniciado sesión",
      text: "Por favor inicia sesión para acceder al menú.",
      confirmButtonColor: "#2e7d32"
    }).then(() => {
      window.location.href = "../Login/index.html";

    });
  }
});

// script.js
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.profile-dropdown-toggle');
  const dropdown = document.getElementById('profileDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  // Verificamos que existan los elementos
  if (!toggle || !dropdown || !logoutBtn) {
    console.warn('No se encontró toggle, dropdown o logoutBtn');
    return;
  }

  // Toggle del dropdown
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  // Evitar que click dentro del dropdown lo cierre
  dropdown.addEventListener('click', e => e.stopPropagation());

  // Cerrar sesión
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('usuario'); // ejemplo
    location.reload(); // opcional
  });
});







