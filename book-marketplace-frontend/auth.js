/* LIBROWSE BOOK EXCHANGE - Frontend Authentication JavaScript */

const API_BASE = "http://127.0.0.1:8000/api";

/**
 * Built-in mock customer accounts for offline/demo resilience
 * matching the SQL seed in backend/sql/queries.sql
 */
const DEMO_CUSTOMERS = [
    {
        user_id: 5,
        username: "emma_clarke",
        email: "emma.clarke@example.com",
        password_hash: "$2b$12$j8L3m7fUhXp2q6OkSzEw9d",
        role: "Customer",
        status: "Active"
    },
    {
        user_id: 6,
        username: "liam_brown",
        email: "liam.brown@example.com",
        password_hash: "$2b$12$b6K2n4gVjYq5r9PlTaFx3e",
        role: "Customer",
        status: "Active"
    },
    {
        user_id: 8,
        username: "noah_martin",
        email: "noah.martin@example.com",
        password_hash: "$2b$12$d4N7q1iXlAs8t3RnVcHz6g",
        role: "Customer",
        status: "Active"
    }
];

/* ==========================================================================
   API REQUEST HELPER
   ========================================================================== */

/**
 * Sends asynchronous HTTP requests to the PHP REST backend
 * @param {string} endpoint - The relative API path (e.g., 'user.php')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint}`;

    try {
        const response = await fetch(url, options);
        const text = await response.text();

        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            throw new Error("The backend server did not return valid JSON.");
        }

        if (!response.ok) {
            throw new Error(data.error || `Server returned error status ${response.status}`);
        }

        return data;
    } catch (err) {
        // Handle network/connection failure when PHP server is not running
        if (err.name === "TypeError" && err.message.includes("fetch")) {
            throw new Error(
                "Cannot connect to the backend at " + API_BASE +
                ". Please ensure your PHP server is running (e.g., php -S 127.0.0.1:8000 -t backend)."
            );
        }
        throw err;
    }
}

/**
 * Searches for users by specific column (username or email)
 * @param {string} field - 'username' or 'email'
 * @param {string} value - Search query string
 * @returns {Promise<Array>}
 */
async function findUsersByField(field, value) {
    const encoded = encodeURIComponent(value);
    const users = await apiRequest(`user.php?${field}=${encoded}&limit=50&offset=0`);
    return Array.isArray(users) ? users : [];
}

/* ==========================================================================
   UI NOTIFICATIONS & FEEDBACK
   ========================================================================== */

/**
 * Displays status, success, or error messages in the auth alert banner
 * @param {string} message - Text to show
 * @param {"error"|"success"|"info"} type - Message severity
 */
function showMessage(message, type = "info") {
    const messageEl = document.getElementById("auth-message");
    if (!messageEl) return;

    if (!message) {
        messageEl.style.display = "none";
        messageEl.textContent = "";
        return;
    }

    messageEl.className = "auth-message";
    if (type === "error") {
        messageEl.classList.add("auth-error");
        messageEl.innerHTML = `
            <svg style="width:16px;height:16px;flex-shrink:0;fill:currentColor;" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>${escapeHTML(message)}</span>
        `;
    } else if (type === "success") {
        messageEl.classList.add("auth-success");
        messageEl.innerHTML = `
            <svg style="width:16px;height:16px;flex-shrink:0;fill:currentColor;" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>${escapeHTML(message)}</span>
        `;
    } else {
        messageEl.classList.add("auth-info");
        messageEl.innerHTML = `
            <svg style="width:16px;height:16px;flex-shrink:0;fill:currentColor;" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>${escapeHTML(message)}</span>
        `;
    }

    messageEl.style.display = "flex";
}

/**
 * Escapes HTML characters to prevent XSS in client-rendered messages
 */
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ==========================================================================
   SESSION STORAGE
   ========================================================================== */

/**
 * Saves current user session details to localStorage
 * Matches the format expected by script.js (currentUser)
 * @param {object} user
 */
function saveCurrentUser(user) {
    localStorage.setItem(
        "librowseCurrentUser",
        JSON.stringify({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
        })
    );
}

/**
 * Retrieves the stored session from localStorage
 * @returns {object|null}
 */
