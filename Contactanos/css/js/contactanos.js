/* ==============================================================
   js/contactanos.js – FORMULARIO PROFESIONAL
   ============================================================== */

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
}

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

document.getElementById("formContacto").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = this;
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    const btn = form.querySelector(".btn-enviar");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando...`;
    btn.disabled = true;

    // Simulación de envío
    await new Promise(resolve => setTimeout(resolve, 1800));

    Swal.fire({
        icon: "success",
        title: "¡Mensaje enviado!",
        text: "Te responderemos en menos de 2 horas.",
        confirmButtonColor: "#2e7d32"
    });

    form.reset();
    form.classList.remove("was-validated");
    btn.innerHTML = originalText;
    btn.disabled = false;
});

