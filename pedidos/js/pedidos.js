/* ==============================================================
   js/pedidos.js – LISTA DE PEDIDOS (SIN ENTREGA ESTIMADA)
   ============================================================== */

Swal.fire({
  title: 'Cargando...',
  text: 'Por favor espera',
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading();
  }
});


let pedidosGlobal = [];
let paginaActual = 0;
const TAMANO_PAGINA = 10;

function formatearFecha(iso) {
  if (!iso) return "Sin fecha";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

async function cargarPedidos(pagina = 0) {
  paginaActual = pagina;
  const container = document.getElementById("pedidosContainer");
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const id = usuario?.credenciales?.id;

  if (!id) {
    container.innerHTML = `<p class="text-center text-danger">Inicia sesión para ver tus pedidos</p>`;
    return;
  }

  try {
    const buscador = document.getElementById("buscador").value.trim();
    const estado = document.getElementById("filtroEstado").value;

    let url = `http://localhost:8080/pedidos/usuario/${id}?page=${pagina}&size=${TAMANO_PAGINA}&sort=fechaPedido,desc`;
    if (buscador) url += `&search=${encodeURIComponent(buscador)}`;
    if (estado) url += `&estado=${encodeURIComponent(estado)}`;



    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al cargar pedidos");
    Swal.close();


    const data = await res.json();
    pedidosGlobal = data.content || [];
    const totalPages = data.totalPages || 1;

    renderPedidos();
    renderPaginacion(totalPages);
    actualizarEstadisticas();

  } catch (err) {
    container.innerHTML = `<p class="text-center text-danger">Error de conexión. Intenta más tarde.</p>`;
    console.error("Error en cargarPedidos:", err);
  }
}

function renderPedidos() {
  const container = document.getElementById("pedidosContainer");

  if (pedidosGlobal.length === 0) {
    container.innerHTML = `<p class="text-center text-muted">No se encontraron pedidos</p>`;
    return;
  }

  container.innerHTML = pedidosGlobal.map(p => `
    <div class="pedido-card">
      <div class="pedido-header">
        <span class="pedido-id">#${String(p.idPedido)}</span>
        <span class="pedido-estado">${p.estadoPedido || 'Pendiente'}</span>
      </div>
      <div class="pedido-body">
        <div class="pedido-info">
          <div><i class="fas fa-calendar"></i> ${formatearFecha(p.fechaPedido)}</div>
          <div><i class="fas fa-tag"></i> ${p.tipoPedido || 'Online'}</div>
          <div><i class="fas fa-box"></i> ${p.totalItems} artículo${p.totalItems !== 1 ? 's' : ''}</div>
        </div>
        <div class="d-flex flex-column align-items-end gap-2">
          <div class="pedido-total">${formatearMoneda(p.total)}</div>
          <button class="btn btn-ver-mas" onclick="verDetalle(${p.idPedido})">
            Ver más <i class="fas fa-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function verDetalle(id) {
  window.location.href = `/pedidos/detallePedido/index.html?id=${id}`;
}

function renderPaginacion(totalPages) {
  const paginacion = document.getElementById("paginacion");
  let html = '';

  const maxVisible = 5;
  let start = Math.max(0, paginaActual - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible);
  if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

  if (paginaActual > 0) {
    html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPedidos(0)">«</a></li>`;
    html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPedidos(${paginaActual - 1})">‹</a></li>`;
  }

  for (let i = start; i < end; i++) {
    html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
      <a class="page-link" href="#" onclick="cargarPedidos(${i})">${i + 1}</a>
    </li>`;
  }

  if (paginaActual < totalPages - 1) {
    html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPedidos(${paginaActual + 1})">›</a></li>`;
    html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPedidos(${totalPages - 1})">»</a></li>`;
  }

  paginacion.innerHTML = html;
}

function actualizarEstadisticas() {
  const total = pedidosGlobal.length;
  const pendientes = pedidosGlobal.filter(p => (p.estadoPedido || '').toLowerCase() === 'pendiente').length;
  const entregados = pedidosGlobal.filter(p => (p.estadoPedido || '').toLowerCase() === 'entregado').length;
  const gastado = pedidosGlobal.reduce((sum, p) => sum + (p.total || 0), 0);

  document.getElementById("totalPedidos").textContent = total;
  document.getElementById("pendientes").textContent = pendientes;
  document.getElementById("entregados").textContent = entregados;
  document.getElementById("totalGastado").textContent = formatearMoneda(gastado);
}

document.getElementById("buscador").addEventListener("input", () => cargarPedidos(0));
document.getElementById("filtroEstado").addEventListener("change", () => cargarPedidos(0));

window.addEventListener("DOMContentLoaded", () => cargarPedidos(0));



