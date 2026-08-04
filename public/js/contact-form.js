(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const button = form.querySelector('button[type="submit"]');

  function clearErrors() {
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach((error) => error.remove());
  }
  function showErrors(errors = []) {
    errors.forEach(({ field, message }) => {
      const input = form.elements[field];
      if (!input) return;
      input.setAttribute('aria-invalid', 'true');
      const error = document.createElement('small');
      error.className = 'field-error';
      error.textContent = message;
      input.closest('label')?.append(error);
    });
    form.querySelector('[aria-invalid="true"]')?.focus();
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    if (!form.reportValidity()) return;
    button.disabled = true;
    form.classList.add('is-loading');
    status.className = 'form-status is-visible';
    status.textContent = 'Sending your request…';
    try {
      const body = Object.fromEntries(new FormData(form).entries());
      body.consent = form.elements.consent.checked ? 'true' : 'false';
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) {
        status.className = 'form-status is-visible is-error';
        status.textContent = result.message || 'Please review your request and try again.';
        showErrors(result.errors);
        return;
      }
      form.reset();
      status.className = 'form-status is-visible is-success';
      status.textContent = result.message;
    } catch (error) {
      status.className = 'form-status is-visible is-error';
      status.textContent = 'We could not send your request right now. Please try again or contact us on WhatsApp.';
    } finally {
      button.disabled = false;
      form.classList.remove('is-loading');
    }
  });
})();
