const url = "http://localhost:8000/api/";
const form = document.querySelector("form");

function onSignIn(response) {
	const body = { id_token: response.credential };

	fetch("http://localhost:8000/api/auth/google", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})
		.then((resp) => resp.json())
		.then(({ token }) => {
			localStorage.setItem("token", token);
			window.location = "chat.html"
		})
		.catch(console.log);
}

function signOut() {
	console.log(google.accounts.id);
	google.accounts.id.disableAutoSelect();

	google.accounts.id.revoke(localStorage.getItem("token"), (done) => {
		localStorage.clear();
		location.reload();
	});
}

form.addEventListener("submit", (e) => {
	e.preventDefault();
	const formData = {};

	for (const el of form.elements) {
		if (el.namespaceURI.length > 0) {
			formData[el.name] = el.value;
		}
	}

	fetch(`${url}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
	})
		.then((resp) => resp.json())
		.then(({ token }) => {
			localStorage.setItem("token", token);
		})
		.catch(console.log);
});
