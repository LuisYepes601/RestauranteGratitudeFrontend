/* ==============================================================
   gestionPerfil.js – PERFIL + FOTO + PERSONAL + CONTRASEÑA + DIRECCIÓN + IDENTIFICACIÓN
   ============================================================== */

let datosUsuario = {};
let archivoSeleccionado = null;

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

/* ==============================================================
   CARGAR PERFIL
   ============================================================== */
async function obtenerPerfil() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id = usuario?.credenciales?.id;

    if (!id) throw new Error("No se encontró el ID del usuario en localStorage");

    const response = await fetch(`http://localhost:8080/perfil/consulrtasDatos/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    datosUsuario = data;
    cargarPerfil(data);
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
  const rol = safe(data.rol).trim();
  botonVolver.href = rol === "Usuario" ? "/Menu/index.html" : "/home";
}

/* ==============================================================
   MODAL: EDITAR FOTO
   ============================================================== */
function editarFoto() {
  const modal = document.getElementById("modalEditarFoto");
  const preview = document.getElementById("previewFoto");
  const fotoUrl = safe(datosUsuario.fotoPerfil);
  const defaultUrl = "https://randomuser.me/api/portraits/men/32.jpg";

  if (!modal || !preview) return;

  preview.src = fotoUrl !== "Sin información" ? fotoUrl : defaultUrl;
  const input = document.getElementById("fotoInput");
  const btn = document.getElementById("btnSubirFoto");
  const text = document.getElementById("uploadText");

  if (input) input.value = "";
  if (btn) btn.disabled = true;
  if (text) text.textContent = "Arrastra una imagen aquí o haz clic para seleccionar";

  modal.style.display = "block";
}

function cerrarModalFoto() {
  const modal = document.getElementById("modalEditarFoto");
  if (modal) modal.style.display = "none";
  archivoSeleccionado = null;
}

document.addEventListener("click", function (event) {
  const modal = document.getElementById("modalEditarFoto");
  if (event.target === modal) cerrarModalFoto();
});

/* ==============================================================
   MANEJO DE FOTO
   ============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const fotoInput = document.getElementById("fotoInput");
  const btnSubirFoto = document.getElementById("btnSubirFoto");
  const previewFoto = document.getElementById("previewFoto");
  const uploadArea = document.getElementById("uploadArea");
  const uploadText = document.getElementById("uploadText");

  if (!fotoInput || !btnSubirFoto || !previewFoto || !uploadArea || !uploadText) return;

  fotoInput.addEventListener("change", (e) => {
    if (e.target.files[0]) validarYPrevisualizar(e.target.files[0]);
  });

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });
  uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("drag-over"));
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      fotoInput.files = e.dataTransfer.files;
      validarYPrevisualizar(file);
    }
  });

  function validarYPrevisualizar(file) {
    if (!file.type.startsWith("image/")) return Swal.fire("Error", "Solo imágenes", "error");
    if (file.size > 5 * 1024 * 1024) return Swal.fire("Error", "Máximo 5MB", "error");

    const reader = new FileReader();
    reader.onload = (e) => {
      previewFoto.src = e.target.result;
      archivoSeleccionado = file;
      btnSubirFoto.disabled = false;
      uploadText.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }

  btnSubirFoto.addEventListener("click", async () => {
    if (!archivoSeleccionado) return;

    Swal.fire({ title: "Subiendo...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const id = usuario?.credenciales?.id;
      if (!id) throw new Error("ID no encontrado");

      const formData = new FormData();
      formData.append("imagen", archivoSeleccionado);

      const response = await fetch(`http://localhost:8080/perfil/foto/agregar/${id}`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error(await response.text() || "Error");

      await Swal.fire({ icon: "success", title: "¡Foto subida!", timer: 2000, timerProgressBar: true });
      await obtenerPerfil();
      cerrarModalFoto();

    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  });
});

/* ==============================================================
   MODAL: EDITAR DIRECCIÓN
   ============================================================== */
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

/* ==============================================================
   MODAL: EDITAR IDENTIFICACIÓN
   ============================================================== */
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
   MODAL: EDITAR PERSONAL
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

/* ==============================================================
   MODAL: CAMBIAR CONTRASEÑA
   ============================================================== */
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

/* ==============================================================
   ENVÍO FORMULARIO PERSONAL
   ============================================================== */
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

/* ==============================================================
   ENVÍO CONTRASEÑA
   ============================================================== */
document.getElementById("formCambiarContrasena").addEventListener("submit", async (e) => {
  e.preventDefault();

  const actual = document.getElementById("contrasenaActual").value;
  const nueva = document.getElementById("contrasenaNueva").value;
  const confirmar = document.getElementById("confirmarContrasena").value;
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!actual || !nueva || !confirmar) return Swal.fire("Warning", "Completa todos los campos", "warning");
  if (nueva.length < 6) return Swal.fire("Warning", "Mínimo 6 caracteres", "warning");
  if (nueva !== confirmar) return Swal.fire("Error", "No coinciden", "error");

  const datos = {
    email: safe(datosUsuario.correo, usuario.credenciales.correo),
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
    cerrarModalContrasena();

  } catch (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
  }
});

/* ==============================================================
   INICIALIZACIÓN
   ============================================================== */
window.addEventListener("DOMContentLoaded", obtenerPerfil);

function toggle2FA() { document.getElementById("toggle2FA").classList.toggle("active"); }