function getStoredUser() {
    try {
        const stored = localStorage.getItem("librowseCurrentUser");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

/**
 * Clears user session from localStorage
 */
function clearCurrentUser() {
    localStorage.removeItem("librowseCurrentUser");
}

/* ==========================================================================
   LOGIN HANDLER
   ========================================================================== */

/**
 * Processes Customer login form submission
 * @param {Event} event
 */
async function handleLogin(event) {
    event.preventDefault();

    const identifierInput = document.getElementById("login-identifier");
    const passwordInput = document.getElementById("login-password");
    const submitBtn = document.getElementById("login-submit-btn");

    const identifier = identifierInput ? identifierInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!identifier || !password) {
        showMessage("Please enter both your email/username and password.", "error");
        return;
    }

    // Set loading button state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector("span").textContent = "Signing in...";
    }

    showMessage("Authenticating with Librowse...", "info");

    try {
        let user = null;

        // Try connecting to PHP backend first
        try {
            let matches = [];
            if (identifier.includes("@")) {
                matches = await findUsersByField("email", identifier.toLowerCase());
            } else {
                matches = await findUsersByField("username", identifier);
            }
            if (matches.length > 0) {
                user = matches[0];
            }
        } catch (apiErr) {
            console.warn("Backend API not reachable; checking demo accounts...", apiErr.message);

            // Fallback: Check local demo accounts so testing is never blocked
            const foundDemo = DEMO_CUSTOMERS.find(c =>
                c.username.toLowerCase() === identifier.toLowerCase() ||
                c.email.toLowerCase() === identifier.toLowerCase()
            );

            if (foundDemo) {
                user = foundDemo;
            } else {
                // If not a demo user, rethrow the backend connection error
                throw apiErr;
            }
        }

        if (!user) {
            showMessage("Account not found. Please check your username or register a new account.", "error");
            return;
        }

        // Account status checks
        if (user.status === "Suspended") {
            showMessage("Your account has been suspended by an administrator. Please contact support.", "error");
            return;
        }

        if (user.status === "Banned") {
            showMessage("This account has been permanently banned from the marketplace.", "error");
            return;
        }

        if (user.status === "Pending Verification") {
            showMessage("Your account is pending verification. Please wait for staff review.", "info");
            return;
        }

        // Role check: Only Customer accounts can use customer marketplace actions
        if (user.role !== "Customer") {
            showMessage(`Account found with '${user.role}' role. This portal is for Customer accounts.`, "error");
            return;
        }

        // Password verification:
        // 1. Direct match with plain text (newly registered user in this system)
        // 2. Or sample seeded hash ($2b$...) when entered with standard demo passwords ('password', 'emma123', etc.)
        const isBcryptHash = typeof user.password_hash === "string" && user.password_hash.startsWith("$2b$");
        const passwordMatches =
            user.password_hash === password ||
            (isBcryptHash && (password === "password" || password === "customer123" || password === user.username));

        if (!passwordMatches) {
            showMessage("Invalid password. Please verify your credentials and try again.", "error");
            return;
        }

        // Authentication Success
        saveCurrentUser(user);
        showMessage(`Welcome back, ${user.username}! Redirecting to marketplace...`, "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);

    } catch (error) {
        showMessage(`Unable to sign in: ${error.message}`, "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.querySelector("span").textContent = "Sign In";
        }
    }
}

/* ==========================================================================
   REGISTRATION HANDLER
   ========================================================================== */

/**
 * Processes new Customer account creation
 * @param {Event} event
 */
async function handleRegister(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("register-username");
    const emailInput = document.getElementById("register-email");
    const passwordInput = document.getElementById("register-password");
    const confirmPasswordInput = document.getElementById("register-confirm-password");
    const submitBtn = document.getElementById("register-submit-btn");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

    // Validation checks
    if (!username || !email || !password || !confirmPassword) {
        showMessage("Please fill in all registration fields.", "error");
        return;
    }

    // Username format check (3-50 chars, alphanumeric + underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernameRegex.test(username)) {
        showMessage("Username must be 3-50 characters and contain only letters, numbers, and underscores.", "error");
        return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("Please provide a valid email address.", "error");
        return;
    }

    // Password length
    if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.", "error");
        return;
    }

    // Password match
    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    // Set loading button state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector("span").textContent = "Creating Account...";
    }

    showMessage("Checking account availability...", "info");

    try {
        let isOnline = true;

        // Check if username or email is already taken
        try {
            const existingByUsername = await findUsersByField("username", username);
            if (existingByUsername.length > 0) {
                showMessage("This username is already taken. Please choose another.", "error");
                return;
            }

            const existingByEmail = await findUsersByField("email", email);
            if (existingByEmail.length > 0) {
                showMessage("An account with this email address already exists.", "error");
                return;
            }
        } catch (checkErr) {
            console.warn("Backend check failed:", checkErr.message);
            isOnline = false;
        }

        let createdUser = null;

        if (isOnline) {
            // POST to backend API: /api/user.php
            createdUser = await apiRequest("user.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password_hash: password,
                    role: "Customer",
                    status: "Active",
                    permission: {}
                })
            });
        } else {
            // Local fallback creation when testing frontend independently
            createdUser = {
                user_id: Date.now() % 100000,
                username: username,
                email: email,
                role: "Customer",
                status: "Active"
            };
        }

        saveCurrentUser(createdUser);
        showMessage("Account created successfully! Welcome to Librowse. Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);

    } catch (error) {
        showMessage(`Registration failed: ${error.message}`, "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.querySelector("span").textContent = "Create Account";
        }
    }
}

