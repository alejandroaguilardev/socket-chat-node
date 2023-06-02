const url = "http://localhost:8000/api/";

let usuario = null;
let socket = null;
const txtUid = document.querySelector("#txtUid");
const txtMensaje = document.querySelector("#txtMensaje");
const ulUsuarios = document.querySelector("#ulUsuarios");
const ulMensajes = document.querySelector("#ulMensajes");
const btnSalir = document.querySelector("#btnSalir");

const validarJWT = async () => {
	const token = localStorage.getItem("token") || "";
	if (token.length <= 10) {
		window.location = "index.html";
		throw new Error("No hay token en el servidor");
	}

	const resp = await fetch(`${url}auth`, {
		headers: {
			"x-token": token,
		},
	});

	const { usuario: userDb, token: tokenDB } = await resp.json();

	usuario = userDb;
	document.title = usuario.nombre;
	await conectarSocket();
};

const conectarSocket = async () => {
	socket = io({
		extraHeaders: {
			"x-token": localStorage.getItem("token"),
		},
	});

	socket.on("connect", () => {
		console.log("online");
	});

	socket.on("disconnect", () => {
		console.log("offlne");
	});

	socket.on("usuarios-activos", dibujarUsuarios);

	socket.on("recibir-mensajes", dibujarMensajes);

	socket.on("mensaje-privado",dibujarMensajePrivado);
};

const dibujarMensajePrivado = (payload) => {
	console.log({payload})
}; 

const dibujarMensajes = (mensajes = []) => {
	let mensajesHtml = "";
	mensajes.forEach(({ nombre, mensaje }) => {
		mensajesHtml += `
				<li>
					<p>
					<span class="text-primary">${nombre}</h5>
					<span >${mensaje}</span>
					</p>
				</li>
			`;
	});
	ulMensajes.innerHTML = mensajesHtml;
};

const dibujarUsuarios = (usuarios = []) => {
	let usersHtml = "";
	usuarios.forEach(({ nombre, uid }) => {
		usersHtml += `
				<li>
					<p></p>
					<h5 class="text-success">${nombre}</h5>
					<span class="fs-6 text-muted">${uid}</span>
				</li>
			`;
	});
	ulUsuarios.innerHTML = usersHtml;
};

txtMensaje.addEventListener("keyup", ({ keyCode }) => {
	const mensaje = txtMensaje.value;
	const uid = txtUid.value;

	if (keyCode !== 13) return;
	if (mensaje.length === 0) return;

	socket.emit("enviar-mensaje", { mensaje, uid });
	txtMensaje.value = "";
});

const main = async () => {
	await validarJWT();
};

main();
