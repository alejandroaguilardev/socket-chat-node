const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers/generar-jwt");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const socketController = async (socket = new Socket(), io) => {
	const usuario = await comprobarJWT(socket.handshake.headers["x-token"]);

	if (!usuario) return socket.disconnect();
	chatMensajes.conectarUsuario(usuario);

	socket.join(usuario.id);

	io.emit("usuarios-activos", chatMensajes.usuariosArr);
	io.emit("recibir-mensajes", chatMensajes.ultimos10)

	socket.on("disconnect", () => {
		chatMensajes.desconectarUsuario(usuario.id);
		io.emit("usuarios-activos", chatMensajes.usuariosArr);
	});

	socket.on("enviar-mensaje", ({ mensaje, uid }) => {
		if(uid) {
			socket.to(uid).emit("mensaje-privado",{de:usuario.nombre, mensaje})
			return;
		}
		
		chatMensajes.enviarMensaje(usuario.uid, usuario.nombre, mensaje);
		io.emit("recibir-mensajes", chatMensajes.ultimos10)
		
	});
};

module.exports = {
	socketController,
};
