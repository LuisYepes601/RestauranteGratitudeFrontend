document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotForm");
    const emailInput = document.getElementById("email");
    const idInput = document.getElementById("idNumber");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const identificacion = idInput.value.trim();

        // Validación básica
        if (!identificacion && !email) {
            Swal.fire({
                icon: "warning",
                title: "Campos requeridos",
                text: "Debes ingresar tu correo o número de identificación.",
                confirmButtonColor: "#0d6efd"
            });
            return;
        }

        // Determinar endpoint y body según el campo usado
        let endpoint = "";
        let body = {};

        if (identificacion) {
            endpoint = "https://restaurantegratitudeapi.onrender.com/recuperarContraseña/by/identificacion";
            body = { identificacion: identificacion };
        } else if (email) {
            endpoint = "https://restaurantegratitudeapi.onrender.com/recuperarContraseña/by/gmail";
            body = { gmail: email };
        }

        // Mostrar loading
        Swal.fire({
            title: "Procesando solicitud...",
            text: "Por favor espera unos segundos.",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            Swal.close();

            // Procesar respuesta
            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    icon: "success",
                    title: "Solicitud enviada",
                    text: data.mensaje || "Revisa tu correo para continuar con la recuperación.",
                    confirmButtonColor: "#198754"
                });
                form.reset();
            } else if (response.status === 404) {
                Swal.fire({
                    icon: "error",
                    title: "Usuario no encontrado",
                    text: "No se encontró ningún usuario con esa información.",
                    confirmButtonColor: "#dc3545"
                });
            } else {
                const errorText = await response.text();
                Swal.fire({
                    icon: "error",
                    title: "Error en la solicitud",
                    text: errorText || "Ocurrió un problema al procesar la recuperación.",
                    confirmButtonColor: "#dc3545"
                });
            }
        } catch (error) {
            Swal.close();
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor. Inténtalo más tarde.",
                confirmButtonColor: "#dc3545"
            });
        }
    });
});
