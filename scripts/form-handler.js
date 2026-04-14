/* ═══════════════════════════════════════════════════════════
   KODEK MEDIA — Shared Form Handler
   Handles validation + submission to Google Sheets for all three forms.
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Google Apps Script endpoints (one per form) ──────── */
  const ENDPOINTS = {
    brandForm:     'https://script.google.com/macros/s/AKfycbwhDefMqWxrN-1pfVOTBXw14GPsEK0-ycL_q0aStbL0faxIF45bG3GVbTMcz0FPYCAl/exec',
    creatorForm:   'https://script.google.com/macros/s/AKfycbyhDq2uuchNCOkf2PF-w-qocrO_W15Sn_yQ9ztnaeDUWhV1jUzWQcA3pQ3v0GYNiKjhcw/exec',
    affiliateForm: 'https://script.google.com/macros/s/AKfycbym9jna6A14OwyMYEi6dIQB0hy9oK94fGbwqIQLQHkN8X-lpFKADGhjhUgQ5DrJAZ1P/exec',
  };

  // Find whichever form is on this page
  const form = document.querySelector('form');
  if (!form) return;

  const submitBtn  = document.getElementById('submitBtn');
  const successBox = document.getElementById('formSuccess');

  // Resolve the endpoint for this form
  const endpoint = ENDPOINTS[form.id];

  /* ── Field validation rules ─────────────────────────── */
  function validateField(input) {
    const group = input.closest('.form-group');
    if (!group) return true;

    const errMsg = group.querySelector('.form-error-msg');
    let valid = true;

    if (input.hasAttribute('required')) {
      if (input.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      } else if (input.type === 'url' && input.value.trim() !== '') {
        try { new URL(input.value.trim()); }
        catch { valid = false; }
      } else if (input.tagName === 'SELECT') {
        valid = input.value !== '';
      } else {
        valid = input.value.trim() !== '';
      }
    }

    input.classList.toggle('error', !valid);
    if (errMsg) errMsg.classList.toggle('show', !valid);
    return valid;
  }

  /* ── Live validation on blur ────────────────────────── */
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  /* ── Radio groups: at least one checked ────────────── */
  function validateRadioGroup(name) {
    return form.querySelectorAll(`input[name="${name}"]:checked`).length > 0;
  }

  /* ── Collect all form data into a plain object ──────── */
  function collectFormData() {
    const data = { timestamp: new Date().toISOString() };

    // Text inputs, emails, urls, tel, textareas, selects
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      if (el.name) data[el.name] = el.value.trim();
    });

    // Radio buttons (take the checked value)
    const radioNames = new Set();
    form.querySelectorAll('input[type="radio"]').forEach(r => radioNames.add(r.name));
    radioNames.forEach(name => {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      data[name] = checked ? checked.value : '';
    });

    // Checkboxes (join checked values with commas)
    const checkNames = new Set();
    form.querySelectorAll('input[type="checkbox"]').forEach(c => checkNames.add(c.name));
    checkNames.forEach(name => {
      const checked = Array.from(form.querySelectorAll(`input[name="${name}"]:checked`));
      data[name] = checked.map(c => c.value).join(', ');
    });

    return data;
  }

  /* ── Show success screen ────────────────────────────── */
  function showSuccess() {
    form.style.transition    = 'opacity 0.4s, transform 0.4s';
    form.style.opacity       = '0';
    form.style.transform     = 'translateY(-10px)';
    form.style.pointerEvents = 'none';

    setTimeout(() => {
      form.style.display = 'none';
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 420);
  }

  /* ── Submit handler ─────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;

    // Validate all required inputs / selects / textareas
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      if (!validateField(input)) allValid = false;
    });

    // Validate required radio groups (look for any radio with 'required')
    const radioGroups = new Set();
    form.querySelectorAll('input[type="radio"][required]').forEach(r => radioGroups.add(r.name));
    radioGroups.forEach(name => {
      if (!validateRadioGroup(name)) {
        allValid = false;
        // Highlight the group container
        const firstRadio = form.querySelector(`input[name="${name}"]`);
        if (firstRadio) {
          const group = firstRadio.closest('.form-group');
          if (group) group.style.outline = '1px solid rgba(255,80,80,0.4)';
        }
      }
    });

    if (!allValid) {
      // Scroll to first error
      const firstError = form.querySelector('.error, .form-error-msg.show');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // ── Submit to Google Sheets ──
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const payload = collectFormData();

    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(() => {
        showSuccess();
      })
      .catch(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or contact us directly.');
      });
  });

})();
