/* ==============================================================
   gestionPerfil.js – PERFIL COMPLETO + MEJORAS (TODO EN UNO)
   ============================================================== */




let datosUsuario = {};
let archivoSeleccionado = null;
let cropper = null;
let archivoFoto = null;

function formatearFecha(fechaISO) {
  if (!fechaISO) return "Sin información";
  try {
    const d = new Date(fechaISO);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return "Sin información"; }
}

function safe(value, fallback = "Sin información") {
  return value === null || value === undefined || value === "" ? fallback : value;
}

const main = document.querySelector(".container");
main.style.display = "none";
/* ==============================================================
   CARGAR PERFIL
   ============================================================== */
async function obtenerPerfil() {

  Swal.fire({
    title: 'Cargando...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id = usuario?.credenciales?.id;

    if (!id) throw new Error("No se encontró el ID del usuario en localStorage");

    const response = await fetch(`http://localhost:8080/perfil/consulrtasDatos/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });



    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    Swal.close();
    main.style.display = "block";

    const data = await response.json();
    datosUsuario = data;
    cargarPerfil(data);
    await cargarMejoras(); // ← Carga estadísticas y pedidos recientes
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo cargar el perfil. Verifica el backend o tu sesión.",
      confirmButtonColor: "#2e7d32"
    });
  }
}

function cargarPerfil(data) {
  document.getElementById("nombreCompleto").textContent =
    `${safe(data.primerNombre)} ${safe(data.segundoNombre)}`.trim();
  document.getElementById("nombres").textContent =
    `${safe(data.primerNombre)} ${safe(data.segundoNombre)}`.trim();
  document.getElementById("apellidos").textContent =
    `${safe(data.primerApellido)} ${safe(data.segundoApellido)}`.trim();
  document.getElementById("correo").textContent = safe(data.correo, "Sin correo");
  document.getElementById("telefono").textContent = safe(data.telefono);
  document.getElementById("fechaNacimiento").textContent = formatearFecha(data.fechaNacimiento);
  document.getElementById("sexoGenero").textContent = `${safe(data.sexo)} / ${safe(data.genero)}`;
  document.getElementById("rol").textContent = safe(data.rol);

  const estado = data.estadoCuenta?.toLowerCase() === "activa" ? "Activo" : "Inactivo";
  document.getElementById("estadoCuenta").innerHTML =
    `<i class="fas fa-circle" style="font-size:0.6rem;"></i> ${estado}`;

  document.getElementById("pais").textContent = safe(data.pais);
  document.getElementById("departamento").textContent = safe(data.departamento);
  document.getElementById("ciudad").textContent = safe(data.ciudad);
  document.getElementById("municipioBarrio").textContent =
    `${safe(data.municipio)} - ${safe(data.barrio)}`;
  document.getElementById("tipoDireccion").textContent = safe(data.tipoDirecion);
  document.getElementById("tipoIdentificacion").textContent = safe(data.tipoIdertificacion);
  document.getElementById("numeroIdentificacion").textContent = safe(data.numeroIdentificacion);

  const img = document.getElementById("fotoPerfil");
  const fotoUrl = safe(data.fotoPerfil);
  const defaultUrl = "https://randomuser.me/api/portraits/men/32.jpg";
  img.src = fotoUrl !== "Sin información" ? fotoUrl : defaultUrl;

  const botonVolver = document.querySelector(".back-menu a");
  console.log(data.rol);

  const rol = safe(data.rol).trim();
  botonVolver.href = rol === "Usuario" ? "/Menu/index.html" : "/Menu/index.html";
  botonVolver.href = rol === "Administrador" ? "/Admin/index.html" : "/Menu/index.html";
}

/* ==============================================================
   MEJORAS: ESTADÍSTICAS + PEDIDOS RECIENTES
   ============================================================== */
async function cargarMejoras() {

  const container = document.getElementById("ultimosPedidos");

  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id = usuario?.credenciales?.id;
    const rol = usuario.credenciales.rol;

    if (rol == "Usuario") {



      if (!id) {
        container.innerHTML = `<p class="text-muted text-center">No hay usuario</p>`;
        return;
      }


      // NUEVO ENDPOINT: /pedidos/recientes/usuario/{id}?limite=2
      const pedidosRes = await fetch(`http://localhost:8080/pedidos/recientes/usuario/${id}?limite=3`);


      if (!pedidosRes.ok) {
        container.innerHTML = `<p class="text-muted text-center">No hay pedidos recientes</p>`;
        return;
      }
      Swal.close();
      main.style.display = "block";

      const pedidos = await pedidosRes.json();

      if (!pedidos || pedidos.length === 0) {
        container.innerHTML = `<p class="text-muted text-center">No hay pedidos recientes</p>`;
        return;
      }

      // Cargar estadísticas (usando solo los pedidos recientes)
      cargarEstadisticas(pedidos);

      // Cargar pedidos recientes
      cargarUltimosPedidos(pedidos);
    }

    if (rol == "Administrador") {

      const pedidos_recientes = document.querySelector(".pedidos_recientes");
      const estadisticas = document.querySelector(".estadisticas");

      estadisticas.style.display = "none";
      pedidos_recientes.style.display = "none";
    }

  } catch (err) {
    console.error("Error al cargar pedidos recientes:", err);
    container.innerHTML = `<p class="text-muted text-center">Error de conexión</p>`;
  }




}

function cargarEstadisticas(pedidos) {
  const total = pedidos.length;
  const nivel = total >= 2 ? "Activo" : total >= 1 ? "Novato" : "Sin actividad";
  document.getElementById("totalPedidos").textContent = total;
  document.getElementById("nivelUsuario").textContent = nivel;
  document.getElementById("notificaciones").textContent = Math.floor(Math.random() * 5);
}

function cargarUltimosPedidos(pedidos) {
  const container = document.getElementById("ultimosPedidos");
  if (pedidos.length === 0) {
    container.innerHTML = `<p class="text-muted text-center">Sin pedidos recientes</p>`;
    return;
  }

  container.innerHTML = pedidos.map(p => `
    <div class="order-mini">
      <div>
        <div class="fw-bold">Nº${p.idPedido}</div>
        <small class="text-muted">${formatearFecha(p.fechaPedido)}</small>
      </div>
      <div class="text-end">
        <div>COP $${p.total?.toFixed(2) || '0.00'}</div>
        <small class="text-success">${p.estadoPedido || 'Pendiente'}</small>
      </div>
    </div>
  `).join("");
}

/* ==============================================================
   CROPPER.JS - FOTO RECORTADA
   ============================================================== */
function abrirCropper() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById("cropperImage").src = ev.target.result;
      document.getElementById("modalCropper").style.display = "block";
      if (cropper) cropper.destroy();
      cropper = new Cropper(document.getElementById("cropperImage"), {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8,
      });
      archivoFoto = file;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function cerrarCropper() {
  document.getElementById("modalCropper").style.display = "none";
  if (cropper) cropper.destroy();
}

async function guardarFotoRecortada() {
  if (!cropper || !archivoFoto) return;
  const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
  canvas.toBlob(async blob => {
    const formData = new FormData();
    formData.append("imagen", blob, "perfil.jpg");

    Swal.fire({ title: "Subiendo...", didOpen: () => Swal.showLoading() });

    try {
      const id = JSON.parse(localStorage.getItem("usuario"))?.credenciales?.id;
      const res = await fetch(`http://localhost:8080/perfil/foto/agregar/${id}`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Error al subir");
      await Swal.fire("¡Listo!", "Foto actualizada", "success");
      document.getElementById("fotoPerfil").src = URL.createObjectURL(blob);
      cerrarCropper();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  });
}

/* ==============================================================
   MODO OSCURO
   ============================================================== */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
}

// Aplicar modo oscuro guardado
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

/* ==============================================================
   MODALES ORIGINALES (sin cambios)
   ============================================================== */
function editarDatosPersonales() {
  document.getElementById("edit_primerNombre").value = safe(datosUsuario.primerNombre);
  document.getElementById("edit_segundoNombre").value = safe(datosUsuario.segundoNombre);
  document.getElementById("edit_primerApellido").value = safe(datosUsuario.primerApellido);
  document.getElementById("edit_segundoApellido").value = safe(datosUsuario.segundoApellido);
  document.getElementById("edit_correo").value = safe(datosUsuario.correo, "");
  document.getElementById("edit_telefono").value = safe(datosUsuario.telefono);
  document.getElementById("edit_sexo").value = safe(datosUsuario.sexo, "Masculino");
  document.getElementById("edit_genero").value = safe(datosUsuario.genero, "Masculino");

  document.getElementById("modalEditarPersonal").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modalEditarPersonal").style.display = "none";
}

window.onclick = function (event) {
  const modalPersonal = document.getElementById("modalEditarPersonal");
  if (event.target === modalPersonal) cerrarModal();
};

document.getElementById("formEditarPersonal").addEventListener("submit", async (e) => {
  e.preventDefault();

  const datosEditados = {
    primerNombre: document.getElementById("edit_primerNombre").value.trim(),
    segundoNombre: document.getElementById("edit_segundoNombre").value.trim(),
    primerApellido: document.getElementById("edit_primerApellido").value.trim(),
    segundoApellido: document.getElementById("edit_segundoApellido").value.trim(),
    correo: document.getElementById("edit_correo").value.trim() || null,
    telefono: document.getElementById("edit_telefono").value.trim(),
    sexo: document.getElementById("edit_sexo").value,
    genero: document.getElementById("edit_genero").value,
  };

  Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id = usuario?.credenciales?.id;
    if (!id) throw new Error("No se encontró el ID del usuario");

    const response = await fetch(`http://localhost:8080/perfil/editar/informacionPersonal/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEditados),
    });

    if (!response.ok) throw new Error(await response.text() || "Error");

    await Swal.fire({ icon: "success", title: "¡Guardado!", timer: 2000, timerProgressBar: true });
    await obtenerPerfil();
    cerrarModal();

  } catch (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
  }
});

function cambiarContrasena() {
  document.getElementById("contrasenaActual").value = "";
  document.getElementById("contrasenaNueva").value = "";
  document.getElementById("confirmarContrasena").value = "";
  document.getElementById("modalCambiarContrasena").style.display = "block";
}

function cerrarModalContrasena() {
  document.getElementById("modalCambiarContrasena").style.display = "none";
}

document.addEventListener("click", function (event) {
  const modalContrasena = document.getElementById("modalCambiarContrasena");
  if (event.target === modalContrasena) cerrarModalContrasena();
});

document.getElementById("formCambiarContrasena").addEventListener("submit", async (e) => {
  e.preventDefault();

  const actual = document.getElementById("contrasenaActual").value;
  const nueva = document.getElementById("contrasenaNueva").value;
  const confirmar = document.getElementById("confirmarContrasena").value;
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!actual || !nueva || !confirmar) 
    return Swal.fire("Warning", "Completa todos los campos", "warning");

  if (nueva.length < 6) 
    return Swal.fire("Warning", "Mínimo 6 caracteres", "warning");

  if (nueva !== confirmar) 
    return Swal.fire("Error", "No coinciden", "error");

  // *** CAMBIO REALIZADO AQUÍ ***
  console.log(usuario);
  
  const datos = {
    email: usuario.credenciales.correo,  // ← CORREGIDO
    contraseaActual: actual,
    contraseñaNueva: nueva
  };

  Swal.fire({ title: "Cambiando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch("http://localhost:8080/cambiarContraseña/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!response.ok) throw new Error(await response.text() || "Error");

    await Swal.fire({ icon: "success", title: "¡Cambiada!", text: "Vuelve a iniciar sesión.", timer: 3000 });
    localStorage.removeItem("usuario");
    window.location.href = "/Login/index.html";
    cerrarModalContrasena();

  } catch (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
  }
});

function editarDireccion() {
  document.getElementById("edit_pais").value = safe(datosUsuario.pais);
  document.getElementById("edit_departamento").value = safe(datosUsuario.departamento);
  document.getElementById("edit_ciudad").value = safe(datosUsuario.ciudad);
  document.getElementById("edit_municipio").value = safe(datosUsuario.municipio);
  document.getElementById("edit_barrio").value = safe(datosUsuario.barrio);
  document.getElementById("edit_tipoDireccion").value = safe(datosUsuario.tipoDirecion, "Residencial");

  document.getElementById("modalEditarDireccion").style.display = "block";
}

function cerrarModalDireccion() {
  document.getElementById("modalEditarDireccion").style.display = "none";
}

document.addEventListener("click", function (event) {
  const modal = document.getElementById("modalEditarDireccion");
  if (event.target === modal) cerrarModalDireccion();
});

document.getElementById("formEditarDireccion").addEventListener("submit", async (e) => {
  e.preventDefault();

  const datosDireccion = {
    pais: document.getElementById("edit_pais").value.trim(),
    departamento: document.getElementById("edit_departamento").value.trim(),
    ciudad: document.getElementById("edit_ciudad").value.trim(),
    municipio: document.getElementById("edit_municipio").value.trim(),
    barrio: document.getElementById("edit_barrio").value.trim(),
    tipoDirecion: document.getElementById("edit_tipoDireccion").value
  };

  Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id = usuario?.credenciales?.id;
    if (!id) throw new Error("ID no encontrado");

    const response = await fetch(`http://localhost:8080/perfil/editar/direccion/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosDireccion)
    });

    if (!response.ok) throw new Error(await response.text() || "Error");

    await Swal.fire({ icon: "success", title: "¡Dirección guardada!", timer: 2000 });
    await obtenerPerfil();
    cerrarModalDireccion();

  } catch (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
  }
});

