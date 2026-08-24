const USERS_KEY = "securenest-users";
const SESSION_KEY = "securenest-session";

/* =========================================
   Storage Helpers
========================================= */

function getUsers() {
    const storedUsers = localStorage.getItem(USERS_KEY);

    if (!storedUsers) {
        return [];
    }

    try {
        const parsedUsers = JSON.parse(storedUsers);
        return Array.isArray(parsedUsers) ? parsedUsers : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

function getSession() {
    const storedSession = sessionStorage.getItem(SESSION_KEY);

    if (!storedSession) {
        return null;
    }

    try {
        return JSON.parse(storedSession);
    } catch {
        return null;
    }
}

function saveSession(user) {
    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
            username: user.username,
            email: user.email
        })
    );
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

/* =========================================
   Password Hashing
========================================= */

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map((byte) =>
            byte
                .toString(16)
                .padStart(2, "0")
        )
        .join("");
}

/* =========================================
   Validation Helpers
========================================= */

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalize(value) {
    return value.trim().toLowerCase();
}

function passwordHasMinimumLength(password) {
    return password.length >= 8;
}

function passwordHasNumber(password) {
    return /\d/.test(password);
}

function clearText(element) {
    if (element) {
        element.textContent = "";
    }
}

function setMessage(
    element,
    message,
    type = ""
) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = "form-message";

    if (type) {
        element.classList.add(type);
    }
}

/* =========================================
   Login/Register Page
========================================= */

const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const loginSection =
    document.getElementById("loginSection");

const registerSection =
    document.getElementById("registerSection");

function showForm(type) {
    if (
        !loginTab ||
        !registerTab ||
        !loginSection ||
        !registerSection
    ) {
        return;
    }

    const showLogin = type === "login";

    loginTab.classList.toggle(
        "active",
        showLogin
    );

    registerTab.classList.toggle(
        "active",
        !showLogin
    );

    loginSection.classList.toggle(
        "active",
        showLogin
    );

    registerSection.classList.toggle(
        "active",
        !showLogin
    );
}

if (loginTab) {
    loginTab.addEventListener(
        "click",
        () => showForm("login")
    );
}

if (registerTab) {
    registerTab.addEventListener(
        "click",
        () => showForm("register")
    );
}

document
    .querySelectorAll("[data-show-form]")
    .forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                showForm(
                    button.dataset.showForm
                );
            }
        );
    });

/* =========================================
   Show / Hide Password
========================================= */

document
    .querySelectorAll("[data-toggle-password]")
    .forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const inputId =
                    button.dataset.togglePassword;

                const input =
                    document.getElementById(inputId);

                if (!input) {
                    return;
                }

                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword
                        ? "text"
                        : "password";

                button.textContent =
                    isPassword
                        ? "Hide"
                        : "Show";

                button.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );
            }
        );
    });

/* =========================================
   Registration
========================================= */

const registerForm =
    document.getElementById("registerForm");

const registerUsername =
    document.getElementById("registerUsername");

const registerEmail =
    document.getElementById("registerEmail");

const registerPassword =
    document.getElementById("registerPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const registerUsernameError =
    document.getElementById("registerUsernameError");

const registerEmailError =
    document.getElementById("registerEmailError");

const registerPasswordError =
    document.getElementById("registerPasswordError");

const confirmPasswordError =
    document.getElementById("confirmPasswordError");

const registerMessage =
    document.getElementById("registerMessage");

const lengthRule =
    document.getElementById("lengthRule");

const numberRule =
    document.getElementById("numberRule");

function updatePasswordRules() {
    if (!registerPassword) {
        return;
    }

    const password =
        registerPassword.value;

    const lengthValid =
        passwordHasMinimumLength(password);

    const numberValid =
        passwordHasNumber(password);

    if (lengthRule) {
        lengthRule.classList.toggle(
            "valid",
            lengthValid
        );

        lengthRule.textContent =
            `${lengthValid ? "✓" : "○"} At least 8 characters`;
    }

    if (numberRule) {
        numberRule.classList.toggle(
            "valid",
            numberValid
        );

        numberRule.textContent =
            `${numberValid ? "✓" : "○"} At least 1 number`;
    }
}

if (registerPassword) {
    registerPassword.addEventListener(
        "input",
        updatePasswordRules
    );
}

if (registerForm) {
    registerForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            clearText(registerUsernameError);
            clearText(registerEmailError);
            clearText(registerPasswordError);
            clearText(confirmPasswordError);

            setMessage(
                registerMessage,
                ""
            );

            const username =
                registerUsername.value.trim();

            const email =
                registerEmail.value.trim();

            const password =
                registerPassword.value;

            const confirm =
                confirmPassword.value;

            let hasError = false;

            if (!username) {
                registerUsernameError.textContent =
                    "Username is required.";

                hasError = true;
            } else if (username.length < 3) {
                registerUsernameError.textContent =
                    "Username must be at least 3 characters.";

                hasError = true;
            }

            if (!email) {
                registerEmailError.textContent =
                    "Email is required.";

                hasError = true;
            } else if (!isValidEmail(email)) {
                registerEmailError.textContent =
                    "Enter a valid email address.";

                hasError = true;
            }

            if (!password) {
                registerPasswordError.textContent =
                    "Password is required.";

                hasError = true;
            } else if (
                !passwordHasMinimumLength(password) ||
                !passwordHasNumber(password)
            ) {
                registerPasswordError.textContent =
                    "Password must contain at least 8 characters and 1 number.";

                hasError = true;
            }

            if (!confirm) {
                confirmPasswordError.textContent =
                    "Please confirm your password.";

                hasError = true;
            } else if (password !== confirm) {
                confirmPasswordError.textContent =
                    "Passwords do not match.";

                hasError = true;
            }

            const users = getUsers();

            const usernameExists =
                users.some(
                    (user) =>
                        normalize(user.username) ===
                        normalize(username)
                );

            const emailExists =
                users.some(
                    (user) =>
                        normalize(user.email) ===
                        normalize(email)
                );

            if (usernameExists) {
                registerUsernameError.textContent =
                    "This username is already registered.";

                hasError = true;
            }

            if (emailExists) {
                registerEmailError.textContent =
                    "This email is already registered.";

                hasError = true;
            }

            if (hasError) {
                return;
            }

            try {
                const passwordHash =
                    await hashPassword(password);

                const newUser = {
                    id: `${Date.now()}-${Math.random()
                        .toString(16)
                        .slice(2)}`,
                    username,
                    email,
                    passwordHash,
                    createdAt:
                        new Date().toISOString()
                };

                users.push(newUser);

                saveUsers(users);

                registerForm.reset();
                updatePasswordRules();

                setMessage(
                    registerMessage,
                    "Account created successfully. You can now log in.",
                    "success"
                );

                setTimeout(
                    () => {
                        showForm("login");

                        const loginIdentifier =
                            document.getElementById(
                                "loginIdentifier"
                            );

                        if (loginIdentifier) {
                            loginIdentifier.value =
                                email;

                            loginIdentifier.focus();
                        }
                    },
                    700
                );
            } catch {
                setMessage(
                    registerMessage,
                    "Unable to create account. Please try again.",
                    "error"
                );
            }
        }
    );
}

