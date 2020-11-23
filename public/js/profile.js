const menuItemsForm = document.getElementById("menuItems");

menuItemsForm.addEventListener("submit", (e) => {
	e.preventDefault();
	var formData = new FormData(menuItemsForm);
	var req;
	req = new XMLHttpRequest();
	req.responseType = "json";
	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			if(this.response.status) {
				let alert = document.getElementById("alert");
				alert.innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert">Item Added to menu!<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
				menuItemsForm.reset();
			}
		}
	}
	let url = "http://localhost:3000/profile/addItem";
	req.open("POST", url, true);
	console.log("o" + formData)
	req.send(formData);
});