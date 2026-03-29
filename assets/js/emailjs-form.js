/**
 * emailjs-form.js
 * EmailJS 联系表单集成
 * 依赖：@emailjs/browser SDK（在 HTML 中已通过 CDN 加载）
 */

// 1. 初始化 EmailJS
(function () {
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS SDK not loaded yet — retrying on DOMContentLoaded');
    return;
  }
  emailjs.init('2KuvA8DZVEk6sk3Vf');
})();

// 2. 绑定提交事件
document.addEventListener('DOMContentLoaded', function () {

  // 确保 EmailJS SDK 已加载后再初始化（兼容 defer 加载顺序）
  if (typeof emailjs !== 'undefined') {
    emailjs.init('2KuvA8DZVEk6sk3Vf');
  }

  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const btn          = this.querySelector('.btn-submit');
    const successEl    = document.getElementById('formSuccess');
    const errorEl      = document.getElementById('formError');
    const originalText = btn ? btn.innerHTML : '';

    if (btn) { btn.innerHTML = '发送中...'; btn.disabled = true; }
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

    // 收集表单字段（name 属性映射 EmailJS 模板变量）
    const templateParams = {
      from_name:    form.querySelector('#field_name')?.value  || '',
      from_phone:   form.querySelector('#field_tel')?.value   || '',
      from_company: form.querySelector('#field_co')?.value    || '',
      message:      form.querySelector('#field_msg')?.value   || '',
    };

    emailjs.send('service_d9t1qup', 'template_ixvnco5', templateParams)
      .then(function () {
        form.style.display    = 'none';
        if (successEl) successEl.style.display = 'block';
      }, function (error) {
        if (errorEl) {
          errorEl.textContent  = '发送失败，请稍后重试。';
          errorEl.style.display = 'block';
        }
        console.error('EmailJS error:', error);
      })
      .finally(() => {
        if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
      });
  });
});
