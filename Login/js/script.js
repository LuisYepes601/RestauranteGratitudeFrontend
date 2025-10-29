
function mostrarNotificacion(mensaje) {

  let tarjeta = document.querySelector(".tarjeta-notificacion ");

  if (tarjeta == null) {
    return;
  }

  tarjeta.innerHTML = mensaje;
  tarjeta.style.display = "block";

  setTimeout(() => {
    tarjeta.style.display = "none";
  }, 5000);

}


async function inciarSesion() {

  const usuario = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!usuario && !password) {
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
      Swal.showLoading(); //
    }
  });

  const response = await fetch('http://localhost:8080/login/iniciarSesion', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      correo: usuario,
      contrasenia: password
    })

  })

  const datos = await response.json();
  console.log(response.status);


  if (response.status == 200) {

    localStorage.setItem("usuario", JSON.stringify(datos));



    const redirectUrl = localStorage.getItem("redirectAfterLogin");

    if (redirectUrl) {
      // Si no hay, lo mandamos al home por defecto
      const destino = redirectUrl ? redirectUrl : "index.html";

      window.location.href = destino;
      localStorage.removeItem("redirectAfterLogin");

    }



  }

  if (response.status == 400) {
    Swal.fire({
      icon: 'error',
      title: "Datos invalidos.",
      text: datos.Error,
      confirmButtonText: 'Aceptar', // 
      confirmButtonColor: '#2e7d32',
      allowOutsideClick: false
    });

  }

  if (response.status == 404) {
    Swal.fire({
      icon: 'error',
      title: datos.mensaje,
      text: datos.Error,
      confirmButtonText: 'Aceptar', // 
      confirmButtonColor: '#2e7d32',
      allowOutsideClick: false
    });

  }

  if (response.status >= 500) {
    Swal.fire({
      icon: 'error',
      title: 'Error en el servidor',
      text: 'Por favor espera un momento o inténtalo nuevamente',
      confirmButtonText: 'Aceptar', // 
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false
    });

  }

  console.log(datos);




}

const btn_enviar = document.querySelector(".btn-primary");


btn_enviar.addEventListener("click", (e) => {

  e.preventDefault();

  inciarSesion();

})