function editarIdentificacion() {
  document.getElementById("edit_tipoIdentificacion").value = safe(datosUsuario.tipoIdertificacion);
  document.getElementById("edit_numeroIdentificacion").value = safe(datosUsuario.numeroIdentificacion);

  document.getElementById("modalEditarIdentificacion").style.display = "block";
}

function cerrarModalIdentificacion() {
  document.getElementById("modalEditarIdentificacion").style.display = "none";
}

document.addEventListener("click", function (event) {
  const modal = document.getElementById("modalEditarIdentificacion");
  if (event.target === modal) cerrarModalIdentificacion();
});

document.getElementById("formEditarIdentificacion").addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero = document.getElementById("edit_numeroIdentificacion").value.trim();
  if (!/^\d+$/.test(numero)) {
    return Swal.fire("Error", "El número debe contener solo dígitos", "error");
  }

  const datosIdentificacion = {
    tipoIdentificacion: document.getElementById("edit_tipoIdentificacion").value,
    numero: numero
  };

  Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id = usuario?.credenciales?.id;
    if (!id) throw new Error("ID no encontrado");

    const response = await fetch(`http://localhost:8080/perfil/editar/identificacion/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosIdentificacion)
    });

    if (!response.ok) throw new Error(await response.text() || "Error");

    await Swal.fire({ icon: "success", title: "¡Identificación guardada!", timer: 2000 });
    await obtenerPerfil();
    cerrarModalIdentificacion();

  } catch (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
  }
});

/* ==============================================================
   INICIALIZACIÓN ÚNICA
   ============================================================== */
window.addEventListener("DOMContentLoaded", obtenerPerfil);