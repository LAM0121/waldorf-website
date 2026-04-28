/**
 * report.js
 * 投后管理数据库登录/登出逻辑
 */
(function () {

  const loginForm       = document.getElementById('loginForm');
  const loginSection    = document.getElementById('loginSection');
  const databaseSection = document.getElementById('databaseSection');
  const errorMessage    = document.getElementById('errorMessage');
  const currentUser     = document.getElementById('currentUser');
  const logoutBtn       = document.getElementById('logoutBtn');

  if (!loginForm) return;

  // 有效凭据（生产环境请替换为服务端验证）
  const validCredentials = {
    'admin':   'admin123',
    'manager': 'manager123',
  };

  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (validCredentials[username] && validCredentials[username] === password) {
      loginSection.classList.add('hidden');
      databaseSection.classList.add('active');
      if (currentUser) currentUser.textContent = `欢迎，${username}`;
      errorMessage.classList.remove('show');
      loginForm.reset();
    } else {
      errorMessage.classList.add('show');
      setTimeout(() => errorMessage.classList.remove('show'), 3000);
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      loginSection.classList.remove('hidden');
      databaseSection.classList.remove('active');
    });
  }

})();