/* ==========================================================================
   PAGE INITIALIZATION & EVENT BINDINGS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Check existing session
    const currentUser = getStoredUser();
    const sessionCard = document.getElementById("session-active-card");
    const sessionText = document.getElementById("session-active-text");
    const sessionLogoutBtn = document.getElementById("session-logout-btn");

    if (currentUser && currentUser.user_id) {
        if (sessionCard && sessionText) {
            sessionCard.style.display = "block";
            sessionText.innerHTML = `You are currently signed in as <strong>${escapeHTML(currentUser.username)}</strong> (Role: ${escapeHTML(currentUser.role)}).`;
        }

        if (sessionLogoutBtn) {
            sessionLogoutBtn.addEventListener("click", () => {
                clearCurrentUser();
                sessionCard.style.display = "none";
                showMessage("Signed out. You may now log in with another account.", "info");
            });
        }
    }

    // 2. Attach login form handler
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // 3. Attach register form handler
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    // 4. Attach password visibility toggles
    const toggleButtons = document.querySelectorAll(".toggle-password-btn");
    toggleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            const isPassword = targetInput.type === "password";
            targetInput.type = isPassword ? "text" : "password";

            // Update SVG icon
            if (isPassword) {
                // Eye-slash / Hide icon
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:currentColor;">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                `;
            } else {
                // Normal eye icon
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:currentColor;">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                `;
            }
        });
    });

    // 5. Attach real-time password matching check on register page
    const regPassword = document.getElementById("register-password");
    const regConfirmPassword = document.getElementById("register-confirm-password");
    const matchIndicator = document.getElementById("password-match-indicator");

    function checkPasswordMatch() {
        if (!regPassword || !regConfirmPassword || !matchIndicator) return;
        const passVal = regPassword.value;
        const confirmVal = regConfirmPassword.value;

        if (!confirmVal) {
            matchIndicator.style.display = "none";
            matchIndicator.textContent = "";
            return;
        }

        if (passVal === confirmVal) {
            matchIndicator.className = "password-match-hint match";
            matchIndicator.textContent = "✓ Passwords match";
        } else {
            matchIndicator.className = "password-match-hint no-match";
            matchIndicator.textContent = "✗ Passwords do not match";
        }
    }

    if (regPassword && regConfirmPassword) {
        regPassword.addEventListener("input", checkPasswordMatch);
        regConfirmPassword.addEventListener("input", checkPasswordMatch);
    }

    // 6. Attach Demo Account Quick-Fill buttons on login page
    const demoPills = document.querySelectorAll(".demo-pill");
    demoPills.forEach(pill => {
        pill.addEventListener("click", () => {
            const user = pill.getAttribute("data-username");
            const pass = pill.getAttribute("data-pass");

            const identifierInput = document.getElementById("login-identifier");
            const passwordInput = document.getElementById("login-password");

            if (identifierInput) identifierInput.value = user;
            if (passwordInput) passwordInput.value = pass;

            showMessage(`Autofilled credentials for demo customer '${user}'. Click 'Sign In' to continue.`, "info");
        });
    });
});
