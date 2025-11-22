// === DATOS DE CONFIGURACIÓN ===
const API_BASE = 'http://localhost:8080';

// === MAPEO CATEGORÍAS ===
const CATEGORIAS_MAP = {
  'Repostería': 1, 'Heladería': 2, 'Panadería': 3, 'Gourmet': 4, 'Bebidas': 5
};
const CATEGORIAS_INVERSO = { 1: 'Repostería', 2: 'Heladería', 3: 'Panadería', 4: 'Gourmet', 5: 'Bebidas' };

const TIPOS_CONTENIDO_MAP = {
  'Unidad': 5, 'Gramos': 2, 'Kilogramos': 1, 'Mililitros': 4, 'Litros': 3,
  'Onzas': 6, 'Libras': 7, 'Paquete': 8, 'Caja': 9, 'Botella': 10,
  'Bolsa': 11, 'Porción': 12, 'Docena': 13, 'Otro': 14
};

// === VARIABLES GLOBALES ===
let productos = [];
let usuarios = [];
let currentPageUsuarios = 1;
const itemsPerPageUsuarios = 10;

// === VISTA PRODUCTOS (GRID / TABLA) ===
document.getElementById('gridViewBtn')?.addEventListener('click', function () {
  document.getElementById('gridViewBtn').classList.add('active');
  document.getElementById('tableViewBtn').classList.remove('active');
  document.getElementById('productsGridView').style.display = 'flex';
  document.getElementById('productsTableView').style.display = 'none';
});

document.getElementById('tableViewBtn')?.addEventListener('click', function () {
  document.getElementById('tableViewBtn').classList.add('active');
  document.getElementById('gridViewBtn').classList.remove('active');
  document.getElementById('productsTableView').style.display = 'block';
  document.getElementById('productsGridView').style.display = 'none';
});

// === CARGAR NOMBRE DE USUARIO ===
function cargarNombreUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const nombre = usuario.credenciales?.nombre || 'Administrador';
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
    document.getElementById('gridViewBtn').click();
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    productos = [];
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

