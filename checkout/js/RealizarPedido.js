let cart = JSON.parse(localStorage.getItem("dv_cart") || "[]");
let usuario = null;

async function obtenerUsuario() {

    const credenciales = JSON.parse(localStorage.getItem("usuario") || "{}");


    console.log(credenciales.credenciales);
    



    const response = await fetch("http://localhost:8080/user/obtener/byId/" + credenciales.credenciales.id);

    if (!response.ok) throw new Error("Error al obtener usuario");

    usuario = await response.json();

    // Asignar valores al formulario
    document.getElementById("name").value = usuario.primerNombre;
    document.getElementById("apellido").value = usuario.primerApellido;
    document.getElementById("email").value = usuario.email;
    document.getElementById("telefono").value = usuario.telefono;
    document.getElementById("identificacion").value = usuario.identificacion;
    document.getElementById("tipoIdentificacion").value = usuario.tipoIdntificacion;

    console.log(usuario);


    return usuario;



}

function renderCart() {
    const container = document.getElementById("cartSummary");
    container.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart">No hay productos en tu pedido.</div>`;
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement("div");
        div.className = "cart-item fade-in-up";
        div.innerHTML = `
            <img src="${item.img}" alt="${item.title}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.qty} x $${item.price.toLocaleString()}</div>
            </div>
            <div class="cart-item-total">$${(item.price * item.qty).toLocaleString()}</div>
        `;
        container.appendChild(div);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "total";
    totalDiv.textContent = `Total: $${total.toLocaleString()}`;
    container.appendChild(totalDiv);
}

document.getElementById("customerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Validar usuario
    if (!usuario) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Tus datos de usuario aún no están cargados. Por favor espera.',
            confirmButtonColor: '#2e7d32'
        });
        return;
    }

    // Validar carrito
    if (cart.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'No tienes productos en tu pedido.',
            confirmButtonColor: '#2e7d32'
        });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Pedido confirmado',
        html: `
            Gracias ${usuario.primerNombre} por tu pedido.<br>
            Total: $${cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}<br>
            Puedes recoger tu pedido en nuestra tienda.
        `,
        confirmButtonColor: '#2e7d32'
    });
});

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await obtenerUsuario(); // Esperar a que se carguen los datos
    renderCart();
});
