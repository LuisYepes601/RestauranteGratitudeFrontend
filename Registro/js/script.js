// =====================================================
// 🔒 Mostrar / Ocultar contraseña
// =====================================================
function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

// =====================================================
// 🗓️ Función para formatear fecha al formato dd/MM/yyyy
// =====================================================
function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    const [yyyy, mm, dd] = fechaISO.split("-");
    return `${dd}/${mm}/${yyyy}`;
}

// =====================================================
// 🧭 Evento principal al cargar el documento
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    const rolSelect = document.getElementById("rol");
    const codigoRolGroup = document.getElementById("codigoRolGroup");
    const submitBtn = document.getElementById("submitBtn");
    const form = document.getElementById("basicForm");

    // 🎭 Mostrar u ocultar campo de código según el rol
    rolSelect.addEventListener("change", () => {
        const rol = rolSelect.value;

        if (rol && rol !== "Usuario") {
            codigoRolGroup.style.display = "block";
            submitBtn.textContent = "Guardar y continuar";
        } else {
            codigoRolGroup.style.display = "none";
            document.getElementById("codigoRol").value = "";
            submitBtn.textContent = "Registrar";
        }
    });

    // 📨 Validar y enviar formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        const confirmEmail = form.confirmEmail.value.trim();
        const password = form.contrasena.value.trim();
        const confirmPassword = form.confirmarContrasena.value.trim();
        const rol = form.rol.value.trim();

        // Validaciones básicas
        if (email !== confirmEmail) {
            Swal.fire({
                icon: "error",
                title: "Correos no coinciden",
                text: "Por favor verifica los correos electrónicos.",
                confirmButtonColor: "#d33"
            });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Contraseñas no coinciden",
                text: "Por favor asegúrate de que ambas contraseñas sean iguales.",
                confirmButtonColor: "#d33"
            });
            return;
        }

        if (rol !== "Usuario" && !form.codigoRol.value.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Falta código de rol",
                text: "Debes ingresar el código de autorización para continuar.",
                confirmButtonColor: "#f39c12"
            });
            return;
        }

        // 🧾 Crear cuerpo base
        const dataUsuario = {
            primerNombre: form.primerNombre.value,
            segundoNombre: form.segundoNombre.value,
            primerApellido: form.primerApellido.value,
            segundoApellido: form.segundoApellido.value,
            telefono: form.telefono.value,
            email,
            tipoIdentificacion: form.tipoIdentificacion.value,
            numeroDeIdentificacion: form.numeroIdentificacion.value,
            rol,
            pais: "colombia",
            barrio: form.barrio.value,
            departamento: form.departamento.value,
            ciudad: form.ciudad.value,
            municipio: form.municipio.value,
            calle: form.calle.value,
            tipoDireccion: form.tipoDireccion.value,
            fechaNacimiento: formatearFecha(form.fechaNacimiento.value),
            contraseña: password,
            genero: form.genero.value,
            sexo: form.sexo.value
        };

        // Añadir código de rol si aplica
        if (rol !== "Usuario") {
            dataUsuario.codigoRol = form.codigoRol.value.trim();
        }

        // 🌐 Seleccionar endpoint y cuerpo
        let endpoint;
        let data;

        if (rol === "Usuario") {
            endpoint = "http://localhost:8080/login/registro/usuario/basico";
            data = dataUsuario;
        } else {
            endpoint = "http://localhost:8080/login/registro/usuario/empleado";
            data = { usuarioBasicoDto: dataUsuario };
        }

        console.log("📤 Enviando datos a:", endpoint);
        console.log("🧾 Contenido:", data);

        // 🚀 Enviar datos al servidor
        try {
            Swal.fire({
                title: "Procesando...",
                text: "Por favor espera mientras registramos tus datos.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const status = response.status;
            const datos = await response.json();

            Swal.close();

            // 💬 Manejar respuestas
            if (status >= 200 && status < 300) {
                if (rol === "Usuario") {
                    await Swal.fire({
                        icon: "success",
                        title: "Registro exitoso 🎉",
                        text: datos.message || "El usuario ha sido creado correctamente.",
                        confirmButtonColor: "#3085d6"
                    });
                    form.reset();
                    codigoRolGroup.style.display = "none";
                    submitBtn.textContent = "Registrar";
                    window.location.href = "/Login/index.html";
                } else {
                    await Swal.fire({
                        icon: "success",
                        title: "Empleado registrado correctamente 🎉",
                        text: "Datos enviados exitosamente.",
                        confirmButtonColor: "#3085d6"
                    });
                    window.location.href = "datosEducativos.html";
                }
            } else if (status >= 400 && status < 500) {
                Swal.fire({
                    icon: "error",
                    title: "Error en los datos enviados",
                    text: datos.Error || "Verifica los campos del formulario.",
                    confirmButtonColor: "#d33"
                });
            } else if (status >= 500) {
                Swal.fire({
                    icon: "error",
                    title: "Error del servidor",
                    text: "El servidor no pudo procesar la solicitud. Intenta más tarde.",
                    confirmButtonColor: "#d33"
                });
            } else {
                Swal.fire({
                    icon: "info",
                    title: "Respuesta desconocida",
                    text: `Código de estado: ${status}`,
                    confirmButtonColor: "#3085d6"
                });
            }

        } catch (error) {
            console.error("Error en la conexión:", error);
            Swal.fire({
                icon: "error",
                title: "Fallo de conexión",
                text: "No se pudo conectar con el servidor. Verifica tu red o intenta más tarde.",
                confirmButtonColor: "#d33"
            });
        }
    });
});

const user = JSON.parse(localStorage.getItem("usuario"));


console.log(user.credenciales);


