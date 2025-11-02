/* ==============================================================
   js/detalle-pedido.js – ADAPTADO A TU JSON REAL
   ============================================================== */

const urlParams = new URLSearchParams(window.location.search);
const idPedido = urlParams.get('id'); // Ej: 1002

function formatearFecha(iso) {
  if (!iso) return "Sin fecha";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });
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

async function cargarDetalle() {
  if (!idPedido) {
    Swal.fire("Error", "Falta el ID del pedido", "error");
    return;
  }

  // ID del usuario desde localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.credenciales?.id;

  if (!idUsuario) {
    Swal.fire("Error", "No estás autenticado", "error");
    return;
  }

  try {
    const res = await fetch(`https://restaurantegratitudeapi.onrender.com/pedidos/${idPedido}/${idUsuario}`);
    if (!res.ok) throw new Error("No se pudo cargar el pedido");

    const data = await res.json();

    // ID del pedido
    document.getElementById("pedidoId").textContent = `#${String(idPedido).padStart(5, '0')}`;

    // Info general
    document.getElementById("fechaPedido").textContent = formatearFecha(data.fechaPedido);
    document.getElementById("estadoPedido").textContent = data.estado || 'Pendiente';
    document.getElementById("tipoPedido").textContent = data.tipo || 'Online';
    document.getElementById("totalItems").textContent = `${data.total_items} artículo${data.total_items !== 1 ? 's' : ''}`;

    // Productos
    const lista = document.getElementById("listaProductos");
    if (data.productos && data.productos.length > 0) {
      lista.innerHTML = data.productos.map(p => `
        <div class="producto-item">
          <img src="${p.img_producto || 'https://via.placeholder.com/70'}" 
               alt="Producto" class="producto-img">
          <div class="producto-info">
            <p class="producto-nombre">Hamburguesa</p>
            <p class="producto-descripcion">${p.descripion}</p>
            <p class="producto-detalle">
              Cantidad: ${p.cantidad} × ${formatearMoneda(p.precioUnidad)}
            </p>
          </div>
          <div class="producto-precio">${formatearMoneda(p.total)}</div>
        </div>
      `).join("");
    } else {
      lista.innerHTML = `<p class="text-center text-muted">No hay productos</p>`;
    }

    // Totales
    const subtotal = data.productos?.reduce((sum, p) => sum + (p.subtotal || 0), 0) || 0;
    const envio = 0;
    const totalFinal = data.productos?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;

    document.getElementById("subtotal").textContent = formatearMoneda(subtotal);
    document.getElementById("envio").textContent = formatearMoneda(envio);
    document.getElementById("totalFinal").textContent = formatearMoneda(totalFinal);

  } catch (err) {
    Swal.fire("Error", "No se pudo cargar el detalle del pedido", "error");
    console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", cargarDetalle);