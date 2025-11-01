// === DATOS DE EJEMPLO PARA PRUEBAS ===
const API_BASE = 'http://localhost:8080/api';

// === CARGAR NOMBRE DE USUARIO ===
function cargarNombreUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  console.log(usuario);

  const nombre = usuario?.credenciales?.nombre || 'Usuario';
  document.getElementById('userName').textContent = nombre;
  console.log(nombre);

}

// === CONSUMIR APIs DEL DASHBOARD ===
async function cargarDashboard() {
  try {
    // 1. Total de Pedidos
    const resPedidos = await fetch(`${API_BASE}/pedidos/count`);
    const totalPedidos = resPedidos.ok ? (await resPedidos.json()).count : 1245;

    // 2. Ingresos del mes
    const resIngresos = await fetch(`${API_BASE}/ventas/ingresos-mes`);
    const ingresos = resIngresos.ok ? (await resIngresos.json()).total : 8540;

    // 3. Nuevos Clientes
    const resClientes = await fetch(`${API_BASE}/clientes/nuevos-mes`);
    const nuevosClientes = resClientes.ok ? (await resClientes.json()).count : 320;

    // 4. Pedidos Pendientes
    const resPendientes = await fetch(`${API_BASE}/pedidos/pendientes`);
    const pendientes = resPendientes.ok ? (await resPendientes.json()).count : 23;

    // Actualizar tarjetas
    document.querySelectorAll('.stats-card')[0].querySelector('h3').textContent = totalPedidos;
    document.querySelectorAll('.stats-card')[1].querySelector('h3').textContent = `$${ingresos.toFixed(2)}`;
    document.querySelectorAll('.stats-card')[2].querySelector('h3').textContent = nuevosClientes;
    document.querySelectorAll('.stats-card')[3].querySelector('h3').textContent = pendientes;

  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    Swal.fire('Error', 'No se pudieron cargar los datos del dashboard', 'warning');
  }
}

// === Productos de ejemplo ===
const PRODUCTS = [
  { img: 'https://via.placeholder.com/300x200', title: 'Tarta de Fresa', desc: 'Deliciosa tarta con fresas frescas', price: 15.99, category: 'Repostería' },
  { img: 'https://via.placeholder.com/300x200', title: 'Helado Artesano', desc: 'Helado cremoso de vainilla', price: 8.49, category: 'Heladería' },
  { img: 'https://via.placeholder.com/300x200', title: 'Pan Campesino', desc: 'Pan recién horneado', price: 2.25, category: 'Panadería' },
  { img: 'https://via.placeholder.com/300x200', title: 'Café Gourmet', desc: 'Café 100% arábica', price: 3.50, category: 'Gourmet' }
];

// Renderizar tarjetas
function renderProductCards() {
  const container = document.getElementById('productsGridView');
  container.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = `
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="product-card">
          <img src="${p.img}" alt="${p.title}" loading="lazy">
          <span class="category">${p.category}</span>
          <h6>${p.title}</h6>
          <p class="text-muted small mb-2">${p.desc}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="price">$${p.price.toFixed(2)}</span>
            <div>
              <button class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>`;
    container.innerHTML += card;
  });
}

// Renderizar tabla
function renderProductTable() {
  const tbody = document.querySelector('#productsTableView tbody');
  tbody.innerHTML = '';
  PRODUCTS.forEach(p => {
    const stock = Math.floor(Math.random() * 30) + 10;
    const status = stock > 0 ? 'Disponible' : 'Agotado';
    const statusClass = stock > 0 ? 'delivered' : 'cancelled';
    const row = `
      <tr>
        <td><img src="${p.img}" alt="${p.title}" style="width:50px;height:50px;object-fit:cover;"></td>
        <td>${p.title}</td>
        <td>${p.category}</td>
        <td>$${p.price.toFixed(2)}</td>
        <td>${stock}</td>
        <td><span class="status ${statusClass}">${status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

// Toggle sidebar
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('show');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('show');
  overlay.classList.remove('show');
});

// User dropdown
document.getElementById('userProfile').addEventListener('click', function () {
  document.getElementById('userDropdown').classList.toggle('show');
});

document.addEventListener('click', function (e) {
  const profile = document.getElementById('userProfile');
  const dropdown = document.getElementById('userDropdown');
  if (!profile.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// Navegación
document.querySelectorAll('.sidebar-nav a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');

    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const section = this.getAttribute('data-section') + 'Section';
    document.getElementById(section).style.display = 'block';

    document.getElementById('sectionTitle').textContent = this.querySelector('span').textContent;

    if (window.innerWidth < 992) {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    }

    // Cargar dashboard solo si es la sección
    if (this.getAttribute('data-section') === 'dashboard') {
      cargarDashboard();
    }
  });
});

// Toggle vistas productos
document.getElementById('gridViewBtn').addEventListener('click', () => {
  document.getElementById('gridViewBtn').classList.add('active');
  document.getElementById('tableViewBtn').classList.remove('active');
  document.getElementById('productsGridView').style.display = 'block';
  document.getElementById('productsTableView').style.display = 'none';
});

document.getElementById('tableViewBtn').addEventListener('click', () => {
  document.getElementById('tableViewBtn').classList.add('active');
  document.getElementById('gridViewBtn').classList.remove('active');
  document.getElementById('productsTableView').style.display = 'block';
  document.getElementById('productsGridView').style.display = 'none';
});

// GENERAR REPORTE
async function generarReporte(tipo) {
  const titulos = {
    clientes: "Reporte de Clientes",
    productos: "Reporte de Productos",
    pedidos: "Reporte de Pedidos",
    ventas: "Reporte de Ventas"
  };

  const endpoints = {
    clientes: `${API_BASE}/reportes/clientes`,
    productos: `${API_BASE}/reportes/productos`,
    pedidos: `${API_BASE}/reportes/pedidos`,
    ventas: `${API_BASE}/reportes/ventas`
  };

  Swal.fire({
    title: `Generando ${titulos[tipo]}`,
    text: "Consultando datos...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(endpoints[tipo]);
    if (!response.ok) throw new Error('Error en la API');

    const data = await response.json();

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text(titulos[tipo], 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Generado: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
    pdf.text(`Total: ${data.length} registros`, 20, 50);

    let y = 70;
    data.forEach((item, i) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFontSize(10);
      pdf.text(`${i + 1}. ${JSON.stringify(item)}`, 20, y);
      y += 10;
    });

    pdf.save(`reporte_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`);

    Swal.fire({
      icon: 'success',
      title: '¡Listo!',
      text: `${titulos[tipo]} descargado`,
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    Swal.fire('Error', 'No se pudo generar el reporte', 'error');
  }
}

// === INICIO ===
document.addEventListener('DOMContentLoaded', () => {
  cargarNombreUsuario();
  renderProductCards();
  renderProductTable();

  // Cargar dashboard al inicio
  if (window.location.hash === '' || window.location.hash === '#dashboard') {
    cargarDashboard();
  }
});