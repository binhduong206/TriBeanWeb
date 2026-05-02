const registerForm = document.getElementById("register-form");
const firstnameInput = document.getElementById("firstname");
const lastnameInput = document.getElementById("lastname");
const regEmailInput = document.getElementById("reg-email");
const regPasswordInput = document.getElementById("reg-password");
const confirmInput = document.getElementById("confirm");
const agreeCheckbox = document.getElementById("agree");
const registerSubmitBtn = document.getElementById("register-submit");
const strengthWrap = document.getElementById("strength-wrap");
const strengthFill = document.getElementById("strength-fill");
const strengthLabel = document.getElementById("strength-label");

// ---- Password strength ----
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return "weak";
  if (score <= 2) return "fair";
  return "strong";
}

regPasswordInput.addEventListener("input", () => {
  const val = regPasswordInput.value;
  clearState("field-reg-password");

  if (!val) {
    strengthWrap.hidden = true;
    return;
  }

  strengthWrap.hidden = false;
  const level = getStrength(val);
  const labels = { weak: "Weak", fair: "Fair", strong: "Strong" };
  strengthFill.className = "auth-strength__fill " + level;
  strengthLabel.className = "auth-strength__label " + level;
  strengthLabel.textContent = labels[level];
});

// ---- Live: confirm match ----
confirmInput.addEventListener("input", () => {
  if (confirmInput.value && confirmInput.value !== regPasswordInput.value) {
    showError("field-confirm", "Passwords don't match.");
  } else {
    clearState("field-confirm");
  }
});

// ---- Clear on type ----
[firstnameInput, lastnameInput, regEmailInput].forEach((el) => {
  el.addEventListener("input", () => clearState("field-" + el.id));
});

// ---- Submit ----
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let isValid = true;

  if (!firstnameInput.value.trim()) {
    showError("field-firstname", "First name is required.");
    isValid = false;
  } else {
    showSuccess("field-firstname");
  }

  if (!lastnameInput.value.trim()) {
    showError("field-lastname", "Last name is required.");
    isValid = false;
  } else {
    showSuccess("field-lastname");
  }

  const emailVal = regEmailInput.value.trim();
  if (!emailVal) {
    showError("field-reg-email", "Email is required.");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    showError("field-reg-email", "Please enter a valid email.");
    isValid = false;
  } else {
    showSuccess("field-reg-email");
  }

  if (!regPasswordInput.value || regPasswordInput.value.length < 8) {
    showError("field-reg-password", "Password must be at least 8 characters.");
    isValid = false;
  } else {
    showSuccess("field-reg-password");
  }

  if (!confirmInput.value || confirmInput.value !== regPasswordInput.value) {
    showError("field-confirm", "Passwords don't match.");
    isValid = false;
  } else {
    showSuccess("field-confirm");
  }

  if (!agreeCheckbox.checked) {
    alert("Please agree to the Terms of Service to continue.");
    isValid = false;
  }

  if (!isValid) return;

  setLoading(registerSubmitBtn, true);

  try {
    const response = await fetch("http://localhost:5262/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: firstnameInput.value.trim(),
        lastName: lastnameInput.value.trim(),
        email: emailVal,
        password: regPasswordInput.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      registerSubmitBtn.querySelector(".auth-submit__text").textContent =
        "Account created! ☕";
      registerSubmitBtn.style.background = "#27ae60";

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1200);
    } else {
      // Email đã tồn tại hoặc lỗi server khác
      const msg = data.message || "Registration failed. Please try again.";
      showError("field-reg-email", msg);
    }
  } catch (error) {
    console.error("Lỗi kết nối Server:", error);
    showError(
      "field-reg-email",
      "Cannot connect to the server. Please try again later.",
    );
  } finally {
    if (registerSubmitBtn.style.background !== "rgb(39, 174, 96)") {
      setLoading(registerSubmitBtn, false);
    }
  }
});