// === USUARIOS ===
async function cargarUsuarios() {
  Swal.fire({ title: 'Cargando Usuarios...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  try {
    const response = await fetch(`${API_BASE}/user/all`);
    if (!response.ok) throw new Error('Error al cargar usuarios');
    usuarios = await response.json();

    usuarios = usuarios.map(u => ({
      ...u,
      estado: u.estado === 'Activa' ? 'Activa' : 'Inactiva'
    }));

    renderUsuariosTable();
    setupUsuariosPagination();
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    usuarios = [];
    renderUsuariosTable();
  }
}

function renderUsuariosTable() {
  const tbody = document.querySelector('#customersTable tbody');
  const search = (document.getElementById('searchCustomers')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filterStatus')?.value || '';

  let filtered = usuarios.filter(u => {
    const matchSearch = (u.nombre || '').toLowerCase().includes(search) || 
                        (u.email || '').toLowerCase().includes(search);
    const matchStatus = !statusFilter || u.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const start = (currentPageUsuarios - 1) * itemsPerPageUsuarios;
  const end = start + itemsPerPageUsuarios;
  const pageData = filtered.slice(start, end);

  tbody.innerHTML = '';
  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron usuarios.</td></tr>`;
    document.getElementById('customersCount').textContent = `Mostrando 0 de ${filtered.length} usuarios`;
    return;
  }

  pageData.forEach(u => {
    const estadoClass = u.estado === 'Activa' ? 'delivered' : 'pending';
    const foto = u.foto || 'https://via.placeholder.com/40?text=U';
    const fecha = new Date(u.fechaRegistro).toLocaleDateString('es-CO');

    tbody.innerHTML += `
      <tr>
        <td><img src="${foto}" alt="foto" class="rounded-circle" width="40" height="40" onerror="this.src='https://via.placeholder.com/40?text=U'"></td>
        <td class="align-middle">${u.nombre || 'Sin nombre'}</td>
        <td class="align-middle">${u.email}</td>
        <td class="align-middle">${fecha}</td>
        <td class="align-middle"><span class="status ${estadoClass}">${u.estado}</span></td>
        <td class="align-middle">
          <button class="btn btn-sm btn-outline-primary" title="Ver detalles" onclick="verDetalleUsuario('${u.email}')">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>`;
  });

  document.getElementById('customersCount').textContent = 
    `Mostrando ${start + 1}-${Math.min(end, filtered.length)} de ${filtered.length} usuarios`;
}

function setupUsuariosPagination() {
  const search = (document.getElementById('searchCustomers')?.value || '').toLowerCase();
  const status = document.getElementById('filterStatus')?.value || '';
  const totalFiltered = usuarios.filter(u => {
    const matchSearch = (u.nombre || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
    const matchStatus = !status || u.estado === status;
    return matchSearch && matchStatus;
  }).length;

  const pages = Math.ceil(totalFiltered / itemsPerPageUsuarios);
  const pagination = document.getElementById('customersPagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= pages; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPageUsuarios ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
  }
}

function verDetalleUsuario(email) {
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return;

  Swal.fire({
    title: usuario.nombre || 'Usuario',
    html: `
      <p><strong>Email:</strong> ${usuario.email}</p>
      <p><strong>Estado:</strong> ${usuario.estado}</p>
      <p><strong>Registrado:</strong> ${new Date(usuario.fechaRegistro).toLocaleString('es-CO')}</p>
      ${usuario.ciudad ? `<p><strong>Ciudad:</strong> ${usuario.ciudad}</p>` : ''}
    `,
    imageUrl: usuario.foto || undefined,
    imageAlt: 'Foto de perfil',
    imageWidth: 150,
    imageHeight: 150,
  });
}

// Filtros y paginación
document.getElementById('searchCustomers')?.addEventListener('input', () => {
  currentPageUsuarios = 1;
  renderUsuariosTable();
  setupUsuariosPagination();
});

document.getElementById('filterStatus')?.addEventListener('change', () => {
  currentPageUsuarios = 1;
  renderUsuariosTable();
  setupUsuariosPagination();
});

document.getElementById('customersPagination')?.addEventListener('click', e => {
  const page = e.target.dataset.page;
  if (page) {
    e.preventDefault();
    currentPageUsuarios = parseInt(page);
    renderUsuariosTable();
    setupUsuariosPagination();
  }
});

document.getElementById('exportCustomersBtn')?.addEventListener('click', () => {
  const datosExport = usuarios.map(u => ({
    Nombre: u.nombre || 'Sin nombre',
    Email: u.email,
    Estado: u.estado,
    "Fecha Registro": new Date(u.fechaRegistro).toLocaleDateString('es-CO')
  }));

  const ws = XLSX.utils.json_to_sheet(datosExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
  XLSX.writeFile(wb, "usuarios_delicias_verdes.xlsx");
});

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
    else if (section === 'customers') { 
      currentPageUsuarios = 1; 
      cargarUsuarios(); 
    }
  });
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

// === MENÚ USUARIO ===
document.addEventListener('DOMContentLoaded', function () {
  const userProfile = document.getElementById('userProfile');
  const userDropdown = document.getElementById('userDropdown');

  if (!userProfile || !userDropdown) return;

  userProfile.addEventListener('click', function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });

  document.addEventListener('click', function () {
    userDropdown.classList.remove('show');
  });

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

// === PREVISUALIZACIÓN IMAGEN PRODUCTO ===
document.getElementById('productImagen')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('imagePreview');
  const container = document.getElementById('previewContainer');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      preview.src = ev.target.result;
      container.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    container.style.display = 'none';
    preview.src = '';
  }
});

// === EDITAR / GUARDAR PRODUCTO ===
document.getElementById('productsSection')?.addEventListener('click', e => {
  const editBtn = e.target.closest('.edit-product');
  if (editBtn) {
    const id = editBtn.dataset.id;
    const producto = productos.find(p => p.id == id);
    if (!producto) return;

    document.getElementById('productModalTitle').textContent = 'Editar Producto';
    document.getElementById('editProductId').value = producto.id;
    document.getElementById('productNombre').value = producto.nombre;
    document.getElementById('productPrecio').value = producto.precio;
    document.getElementById('productDescripcion').value = producto.descripcion;
    document.getElementById('productCategoria').value = producto.categoria;
    document.getElementById('productValorContenido').value = producto.valorcontenido || '';
    document.getElementById('productTipoContenido').value = producto.tipoContenido || '';
    document.getElementById('productCantidad').value = producto.cantidad || 40;
    document.getElementById('productCantidadMin').value = producto.cantidadMin || 10;
    document.getElementById('productCantidadMax').value = producto.cantidadMax || 100;

    if (producto.imagen) {
      document.getElementById('imagePreview').src = producto.imagen;
      document.getElementById('previewContainer').style.display = 'block';
    }

    new bootstrap.Modal(document.getElementById('addProductModal')).show();
  }
});

document.getElementById('saveProductBtn')?.addEventListener('click', async function() {
  const editId = document.getElementById('editProductId').value;
  const esEdicion = editId && editId !== '';

  const formData = new FormData();
  const imagenFile = document.getElementById('productImagen').files[0];

  const productoData = {
    nombre: document.getElementById('productNombre').value.trim(),
    precio: parseFloat(document.getElementById('productPrecio').value),
    descripcion: document.getElementById('productDescripcion').value.trim(),
    categoria: document.getElementById('productCategoria').value,
    valorcontenido: parseInt(document.getElementById('productValorContenido').value) || 0,
    tipoContenido: document.getElementById('productTipoContenido').value,
    fecha_ingreso: new Date().toISOString().split('T')[0] + "T00:00:00",
    cantidad: parseInt(document.getElementById('productCantidad').value),
    cantidadMax: parseInt(document.getElementById('productCantidadMax').value),
    cantidadMin: parseInt(document.getElementById('productCantidadMin').value)
  };

  if (esEdicion) {
    productoData.id = parseInt(editId);
  }

  formData.append('producto', new Blob([JSON.stringify(productoData)], { type: 'application/json' }));
  if (imagenFile) {
    formData.append('imagen', imagenFile);
  }

  const url = esEdicion ? `${API_BASE}/producto/editar` : `${API_BASE}/producto/crear`;
  const method = esEdicion ? 'PUT' : 'POST';

  try {
    document.getElementById('saveProductText').textContent = 'Guardando...';
    this.disabled = true;

    const response = await fetch(url, { method, body: formData });
    if (!response.ok) throw new Error('Error del servidor');

    Swal.fire('Éxito', esEdicion ? 'Producto actualizado' : 'Producto creado', 'success');
    bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
    cargarProductos();

  } catch (err) {
    console.error(err);
    Swal.fire('Error', err.message || 'No se pudo guardar', 'error');
  } finally {
    this.disabled = false;
    document.getElementById('saveProductText').textContent = 'Guardar Producto';
  }
});

document.getElementById('addProductModal')?.addEventListener('hidden.bs.modal', function () {
  document.getElementById('productForm').reset();
  document.getElementById('editProductId').value = '';
  document.getElementById('productModalTitle').textContent = 'Agregar Nuevo Producto';
  document.getElementById('previewContainer').style.display = 'none';
});

document.getElementById('productsSection')?.addEventListener('click', e => {
  const deleteBtn = e.target.closest('.delete-product');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`${API_BASE}/producto/eliminar/byId/${id}`, { method: 'DELETE' })
          .then(() => { Swal.fire('Eliminado', '', 'success'); cargarProductos(); })
          .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
      }
    });
  }
});