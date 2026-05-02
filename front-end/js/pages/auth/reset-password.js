const BASE_URL = "http://localhost:5262/api";

// Lấy token từ URL
const token = new URLSearchParams(window.location.search).get("token");

const invalidState = document.getElementById("invalid-state");
const resetContent = document.getElementById("reset-content");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const submitBtn = document.getElementById("submit-btn");
const authMsg = document.getElementById("auth-msg");
const errorPassword = document.getElementById("error-password");
const errorConfirm = document.getElementById("error-confirm");
const pwStrength = document.getElementById("pw-strength");
const pwFill = document.getElementById("pw-fill");
const pwLabel = document.getElementById("pw-label");

// ================================================
// INIT — kiểm tra token
// ================================================
if (!token) {
  invalidState.hidden = false;
  resetContent.hidden = true;
}

// ================================================
// PASSWORD TOGGLE
// ================================================
function setupToggle(btnId, inputEl) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isHidden = inputEl.type === "password";
    inputEl.type = isHidden ? "text" : "password";
    btn.querySelector("i").className = isHidden
      ? "fa-regular fa-eye-slash"
      : "fa-regular fa-eye";
  });
}

setupToggle("toggle-new", newPasswordInput);
setupToggle("toggle-confirm", confirmPasswordInput);

// ================================================
// PASSWORD STRENGTH
// ================================================
function checkStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak", color: "#e74c3c", width: "20%" },
    { label: "Weak", color: "#e74c3c", width: "40%" },
    { label: "Fair", color: "#f39c12", width: "60%" },
    { label: "Good", color: "#3498db", width: "80%" },
    { label: "Strong", color: "#3a7d44", width: "100%" },
  ];

  return levels[Math.max(0, score - 1)];
}

newPasswordInput.addEventListener("input", () => {
  const val = newPasswordInput.value;

  if (errorPassword.textContent) errorPassword.textContent = "";
  newPasswordInput.classList.remove("error");

  if (val.length === 0) {
    pwStrength.hidden = true;
    return;
  }

  pwStrength.hidden = false;
  const { label, color, width } = checkStrength(val);
  pwFill.style.width = width;
  pwFill.style.background = color;
  pwLabel.textContent = label;
  pwLabel.style.color = color;
});

confirmPasswordInput.addEventListener("input", () => {
  if (errorConfirm.textContent) errorConfirm.textContent = "";
  confirmPasswordInput.classList.remove("error");
});

// ================================================
// VALIDATION
// ================================================
function validate() {
  let valid = true;
  const newPw = newPasswordInput.value;
  const confirmPw = confirmPasswordInput.value;

  errorPassword.textContent = "";
  errorConfirm.textContent = "";
  newPasswordInput.classList.remove("error");
  confirmPasswordInput.classList.remove("error");

  if (!newPw) {
    errorPassword.textContent = "Please enter a new password.";
    newPasswordInput.classList.add("error");
    valid = false;
  } else if (newPw.length < 8) {
    errorPassword.textContent = "Password must be at least 8 characters.";
    newPasswordInput.classList.add("error");
    valid = false;
  }

  if (!confirmPw) {
    errorConfirm.textContent = "Please confirm your password.";
    confirmPasswordInput.classList.add("error");
    valid = false;
  } else if (newPw && newPw !== confirmPw) {
    errorConfirm.textContent = "Passwords do not match.";
    confirmPasswordInput.classList.add("error");
    valid = false;
  }

  return valid;
}

function showMsg(message, type) {
  authMsg.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-xmark"}"></i> ${message}`;
  authMsg.className = `auth-msg auth-msg--${type} show`;
}

// ================================================
// SUBMIT
// ================================================
async function handleSubmit() {
  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Resetting...`;

  try {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        newPassword: newPasswordInput.value,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showMsg(
        "Password reset successfully! Redirecting to login...",
        "success",
      );

      // Disable form
      newPasswordInput.disabled = true;
      confirmPasswordInput.disabled = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Done!`;

      // Redirect sau 2s
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 2000);
    } else {
      showMsg(data.message || "Token is invalid or expired.", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Reset Password";
    }
  } catch {
    showMsg("Something went wrong. Please try again.", "error");
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Reset Password";
  }
}

// ================================================
// EVENTS
// ================================================
submitBtn?.addEventListener("click", handleSubmit);

confirmPasswordInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSubmit();
});
