// لوحة الإدارة: تسجيل الدخول وإدارة محتوى الموقع ورفع الملفات.
const $ = selector => document.querySelector(selector);

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}), ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'تعذر تنفيذ العملية.');
  }
  return result;
}

function setMessage(message, isError = false) {
  const target = $('#adminMessage');
  target.textContent = message || '';
  target.classList.toggle('is-error', isError);
}

function syncResetPasswordUi() {
  const token = new URLSearchParams(window.location.search).get('token');
  const resetForm = $('#adminResetPasswordForm');
  const loginCard = $('#loginPanel');
  const resetRequestForm = $('#adminResetForm');
  if (token) {
    loginCard.hidden = true;
    resetRequestForm.hidden = true;
    resetForm.hidden = false;
    $('#resetToken').value = token;
    setMessage('يرجى إدخال كلمة مرور جديدة لإكمال إعادة التعيين.');
    return;
  }
  resetForm.hidden = true;
  resetForm.reset();
  $('#resetToken').value = '';
  setMessage('');
}

function togglePanels(isAuthenticated) {
  $('#loginPanel').hidden = isAuthenticated;
  $('#dashboardPanel').hidden = !isAuthenticated;
  if (!isAuthenticated) {
    $('#adminResetForm').hidden = true;
    $('#adminLoginForm').reset();
    syncResetPasswordUi();
  }
}

async function loadSiteSnapshot() {
  const data = await api('/api/site-data');
  const profile = data.profile || {};
  const form = $('#profileForm');
  form.elements.name.value = data.name || '';
  form.elements.about.value = profile.about || '';
  form.elements.vision.value = profile.vision || '';
  form.elements.mission.value = profile.mission || '';
  form.elements.values.value = profile.values || '';
  form.elements.phone.value = profile.phone || '';
  form.elements.email.value = profile.email || '';
  form.elements.address.value = profile.address || '';
  form.elements.mapUrl.value = profile.mapUrl || '';

  $('#statPrograms').textContent = Array.isArray(data.programs) ? data.programs.length : 0;
  $('#statNews').textContent = Array.isArray(data.news) ? data.news.length : 0;
  $('#statProjects').textContent = Array.isArray(data.projects) ? data.projects.length : 0;
}

async function initializeAdmin() {
  try {
    const result = await api('/api/admin/session');
    if (result.authenticated) {
      togglePanels(true);
      await loadSiteSnapshot();
      return;
    }
  } catch (error) {
    console.warn(error);
  }
  togglePanels(false);
}

$('#adminLoginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const username = String(new FormData(form).get('username') || '').trim();
  const password = String(new FormData(form).get('password') || '');

  if (!username || !password) {
    setMessage('يرجى إدخال اسم المستخدم وكلمة المرور.', true);
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'جارٍ تسجيل الدخول…';
  setMessage('جارٍ التحقق من البيانات…');

  try {
    const result = await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (!result.authenticated) throw new Error('تعذر تسجيل الدخول.');
    togglePanels(true);
    await loadSiteSnapshot();
    setMessage('تم تسجيل الدخول بنجاح.');
  } catch (error) {
    setMessage(error.message || 'تعذرت عملية تسجيل الدخول.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

$('#adminResetForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = {
    username: String(new FormData(form).get('username') || '').trim(),
    email: String(new FormData(form).get('email') || '').trim(),
  };
  if (!payload.username && !payload.email) {
    setMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني لإعادة التعيين.', true);
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'جارٍ الإرسال…';
  setMessage('جارٍ إرسال طلب إعادة التعيين…');
  try {
    const result = await api('/api/admin/reset-request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (result.resetUrl) {
      setMessage(`${result.message || 'تم إنشاء رابط إعادة التعيين.'} ${result.resetUrl}`);
    } else {
      setMessage(result.message || 'تم إرسال طلب إعادة تعيين كلمة المرور.');
    }
    form.reset();
    form.hidden = true;
  } catch (error) {
    setMessage(error.message || 'تعذرت عملية إعادة التعيين.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

$('#adminResetPasswordForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const token = String(new FormData(form).get('token') || '').trim();
  const password = String(new FormData(form).get('password') || '').trim();
  const confirmPassword = String(new FormData(form).get('confirmPassword') || '').trim();
  if (!token) {
    setMessage('رابط إعادة التعيين غير صحيح أو منتهي الصلاحية.', true);
    return;
  }
  if (!password || password.length < 8) {
    setMessage('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.', true);
    return;
  }
  if (password !== confirmPassword) {
    setMessage('كلمتا المرور غير متطابقتين.', true);
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'جارٍ تحديث كلمة المرور…';
  setMessage('جارٍ تحديث كلمة المرور الجديدة…');
  try {
    const result = await api('/api/admin/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    setMessage(result.message || 'تم تحديث كلمة المرور بنجاح.');
    form.reset();
    setTimeout(() => {
      window.location.href = '/admin';
    }, 900);
  } catch (error) {
    setMessage(error.message || 'تعذرت عملية تحديث كلمة المرور.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

$('#forgotPasswordToggle').addEventListener('click', () => {
  const form = $('#adminResetForm');
  form.hidden = !form.hidden;
  if (!form.hidden) {
    setMessage('يمكنك إرسال اسم المستخدم أو البريد الإلكتروني لطلب إعادة التعيين.');
  } else {
    setMessage('');
  }
});

$('#adminLogout').addEventListener('click', async () => {
  try {
    await api('/api/admin/logout', { method: 'POST' });
    togglePanels(false);
    setMessage('تم تسجيل الخروج بنجاح.');
    $('#adminLoginForm').reset();
  } catch (error) {
    setMessage(error.message || 'تعذر تسجيل الخروج.', true);
  }
});

$('#profileForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = await api('/api/site-data');
  payload.name = String(formData.get('name') || '').trim() || payload.name || 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة';
  payload.profile = { ...(payload.profile || {}) };
  payload.profile.about = String(formData.get('about') || '').trim();
  payload.profile.vision = String(formData.get('vision') || '').trim();
  payload.profile.mission = String(formData.get('mission') || '').trim();
  payload.profile.values = String(formData.get('values') || '').trim();
  payload.profile.phone = String(formData.get('phone') || '').trim();
  payload.profile.email = String(formData.get('email') || '').trim();
  payload.profile.address = String(formData.get('address') || '').trim();
  payload.profile.mapUrl = String(formData.get('mapUrl') || '').trim();

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'جارٍ الحفظ…';
  setMessage('جارٍ حفظ بيانات الجمعية…');

  try {
    await api('/api/site-data', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setMessage('تم حفظ بيانات الجمعية بنجاح.');
  } catch (error) {
    setMessage(error.message || 'تعذرت عملية الحفظ.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

initializeAdmin();
