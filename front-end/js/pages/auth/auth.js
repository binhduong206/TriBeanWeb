function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add("error");
  field.classList.remove("success");
  const errEl = document.getElementById(
    "error-" + fieldId.replace("field-", ""),
  );
  if (errEl)
    errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
}

function showSuccess(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove("error");
  field.classList.add("success");
  const errEl = document.getElementById(
    "error-" + fieldId.replace("field-", ""),
  );
  if (errEl) errEl.textContent = "";
}

function clearState(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove("error", "success");
  const errEl = document.getElementById(
    "error-" + fieldId.replace("field-", ""),
  );
  if (errEl) errEl.textContent = "";
}

function setLoading(submitBtn, loading) {
  const text = submitBtn.querySelector(".auth-submit__text");
  const spinner = submitBtn.querySelector(".auth-submit__spinner");
  submitBtn.disabled = loading;
  if (text) text.hidden = loading;
  if (spinner) spinner.hidden = !loading;
}

// Show / hide password toggle — dùng chung cho cả 2 trang
document.querySelectorAll(".auth-toggle-pw").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = btn.closest(".auth-input-wrap").querySelector(".auth-input");
    const icon = btn.querySelector("i");
    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
});
