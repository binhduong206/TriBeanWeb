const BASE_URL = "http://localhost:5262/api";

const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submit-btn");
const authMsg = document.getElementById("auth-msg");
const forgotForm = document.getElementById("forgot-form");
const successState = document.getElementById("success-state");
const sentEmail = document.getElementById("sent-email");
const resendBtn = document.getElementById("resend-btn");
const errorEmail = document.getElementById("error-email");

// ================================================
// VALIDATION
// ================================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    errorEmail.textContent = message;
    emailInput.classList.add("error");
}

function clearError() {
    errorEmail.textContent = "";
    emailInput.classList.remove("error");
}

function showMsg(message, type) {
    authMsg.textContent = message;
    authMsg.className = `auth-msg auth-msg--${type} show`;
}

function hideMsg() {
    authMsg.className = "auth-msg";
}

// ================================================
// SUBMIT
// ================================================
async function handleSubmit() {
    const email = emailInput.value.trim();

    clearError();
    hideMsg();

    if (!email) {
        showError("Please enter your email address.");
        emailInput.focus();
        return;
    }

    if (!validateEmail(email)) {
        showError("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...`;

    try {
        const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        // Luôn success dù email có tồn tại hay không
        sentEmail.textContent = email;
        forgotForm.hidden = true;
        successState.hidden = false;

    } catch {
        showMsg("Something went wrong. Please try again.", "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send Reset Link";
    }
}

// ================================================
// EVENTS
// ================================================
submitBtn.addEventListener("click", handleSubmit);

emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSubmit();
});

emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("error")) clearError();
});

// Resend button — quay lại form
resendBtn.addEventListener("click", () => {
    successState.hidden = true;
    forgotForm.hidden = false;
    emailInput.value = "";
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Send Reset Link";
    emailInput.focus();
});
