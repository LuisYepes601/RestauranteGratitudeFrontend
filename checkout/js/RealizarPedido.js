let cart = JSON.parse(localStorage.getItem("dv_cart") || "[]");
let usuario = null;

async function obtenerUsuario() {
    const credenciales = JSON.parse(localStorage.getItem("usuario") || "{}");
    const id = credenciales?.credenciales?.id;

    if (!id) throw new Error("No hay usuario logueado");

    const response = await fetch(`http://localhost:8080/user/obtener/byId/${id}`);
    if (!response.ok) throw new Error("Error al obtener usuario");

    usuario = await response.json();

    document.getElementById("name").value = usuario.primerNombre || "";
    document.getElementById("apellido").value = usuario.primerApellido || "";
    document.getElementById("email").value = usuario.email || "";
    document.getElementById("telefono").value = usuario.telefono || "";
    document.getElementById("identificacion").value = usuario.identificacion || "";
    document.getElementById("tipoIdentificacion").value = usuario.tipoIdntificacion || "";

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
                <div class="cart-item-price">${item.qty} x $${item.price.toLocaleString('es-CO')}</div>
            </div>
            <div class="cart-item-total">$${(item.price * item.qty).toLocaleString('es-CO')}</div>
        `;
        container.appendChild(div);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "total";
    totalDiv.innerHTML = `<strong>Total: $${total.toLocaleString('es-CO')}</strong>`;
    container.appendChild(totalDiv);
}

async function crearPedido() {
    const detalles = cart.map(item => ({
        id_producto: parseInt(item.id),
        cantidad: item.qty,
        descripion: null,
        precioUnidad: null,
        subtotal: null,
        total: null,
        id_usuario: usuario.id
    }));

    const body = {
        id_usuario: usuario.id,
        detalles: detalles
    };

    const response = await fetch("http://localhost:8080/pedido/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Error al crear pedido");
    }

    return await response.json();
}

document.getElementById("customerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!usuario) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Datos no cargados.', confirmButtonColor: '#2e7d32' });
        return;
    }

    if (cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Carrito vacío', text: 'Agrega productos.', confirmButtonColor: '#2e7d32' });
        return;
    }

    const btn = this.querySelector("button[type=submit]");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Procesando...`;

    try {
        const pedido = await crearPedido();

        Swal.fire({
            icon: 'success',
            title: '¡Pedido confirmado!',
            html: `
                Gracias <strong>${usuario.primerNombre}</strong>!<br><br>
                <strong>Total:</strong> $${pedido.total?.toLocaleString('es-CO') || cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('es-CO')}<br>
                <em>Recoge en tienda.</em>
            `,
            confirmButtonColor: '#2e7d32'
        }).then(() => {
            localStorage.removeItem("dv_cart");
            cart = [];
            renderCart();
            window.location.href = "../Menu/index.html";
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || "No se pudo procesar el pedido.",
            confirmButtonColor: '#d32f2f'
        });
    } finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await obtenerUsuario();
        renderCart();
    } catch {
        window.location.href = "../Login/index.html";
    }
});