/* =========================================
   Login
========================================= */

const loginForm =
    document.getElementById("loginForm");

const loginIdentifier =
    document.getElementById("loginIdentifier");

const loginPassword =
    document.getElementById("loginPassword");

const loginIdentifierError =
    document.getElementById("loginIdentifierError");

const loginPasswordError =
    document.getElementById("loginPasswordError");

const loginMessage =
    document.getElementById("loginMessage");

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            clearText(loginIdentifierError);
            clearText(loginPasswordError);

            setMessage(
                loginMessage,
                ""
            );

            const identifier =
                loginIdentifier.value.trim();

            const password =
                loginPassword.value;

            let hasError = false;

            if (!identifier) {
                loginIdentifierError.textContent =
                    "Username or email is required.";

                hasError = true;
            }

            if (!password) {
                loginPasswordError.textContent =
                    "Password is required.";

                hasError = true;
            }

            if (hasError) {
                return;
            }

            try {
                const users = getUsers();

                const passwordHash =
                    await hashPassword(password);

                const user =
                    users.find(
                        (storedUser) => {
                            const identifierMatch =
                                normalize(
                                    storedUser.username
                                ) ===
                                    normalize(identifier) ||
                                normalize(
                                    storedUser.email
                                ) ===
                                    normalize(identifier);

                            const passwordMatch =
                                storedUser.passwordHash ===
                                passwordHash;

                            return (
                                identifierMatch &&
                                passwordMatch
                            );
                        }
                    );

                if (!user) {
                    setMessage(
                        loginMessage,
                        "Invalid username/email or password.",
                        "error"
                    );

                    return;
                }

                saveSession(user);

                window.location.href =
                    "dashboard.html";
            } catch {
                setMessage(
                    loginMessage,
                    "Unable to log in. Please try again.",
                    "error"
                );
            }
        }
    );
}

/* =========================================
   Dashboard Protection
========================================= */

const dashboardUsername =
    document.getElementById("dashboardUsername");

const profileUsername =
    document.getElementById("profileUsername");

const profileEmail =
    document.getElementById("profileEmail");

const logoutBtn =
    document.getElementById("logoutBtn");

const isDashboardPage =
    document.body.classList.contains(
        "dashboard-page"
    );

if (isDashboardPage) {
    const session = getSession();

    if (!session) {
        window.location.replace(
            "index.html"
        );
    } else {
        if (dashboardUsername) {
            dashboardUsername.textContent =
                session.username;
        }

        if (profileUsername) {
            profileUsername.textContent =
                session.username;
        }

        if (profileEmail) {
            profileEmail.textContent =
                session.email;
        }
    }
}

/* =========================================
   Logout
========================================= */

if (logoutBtn) {
    logoutBtn.addEventListener(
        "click",
        () => {
            clearSession();

            window.location.replace(
                "index.html"
            );
        }
    );
}

/* =========================================
   Redirect Logged-in User
========================================= */

if (
    !isDashboardPage &&
    getSession()
) {
    window.location.replace(
        "dashboard.html"
    );
}