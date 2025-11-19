// === DATOS DE CONFIGURACIÓN ===
const API_BASE = 'http://localhost:8080';

// === MAPEO CATEGORÍAS ===
const CATEGORIAS_MAP = {
  'Repostería': 1, 'Heladería': 2, 'Panadería': 3, 'Gourmet': 4, 'Bebidas': 5
};
const CATEGORIAS_INVERSO = { 1: 'Repostería', 2: 'Heladería', 3: 'Panadería', 4: 'Gourmet', 5: 'Bebidas' };

// === MAPEO TIPOS DE CONTENIDO ===
const TIPOS_CONTENIDO_MAP = {
  'Unidad': 5, 'Gramos': 2, 'Kilogramos': 1, 'Mililitros': 4, 'Litros': 3,
  'Onzas': 6, 'Libras': 7, 'Paquete': 8, 'Caja': 9, 'Botella': 10,
  'Bolsa': 11, 'Porción': 12, 'Docena': 13, 'Otro': 14
};

// === VARIABLES GLOBALES ===
let productos = [];
let clientes = [];
let currentPage = 1;
const itemsPerPage = 10;

// === CARGAR NOMBRE DE USUARIO ===
function cargarNombreUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const nombre = usuario.credenciales?.nombre || 'Usuario';
  const el = document.querySelector('.user-name');
  if (el) el.textContent = nombre;
}

// === DASHBOARD ===
async function cargarDashboard() {
  try {
    const [pedidosRes, ingresosRes, clientesRes, pendientesRes] = await Promise.all([
      fetch(`${API_BASE}/pedidos/count`),
      fetch(`${API_BASE}/ventas/ingresos-mes`),
      fetch(`${API_BASE}/clientes/nuevos-mes`),
      fetch(`${API_BASE}/pedidos/pendientes`)
    ]);

    const totalPedidos = pedidosRes.ok ? (await pedidosRes.json()).count : 1245;
    const ingresos = ingresosRes.ok ? (await ingresosRes.json()).total : 8540;
    const nuevosClientes = clientesRes.ok ? (await clientesRes.json()).count : 320;
    const pendientes = pendientesRes.ok ? (await pendientesRes.json()).count : 23;

    const cards = document.querySelectorAll('.stats-card');
    if (cards[0]) cards[0].querySelector('h3').textContent = totalPedidos;
    if (cards[1]) cards[1].querySelector('h3').textContent = `$${ingresos.toFixed(2)}`;
    if (cards[2]) cards[2].querySelector('h3').textContent = nuevosClientes;
    if (cards[3]) cards[3].querySelector('h3').textContent = pendientes;
  } catch (error) {
    console.error('Error dashboard:', error);
  }
}

