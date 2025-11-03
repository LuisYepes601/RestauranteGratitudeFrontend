document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEducativo");
    const btnAgregar = document.getElementById("btnAgregar");
    const container = document.getElementById("estudiosContainer");

    let contador = 1;
    const credenciales = JSON.parse(localStorage.getItem("usuario"));


    // ✅ Permite agregar otro bloque de estudio
    btnAgregar.addEventListener("click", () => {
        contador++;
        const nuevoEstudio = document.createElement("div");
        nuevoEstudio.classList.add("section-block", "estudio-block");
        nuevoEstudio.innerHTML = `
      <h4>Estudio ${contador}</h4>

      <label>Nombre del estudio</label>
      <input type="text" name="nombre" placeholder="Ej: Ingeniería de Software" required />

      <label>Nivel de estudio</label>
      <select name="nivelEstudio" required>
        <option value="">Seleccione una opción</option>
        <option>Primaria</option>
        <option>Secundaria</option>
        <option>Técnico</option>
        <option>Tecnólogo</option>
        <option>Pregrado</option>
        <option>Postgrado</option>
        <option>Maestría</option>
        <option>Doctorado</option>
      </select>

      <label>Nombre de la institución</label>
      <input type="text" name="nombreInstitucion" placeholder="Ej: Universidad de Cartagena" required />

      <label>Fecha de inicio</label>
      <input type="date" name="fechaInicio" required />

      <label>Estado del estudio</label>
      <select name="estadoEstudio" required>
        <option value="">Seleccione una opción</option>
        <option>En curso</option>
        <option>Finalizado</option>
        <option>Certificado</option>
        <option>Abandonado</option>
      </select>

      <label>Modalidad</label>
      <select name="modalidad" required>
        <option value="">Seleccione una opción</option>
        <option>Presencial</option>
        <option>Virtual</option>
        <option>Mixta</option>
      </select>
    `;
        container.appendChild(nuevoEstudio);
    });

    // ✅ Envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtenemos todos los estudios
        const estudiosBlocks = document.querySelectorAll(".estudio-block");
        const estudios = [];

        estudiosBlocks.forEach(block => {
            const estudio = {
                nombre: block.querySelector("input[name='nombre']").value.trim(),
                nivelEstudio: block.querySelector("select[name='nivelEstudio']").value.trim(),
                nombreInstitucion: block.querySelector("input[name='nombreInstitucion']").value.trim(),
                fechaInicio: formatFecha(block.querySelector("input[name='fechaInicio']").value),
                estadoEstudio: block.querySelector("select[name='estadoEstudio']").value.trim(),
                modalidad: block.querySelector("select[name='modalidad']").value.trim()
            };
            estudios.push(estudio);
        });


        // ✅ Datos finales a enviar (reemplaza el emailEmpleado con el del usuario logueado)
        const data = {
            emailEmpleado: credenciales.credenciales.correo,
            estudios: estudios
        };

        try {
            const response = await fetch("http://localhost:8080/estudios/crear", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    icon: "success",
                    title: "¡Registro exitoso!",
                    text: "La información educativa fue guardada correctamente.",
                    confirmButtonColor: "#2e7d32"
                });
                form.reset();
            } else {
                const errorText = await response.text();
                Swal.fire({
                    icon: "error",
                    title: "Error en el registro",
                    text: errorText || "No se pudo guardar la información. Verifica los datos.",
                    confirmButtonColor: "#d33"
                });
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor. Asegúrate de que esté ejecutándose.",
                confirmButtonColor: "#d33"
            });
        }
    });

    // ✅ Formatea fecha de yyyy-MM-dd → dd/MM/yyyy
    function formatFecha(fechaISO) {
        if (!fechaISO) return "";
        const [year, month, day] = fechaISO.split("-");
        return `${day}/${month}/${year}`;
    }

    // ✅ Botón Omitir
    document.getElementById("btnOmitir").addEventListener("click", () => {
        Swal.fire({
            title: "¿Deseas omitir este paso?",
            text: "Podrás completarlo más adelante.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, omitir",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#2e7d32"
        }).then(result => {
            if (result.isConfirmed) {
                window.location.href = "/Menu/index.html"; // Cambia esto por la siguiente vista
            }
        });
    });
});
