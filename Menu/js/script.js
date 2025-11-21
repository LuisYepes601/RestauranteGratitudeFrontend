/* ==========================
       MENU - PERFIL MODERNO + TRANSICIÓN + LOCALSTORAGE
   ========================== */

document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");






  if (!usuario) {

    localStorage.setItem("redirectAfterLogin", window.location.href);
    console.log(localStorage.getItem("redirectAfterLogin"));


    Swal.fire({
      icon: "warning",
      title: "No has iniciado sesión",
      text: "Por favor inicia sesión para acceder a el menú de platos.",
      confirmButtonColor: "#2e7d32"
    }).then(() => {
      window.location.href = "../Login/index.html";

    });


  }


});



// Variables globales
let PRODUCTS = [];
let cart = JSON.parse(localStorage.getItem("dv_cart") || "[]");
let przedstawiaProducts = [];

/* ------------------ Helpers ------------------ */
const currency = (v) => "$" + Number(v).toFixed(2);

function saveCart() {
  localStorage.setItem("dv_cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById("cartCount");
  if (el) {
    el.innerText = count;
    el.style.display = count > 0 ? "inline-block" : "none";
  }
}

/* ------------------ Limpiar imagen ------------------ */
function limpiarImagen(valor) {
  if (!valor) return "https://via.placeholder.com/200x200?text=Sin+Imagen";
  return valor.replace(/^"|"$/g, "").trim();
}

/* ------------------ CARGAR PRODUCTOS DESDE API ------------------ */
async function cargarProductos() {

  Swal.fire({
    title: 'Cargando...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await fetch("http://localhost:8080/producto/obtener/todos", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    Swal.close();

    const usuarioCred = JSON.parse(localStorage.getItem("usuario"));

    const btn_mis_pedidos = document.querySelector(".position-relative");
    const btn_carrito = document.querySelector(".btn-car")
    console.log(btn_mis_pedidos);
    

    if (usuarioCred.credenciales.rol !== "Usuario") {

      btn_mis_pedidos.style.display = "none";
      btn_carrito.style.display = "none";

    }


    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Sin productos");

    PRODUCTS = data.map(p => ({
      id: String(p.id),
      title: p.nombre?.trim() || "Sin nombre",
      category: p.categoria?.trim() || "Sin categoría",
      price: Number(p.precio) || 0,
      desc: p.descripcion?.trim() || "Sin descripción",
      img: limpiarImagen(p.imagen)
    }));

    filteredProducts = PRODUCTS.slice();
    renderCategories();
    renderProducts();

  } catch (error) {
    console.error("Error API:", error);
    document.getElementById("productsGrid").innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          <strong>Error:</strong> No se pudo cargar el menú. Verifica el backend.
        </div>
      </div>`;
  }
}

/* ------------------ Render categorías ------------------ */
function renderCategories() {
  document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
  const todosBtn = document.querySelector(".category-btn[onclick*='Todos']");
  if (todosBtn) todosBtn.classList.add("active");
}

/* ------------------ Filtro por categoría ------------------ */
function filterByCategory(selected) {
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent.trim() === selected) {
      btn.classList.add("active");
    }
  });
  applyFiltersAndSort();
}

/* ------------------ Render productos ------------------ */
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (filteredProducts.length === 0) {
    grid.innerHTML = '<div class="col-12"><div class="alert alert-info">No hay productos en esta categoría.</div></div>';
    return;
  }

  filteredProducts.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-3 fade-in";
    col.innerHTML = `
      <div class="p-3 product-card h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge-category text-truncate" style="max-width: 100px;">${p.category}</span>
          <small class="text-muted">${currency(p.price)}</small>
        </div>
        <div class="mb-3" style="flex:1">
          <img src="${p.img}" alt="${p.title}" class="img-fluid rounded w-100" style="height:150px; object-fit:cover;">
          <p class="mt-2 mb-0 text-muted small text-break" style="line-height:1.3; max-height:3.9em; overflow:hidden;">${p.desc}</p>
        </div>
        <h6 class="mt-2 text-center fw-bold text-break">${p.title}</h6>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-sm w-100" style="background:var(--verde-medio); color:white" onclick="addToCart('${p.id}')">Agregar</button>
          <button class="btn btn-outline-secondary btn-sm" onclick="showQuick('${p.id}')">Detalles</button>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

/* ------------------ Aplicar filtros y ordenamiento ------------------ */
function applyFiltersAndSort() {
  let temp = PRODUCTS.slice();

  const activeBtn = document.querySelector(".category-btn.active");
  const selectedCategory = activeBtn ? activeBtn.innerText.trim() : "Todos";
  if (selectedCategory !== "Todos") {
    temp = temp.filter(p => p.category === selectedCategory);
  }

  const query = document.getElementById("searchInput")?.value.toLowerCase().trim();
  if (query) {
    temp = temp.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  const minInput = document.getElementById("minPrice");
  const maxInput = document.getElementById("maxPrice");
  const min = parseFloat(minInput?.value) || 0;
  const max = parseFloat(maxInput?.value) || Infinity;

  if (min > 0 || max < Infinity) {
    if (min > max && max !== Infinity) {
      Swal.fire({
        icon: "warning",
        title: "Filtros inválidos",
        text: "El precio mínimo no puede ser mayor que el máximo.",
        confirmButtonColor: "#2e7d32"
      });
      minInput.value = "";
      maxInput.value = "";
      return;
    }
    temp = temp.filter(p => p.price >= min && p.price <= max);
  }

  const sort = document.getElementById("sortSelect")?.value;
  if (sort === "price-asc") temp.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") temp.sort((a, b) => b.price - a.price);

  filteredProducts = temp;
  animateProducts();
}

/* ------------------ Animación ------------------ */
function animateProducts() {
  const grid = document.getElementById("productsGrid");
  grid.classList.add("fade-out");
  setTimeout(() => {
    renderProducts();
    grid.classList.remove("fade-out");
    grid.classList.add("fade-in");
    setTimeout(() => grid.classList.remove("fade-in"), 400);
  }, 300);
}

/* ------------------ Carrito ------------------ */
function addToCart(id) {
  const p = PRODUCTS.find(x => x.id == id);
  if (!p) return;
  const item = cart.find(i => i.id == id);
  if (item) item.qty++;
  else cart.push({ id: p.id, title: p.title, price: p.price, qty: 1, img: p.img });
  saveCart();
  renderCart();
  updateCartCount();
  new bootstrap.Offcanvas("#cartOffcanvas").show();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  container.innerHTML = cart.length === 0 ? '<div class="text-center text-muted">Carrito vacío</div>' : "";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const el = document.createElement("div");
    el.className = "d-flex align-items-center gap-2 mb-2";
    el.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${item.title}</div>
        <div class="text-muted small">${currency(item.price)} x ${item.qty}</div>
      </div>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty('${item.id}', -1)">-</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty('${item.id}', 1)">+</button>
        <button class="btn btn-sm btn-light" onclick="removeFromCart('${item.id}')">X</button>
      </div>
    `;
    container.appendChild(el);
  });
  document.getElementById("cartTotal").innerText = currency(total);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id == id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id != id);
  saveCart();
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id != id);
  saveCart();
  renderCart();
  updateCartCount();
}

/* ------------------ Eventos ------------------ */
document.getElementById("clearCart")?.addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
});

document.getElementById("searchInput")?.addEventListener("input", () => applyFiltersAndSort());

document.getElementById("applyPrice")?.addEventListener("click", () => {
  const min = parseFloat(document.getElementById("minPrice").value) || 0;
  const max = parseFloat(document.getElementById("maxPrice").value) || Infinity;
  if (min > max && max !== Infinity) {
    Swal.fire({
      icon: "warning",
      title: "Filtros inválidos",
      text: "El precio mínimo no puede ser mayor que el máximo.",
      confirmButtonColor: "#2e7d32"
    });
    return;
  }
  applyFiltersAndSort();
});

document.getElementById("sortSelect")?.addEventListener("change", applyFiltersAndSort);

/* ------------------ Detalle rápido ------------------ */
function showQuick(id) {
  const p = PRODUCTS.find(x => x.id == id);
  if (!p) return;

  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");

  modalImg.src = p.img || "https://via.placeholder.com/300x200?text=Sin+Imagen";
  modalImg.alt = p.title;

  modalTitle.textContent = p.title;

  const maxLength = 120;
  const shortDesc = p.desc.length > maxLength
    ? p.desc.substring(0, maxLength) + "..."
    : p.desc;
  modalDesc.textContent = shortDesc;

  modalPrice.textContent = currency(p.price);

  const modal = new bootstrap.Modal("#productModal", { backdrop: 'static' });
  modal.show();
}

/* ------------------ Inicialización ------------------ */
async function init() {
  await cargarProductos();
  renderCart();
  updateCartCount();

  document.getElementById("reserveFromCart")?.addEventListener("click", () => {
    window.location.href = "../Reservas/index copy.html";
  });
  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    window.location.href = "/checkout/index.html";
  });

  // === PERFIL DESDE LOCALSTORAGE ===
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const nombre = usuario?.credenciales?.nombre || "Invitado";
  const rol = usuario?.credenciales?.rol || "Cliente";

  const userNameEl = document.getElementById("userName");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownRol = document.getElementById("dropdownRol");

  if (userNameEl) userNameEl.textContent = nombre;
  if (dropdownUserName) dropdownUserName.textContent = nombre;
  if (dropdownRol) dropdownRol.textContent = rol;

  // Redirigir si no está logueado
  if (!localStorage.getItem("usuario")) {
    localStorage.setItem("redirectAfterLogin", window.location.href);
    Swal.fire({
      icon: "warning",
      title: "Inicia sesión",
      text: "Necesitas estar logueado",
      confirmButtonColor: "#2e7d32"
    }).then(() => window.location.href = "../Login/index.html");
  }
}

// Exponer funciones
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.showQuick = showQuick;
window.filterByCategory = filterByCategory;

// === DROPDOWN PERFIL CON TRANSICIÓN SUAVE ===
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".profile-toggle");
  const dropdown = document.getElementById("profileDropdown");
  const logout = document.getElementById("logoutBtn");

  if (toggle && dropdown) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
      }
    });

    dropdown.addEventListener("click", (e) => e.stopPropagation());
  }

  logout?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    localStorage.removeItem("dv_cart");
    window.location.href = "../Login/index.html";
  });
});

// === ESTILOS DINÁMICOS ===
const style = document.createElement("style");
style.textContent = `
  .fade-in { opacity: 0; transform: scale(0.95); animation: fadeIn 0.4s forwards; }
  .fade-out { animation: fadeOut 0.3s forwards; }
  @keyframes fadeIn { to { opacity: 1; transform: scale(1); } }
  @keyframes fadeOut { to { opacity: 0; transform: scale(0.95); } }

  .profile-toggle { transition: opacity 0.2s; cursor: pointer; }
  .profile-toggle:hover { opacity: 0.9; }

  .avatar-circle {
    width: 38px; height: 38px; border-radius: 50%;
    font-size: 1.1rem; font-weight: bold;
    display: flex; align-items: center; justify-content: center;
  }

  #profileDropdown {
    position: absolute; top: 100%; right: 0; margin-top: 8px;
    width: 220px; background: white; border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15); overflow: hidden;
    opacity: 0; visibility: hidden; transform: translateY(-10px);
    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
    z-index: 1050;
  }

  #profileDropdown.show {
    opacity: 1; visibility: visible; transform: translateY(0);
  }

  .dropdown-item {
    padding: 0.75rem 1rem; border-radius: 0.5rem; margin: 0.25rem 0.5rem;
    transition: all 0.2s; font-weight: 500;
  }

  .hover-bg:hover {
    background-color: #f0f8f0 !important;
    color: var(--verde-medio) !important;
  }

  .hover-bg.text-danger:hover {
    background-color: #ffe6e6 !important;
    color: #d32f2f !important;
  }

  @media (max-width: 576px) {
    #productModal .modal-dialog { margin: 1rem; max-width: calc(100% - 2rem); }
    #productModal img { max-height: 140px !important; }
    #profileDropdown { width: 200px; right: 10px !important; }
    .avatar-circle { width: 34px; height: 34px; font-size: 1rem; }
  }
`;
document.head.appendChild(style);


init();