// === PRODUCTOS ===
async function cargarProductos() {
  Swal.fire({ title: 'Cargando Productos...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  try {
    const response = await fetch(`${API_BASE}/producto/obtener/todos`);
    if (!response.ok) throw new Error('Error productos');
    const data = await response.json();
    productos = Array.isArray(data) ? data.map(p => ({
      id: p.id, nombre: p.nombre, precio: p.precio, descripcion: p.descripcion,
      categoria: p.categoria || 'Sin categoría', id_categoria: p.idCategoria,
      valorcontenido: p.valorContenido, tipoContenido: p.tipoContenido || 'Unidad',
      idTipoContenido: p.idTipoContenido, imagen: p.imagen || 'https://via.placeholder.com/300x200'
    })) : [];
    renderProductCards();
    renderProductTable();
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    productos = [{ id: 1, nombre: 'Tarta de Fresa', precio: 15.99, descripcion: 'Deliciosa tarta', imagen: 'https://via.placeholder.com/300x200', categoria: 'Repostería', id_categoria: 1, valorcontenido: '250', tipoContenido: 'Gramos', id_tipo_contenido: 2 }];
    renderProductCards(); renderProductTable();
  }
}

function renderProductCards() {
  const container = document.getElementById('productsGridView');
  if (!container) return;
  container.innerHTML = '';
  if (!productos.length) { container.innerHTML = '<div class="col-12 text-center text-muted py-4">No hay productos.</div>'; return; }
  const fragment = document.createDocumentFragment();
  productos.forEach(p => {
    const col = document.createElement('div'); col.className = 'col-lg-3 col-md-4 col-sm-6';
    const safeName = p.nombre.replace(/"/g, '&quot;');
    col.innerHTML = `
      <div class="product-card">
        <img src="${p.imagen}" alt="${safeName}" loading="lazy">
        <div class="card-body">
          <span class="category">${p.categoria}</span>
          <h6>${safeName}</h6>
          <p class="text-muted">${p.descripcion}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="price">$${Number(p.precio).toFixed(2)}</span>
            <div>
              <button class="btn btn-sm btn-outline-primary me-1 edit-product" data-id="${p.id}"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-outline-danger delete-product" data-id="${p.id}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>`;
    fragment.appendChild(col);
  });
  container.appendChild(fragment);
}

function renderProductTable() {
  const tbody = document.querySelector('#productsTableView tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!productos.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay productos.</td></tr>'; return; }
  productos.forEach(p => {
    const stock = Math.floor(Math.random() * 40) + 5;
    const status = stock > 0 ? 'Disponible' : 'Agotado';
    const statusClass = stock > 0 ? 'delivered' : 'cancelled';
    tbody.innerHTML += `
      <tr>
        <td><img src="${p.imagen}" alt="${p.nombre}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;"></td>
        <td class="align-middle">${p.nombre}</td>
        <td class="align-middle">${p.categoria}</td>
        <td class="align-middle">$${Number(p.precio).toFixed(2)}</td>
        <td class="align-middle">${stock}</td>
        <td class="align-middle"><span class="status ${statusClass}">${status}</span></td>
        <td class="align-middle">
          <button class="btn btn-sm btn-outline-primary me-1 edit-product" data-id="${p.id}"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger delete-product" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
  });
}

// === CLIENTES ===
async function cargarClientes() {
  Swal.fire({ title: 'Cargando Clientes...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  try {
    const response = await fetch(`${API_BASE}/cliente/obtener/todos`);
    if (!response.ok) throw new Error('Error clientes');
    clientes = await response.json();
    renderClientesTable();
    setupClientesPagination();
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
    clientes = [];
    renderClientesTable();
  }
}

function renderClientesTable() {
  const tbody = document.querySelector('#customersTable tbody');
  const search = document.getElementById('searchCustomers')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('filterStatus')?.value || '';

  let filtered = clientes.filter(c => {
    const matchSearch = `${c.nombres} ${c.apellidos} ${c.email} ${c.telefono}`.toLowerCase().includes(search);
    const matchStatus = !statusFilter || c.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = filtered.slice(start, end);

  tbody.innerHTML = '';
  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No se encontraron clientes.</td></tr>`;
    document.getElementById('customersCount').textContent = `Mostrando 0 de ${filtered.length}`;
    return;
  }

  pageData.forEach(c => {
    const estadoClass = c.estado === 'Activo' ? 'delivered' : c.estado === 'Inactivo' ? 'pending' : 'cancelled';
    const foto = c.foto || 'https://via.placeholder.com/40?text=U';
    tbody.innerHTML += `
      <tr>
        <td><img src="${foto}" alt="foto" class="rounded-circle" width="40" height="40"></td>
        <td class="align-middle">${c.nombres} ${c.apellidos}</td>
        <td class="align-middle">${c.email}</td>
        <td class="align-middle">${c.telefono}</td>
        <td class="align-middle text-truncate" style="max-width: 180px;">${c.direccion || 'Sin dirección'}</td>
        <td class="align-middle">${new Date(c.fechaRegistro).toLocaleDateString('es-CO')}</td>
        <td class="align-middle"><span class="status ${estadoClass}">${c.estado}</span></td>
        <td class="align-middle">
          <button class="btn btn-sm btn-outline-primary me-1 edit-customer" data-id="${c.id}"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger delete-customer" data-id="${c.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
  });
  document.getElementById('customersCount').textContent = `Mostrando ${start + 1}-${Math.min(end, filtered.length)} de ${filtered.length} clientes`;
}

function setupClientesPagination() {
  const totalFiltered = clientes.filter(c => {
    const search = document.getElementById('searchCustomers')?.value.toLowerCase() || '';
    const status = document.getElementById('filterStatus')?.value || '';
    return `${c.nombres} ${c.apellidos} ${c.email}`.toLowerCase().includes(search) && (!status || c.estado === status);
  }).length;

  const pages = Math.ceil(totalFiltered / itemsPerPage);
  const pagination = document.getElementById('customersPagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= pages; i++) {
    pagination.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
}

// === NAVEGACIÓN ===
document.querySelectorAll('.sidebar-nav a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const sectionId = this.getAttribute('data-section') + 'Section';
    document.getElementById(sectionId).style.display = 'block';
    document.getElementById('sectionTitle').textContent = this.querySelector('span').textContent;

    if (window.innerWidth < 992) {
      document.getElementById('sidebar').classList.remove('show');
      document.getElementById('sidebarOverlay').classList.remove('show');
    }

    const section = this.getAttribute('data-section');
    if (section === 'dashboard') cargarDashboard();
    else if (section === 'products') cargarProductos();
    else if (section === 'customers') { currentPage = 1; cargarClientes(); }
  });
});

// === EVENTOS CLIENTES ===
document.getElementById('customersSection')?.addEventListener('click', e => {
  const editBtn = e.target.closest('.edit-customer');
  const deleteBtn = e.target.closest('.delete-customer');
  if (editBtn) {
    const id = editBtn.dataset.id;
    const cliente = clientes.find(c => c.id == id);
    if (cliente) {
      document.getElementById('editCustId').value = cliente.id;
      document.getElementById('editCustNombres').value = cliente.nombres;
      document.getElementById('editCustApellidos').value = cliente.apellidos;
      document.getElementById('editCustEmail').value = cliente.email;
      document.getElementById('editCustTelefono').value = cliente.telefono;
      document.getElementById('editCustDireccion').value = cliente.direccion || '';
      document.getElementById('editCustEstado').value = cliente.estado;
      new bootstrap.Modal(document.getElementById('editCustomerModal')).show();
    }
  }
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    Swal.fire({
      title: '¿Eliminar cliente?', text: 'No se podrá revertir', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`${API_BASE}/cliente/eliminar/${id}`, { method: 'DELETE' })
          .then(() => { Swal.fire('Eliminado', '', 'success'); cargarClientes(); })
          .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
      }
    });
  }
});

// Filtros en tiempo real
document.getElementById('searchCustomers')?.addEventListener('input', () => { currentPage = 1; renderClientesTable(); setupClientesPagination(); });
document.getElementById('filterStatus')?.addEventListener('change', () => { currentPage = 1; renderClientesTable(); setupClientesPagination(); });

// Paginación
document.getElementById('customersPagination')?.addEventListener('click', e => {
  const page = e.target.dataset.page;
  if (page) {
    currentPage = parseInt(page);
    renderClientesTable();
    setupClientesPagination();
  }
});

// Exportar Excel
document.getElementById('exportCustomersBtn')?.addEventListener('click', () => {
  const ws = XLSX.utils.json_to_sheet(clientes.map(c => ({
    Nombres: c.nombres, Apellidos: c.apellidos, Email: c.email,
    Teléfono: c.telefono, Dirección: c.direccion, Estado: c.estado,
    Registrado: new Date(c.fechaRegistro).toLocaleDateString('es-CO')
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");
  XLSX.writeFile(wb, "clientes_delicias_verdes.xlsx");
});

// Guardar nuevo cliente
document.getElementById('saveCustomerBtn')?.addEventListener('click', async () => {
  const payload = {
    nombres: document.getElementById('custNombres').value,
    apellidos: document.getElementById('custApellidos').value,
    email: document.getElementById('custEmail').value,
    telefono: document.getElementById('custTelefono').value,
    direccion: document.getElementById('custDireccion').value,
    password: document.getElementById('custPassword').value,
    estado: document.getElementById('custEstado').value
  };
  try {
    const res = await fetch(`${API_BASE}/cliente/crear`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al crear');
    Swal.fire('Éxito', 'Cliente agregado', 'success');
    bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
    cargarClientes();
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
});

// Guardar edición cliente
document.getElementById('saveEditCustomerBtn')?.addEventListener('click', async () => {
  const id = document.getElementById('editCustId').value;
  const payload = {
    id: parseInt(id),
    nombres: document.getElementById('editCustNombres').value,
    apellidos: document.getElementById('editCustApellidos').value,
    email: document.getElementById('editCustEmail').value,
    telefono: document.getElementById('editCustTelefono').value,
    direccion: document.getElementById('editCustDireccion').value,
    estado: document.getElementById('editCustEstado').value
  };
  try {
    const res = await fetch(`${API_BASE}/cliente/editar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al editar');
    Swal.fire('Éxito', 'Cliente actualizado', 'success');
    bootstrap.Modal.getInstance(document.getElementById('editCustomerModal')).hide();
    cargarClientes();
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
});

// === REPORTES ===
async function generarReporteUsuarios() {
  Swal.fire({ title: 'Generando Reporte...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  const response = await fetch(`${API_BASE}/reporte/usuariosRegistrados`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "reporte_usuarios.pdf"; document.body.appendChild(a); a.click(); a.remove();
  Swal.fire('Éxito', 'Reporte descargado', 'success');
}

async function generarReporteProductos() {
  Swal.fire({ title: 'Generando Reporte...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  const response = await fetch(`${API_BASE}/reporte/productosValidos`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "reporte_productos.pdf"; document.body.appendChild(a); a.click(); a.remove();
  Swal.fire('Éxito', 'Reporte descargado', 'success');
}

// === INICIO ===
document.addEventListener('DOMContentLoaded', () => {
  cargarNombreUsuario();
  const hash = window.location.hash.substring(1) || 'dashboard';
  const link = document.querySelector(`.sidebar-nav a[data-section="${hash}"]`) || document.querySelector('.sidebar-nav a');
  link.click();
});

// ===============================================
// MENÚ DESPLEGABLE DEL USUARIO - FUNCIONA EN ESCRITORIO Y MÓVIL
// ===============================================
document.addEventListener('DOMContentLoaded', function () {
  const userProfile = document.getElementById('userProfile');
  const userDropdown = document.getElementById('userDropdown');

  // Si no existen los elementos, no hacemos nada
  if (!userProfile || !userDropdown) {
    console.warn('No se encontró el menú de usuario');
    return;
  }

  // ABRIR Y CERRAR AL HACER CLIC (funciona en PC y móvil)
  userProfile.addEventListener('click', function (e) {
    e.stopPropagation();                    // importante
    userDropdown.classList.toggle('show');  // abre o cierra
  });

  // CERRAR al hacer clic fuera del menú
  document.addEventListener('click', function () {
    userDropdown.classList.remove('show');
  });

  // Evitar que se cierre si haces clic dentro del menú
  userDropdown.addEventListener('click', function (e) {
    e.stopPropagation();
  });
});

function cerrarSesion() {

  const btn_cerrarSesion = document.querySelector(".btn-logout");

  if (btn_cerrarSesion) {
    btn_cerrarSesion.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      window.location.href = "../Login/index.html";
    });
  }

}

document.addEventListener("DOMContentLoaded", cerrarSesion);



