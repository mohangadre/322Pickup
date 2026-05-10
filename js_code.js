document.addEventListener("DOMContentLoaded", function () {

    const formErrors = document.getElementById("formErrors");

    // ============================================
    // NAVBAR LOGIN STATUS
    // ============================================

    const savedUsername = localStorage.getItem("pickupBallUsername");

    const navUsername = document.getElementById("navUsername");
    const authLink = document.getElementById("authLink");

    if (navUsername) {
        if (savedUsername) {
            navUsername.textContent = "Logged in as: " + savedUsername;
        } else {
            navUsername.textContent = "";
        }
    }

    if (authLink) {
        if (savedUsername) {
            authLink.textContent = "Sign Out";

            authLink.addEventListener("click", function (event) {
                event.preventDefault();

                localStorage.removeItem("pickupBallUsername");

                window.location.href = "login.html";
            });
        } else {
            authLink.textContent = "Sign In";

            authLink.addEventListener("click", function (event) {
                event.preventDefault();

                window.location.href = "login.html";
            });
        }
    }

    // ============================================
    // LOGIN PAGE ELEMENTS
    // ============================================

    const loginInput = document.getElementById("login");
    const loginPasswordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");

    if (loginButton) {
        loginButton.addEventListener("click", async function (event) {
            event.preventDefault();

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: loginInput.value,
                        password: loginPasswordInput.value
                    })
                });

                const data = await response.json();

                formErrors.textContent = data.message;

                if (data.success) {
                    localStorage.setItem("pickupBallUsername", loginInput.value);
                    window.location.href = "index.html";
                }

            } catch (error) {
                formErrors.textContent = "Error connecting to server.";
            }
        });
    }

    // ============================================
    // SIGNUP PAGE ELEMENTS
    // ============================================

    const fullnameInput = document.getElementById("fullname");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const signupPasswordInput = document.getElementById("password2");
    const signupButton = document.getElementById("signupButton");

    if (signupButton) {
        signupButton.addEventListener("click", async function (event) {
            event.preventDefault();

            try {
                const response = await fetch("http://localhost:3000/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullname: fullnameInput.value,
                        username: usernameInput.value,
                        email: emailInput.value,
                        phone: phoneInput.value,
                        password: signupPasswordInput.value
                    })
                });

                const data = await response.json();

                formErrors.textContent = data.message;

                if (data.success) {
                    localStorage.setItem("pickupBallUsername", usernameInput.value);
                    window.location.href = "index.html";
                }

            } catch (error) {
                formErrors.textContent = "Error connecting to server.";
            }
        });
    }

});