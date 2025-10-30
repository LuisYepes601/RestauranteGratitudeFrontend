function mostrarNotificacion(mensaje) {
  let tarjeta = document.querySelector(".tarjeta-notificacion");

  if (tarjeta == null) {
    return;
  }

  tarjeta.innerHTML = mensaje;
  tarjeta.style.display = "block";

  setTimeout(() => {
    tarjeta.style.display = "none"; // ← CORREGIDO: faltaba =
  }, 5000);
}

// === RUTAS POR ROL ===
const RUTAS_POR_ROL = {
  "admin": "../Admin/dashboard.html",
  "administrador": "../Admin/dashboard.html",
  "moderador": "../Moderacion/panel.html",
  "cliente": "../Menu/index.html",
  "usuario": "../Menu/index.html"
};

const RUTA_DEFAULT = "../Menu/index.html";

// === OBTENER ROL DEL USUARIO ===
function obtenerRol(usuario) {
  return usuario?.credenciales?.rol || 
         usuario?.rol || 
         usuario?.tipo || 
         "cliente";
}

// === VALIDAR RUTA SEGÚN ROL ===
function esRutaValidaParaRol(ruta, rol) {
  const rolLower = rol.toLowerCase();
  const rutaLower = ruta.toLowerCase();

  if (["admin", "administrador"].includes(rolLower)) return true;
  if (rolLower === "moderador" && rutaLower.includes("/admin/")) return false;
  if (["cliente", "usuario"].includes(rolLower)) {
    return !rutaLower.includes("/admin/") && !rutaLower.includes("/moderacion/");
  }
  return true;
}

async function inciarSesion() {
  const usuario = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!usuario || !password) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Debes ingresar tu correo y tu contraseña.",
      confirmButtonColor: "#0d6efd"
    });
    return;
  }

  Swal.fire({
    title: 'Iniciando sesión',
    text: 'Por favor espera un momento',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await fetch('http://localhost:8080/login/iniciarSesion', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo: usuario,
        contrasenia: password
      })
    });

    const datos = await response.json();

    // === ÉXITO: 200 ===
    if (response.status === 200) {
      // Guardar usuario
      localStorage.setItem("usuario", JSON.stringify(datos));

      // Obtener rol
      const rol = obtenerRol(datos).toLowerCase();

      // Ruta por defecto según rol
      let destino = RUTAS_POR_ROL[rol] || RUTA_DEFAULT;

      // Si hay redirección guardada (desde menú)
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin"); // ← Siempre limpiar
        if (esRutaValidaParaRol(redirectUrl, rol)) {
          destino = redirectUrl;
        }
        // Si no es válida (ej: cliente intenta ir a admin), se queda en su ruta
      }

      // Redirigir
      window.location.href = destino;
      return;
    }

    // === ERRORES ===
    if (response.status === 400) {
      Swal.fire({
        icon: 'error',
        title: "Datos inválidos",
        text: datos.Error || "Verifica tus credenciales",
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
    } else if (response.status === 404) {
      Swal.fire({
        icon: 'error',
        title: datos.mensaje || "Usuario no encontrado",
        text: datos.Error || "",
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
    } else if (response.status >= 500) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Por favor espera un momento o inténtalo nuevamente',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo conectar al servidor',
      confirmButtonColor: '#d32f2f'
    });
  }
}

// === EVENTO DEL BOTÓN ===
const btn_enviar = document.querySelector(".btn-primary");

btn_enviar.addEventListener("click", (e) => {
  e.preventDefault();
  inciarSesion();
});