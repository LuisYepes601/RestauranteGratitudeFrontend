
document.addEventListener("DOMContentLoaded", () => {
    const usuario = localStorage.getItem("usuario");

  
    if (!usuario) {

        localStorage.setItem("redirectAfterLogin", window.location.href);
        console.log(localStorage.getItem("redirectAfterLogin"));


        Swal.fire({
            icon: "warning",
            title: "No has iniciado sesión",
            text: "Por favor inicia sesión para acceder a las reservas.",
            confirmButtonColor: "#2e7d32"
        }).then(() => {
            window.location.href = "../Login/index.html";

        });
    }
});



document.addEventListener("DOMContentLoaded", () => {
    const btnHome = document.getElementById("btnHome");
    btnHome.addEventListener("click", () => {
        window.location.href = "/Menu/index.html"; // 🔹 Redirige a tu página principal
    });
});

// === CARGAR MESAS ===
document.addEventListener("DOMContentLoaded", () => {
    const selectMesa = document.getElementById("mesa");

    fetch("http://localhost:8080/mesa/listar")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar las mesas");
            return response.json();
        })
        .then(data => {
            selectMesa.innerHTML = '<option value="">Selecciona una mesa</option>';
            data.forEach(mesa => {
                const option = document.createElement("option");
                option.value = mesa.id;
                option.textContent = `Mesa ${mesa.numero} - Capacidad: ${mesa.capacidad} personas`;
                selectMesa.appendChild(option);
            });
        })
        .catch(error => {
            console.error(error);
            selectMesa.innerHTML = '<option value="">Error al cargar mesas</option>';
        });
});

// === CARGAR TIPOS DE RESERVA ===
document.addEventListener("DOMContentLoaded", () => {
    const selectTipo = document.getElementById("tipo");

    fetch("http://localhost:8080/tipoReserva/obtenerTodas/")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar los tipos de reserva");
            return response.json();
        })
        .then(data => {
            selectTipo.innerHTML = '<option value="">Selecciona una opción</option>';
            data.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo.id;
                option.textContent = tipo.nombre;
                selectTipo.appendChild(option);
            });
        })
        .catch(error => {
            console.error(error);
            selectTipo.innerHTML = '<option value="">Error al cargar tipos</option>';
        });
});

// === CREAR RESERVA ===
document.addEventListener("DOMContentLoaded", () => {
    const formReserva = document.getElementById("formReserva");

    formReserva.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fecha = document.getElementById("fecha").value;
        const horaInicio = document.getElementById("horaInicio").value;
        const horaFin = document.getElementById("horaFin").value;
        const idMesa = document.getElementById("mesa").value;
        const idTipoReserva = document.getElementById("tipo").value;

        const idAdmin = 1;
        const idUsuario = 1;

        const reserva = {
            fecha,
            horaInicio: horaInicio + ":00",
            horaFin: horaFin + ":00",
            idAdmin,
            idMesa: parseInt(idMesa),
            idTipoReserva: parseInt(idTipoReserva),
            idUsuario
        };

        try {
            Swal.fire({
                title: "Creando tu reserva...",
                text: "Por favor espera unos segundos.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await fetch("http://localhost:8080/reserva/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reserva)
            });

            Swal.close();

            if (response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "¡Reserva creada!",
                    text: "Tu reserva ha sido registrada exitosamente 🎉",
                    confirmButtonColor: "#2e7d32",
                    timer: 2500
                }).then(() => formReserva.reset());
            } else if (response.status === 400) {
                Swal.fire({
                    icon: "warning",
                    title: "¡No disponible!",
                    text: "No hay mesas disponibles para esa fecha y hora.",
                    confirmButtonColor: "#2e7d32",
                    timer: 2500
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error inesperado",
                    text: "No se pudo procesar la reserva.",
                    confirmButtonColor: "#d33"
                });
            }

        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor.",
                confirmButtonColor: "#d33"
            });
            console.error("Error al crear la reserva:", error);
        }
    });
});

