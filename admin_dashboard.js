console.log("admin_dashboard.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const sb = window.sb; // ✅ هذا هو Supabase client الصحيح

  const btnLogin = document.getElementById("btn-login");
  const btnSignout = document.getElementById("btn-signout");

  const emailEl = document.getElementById("login-email");
  const passEl  = document.getElementById("login-pass");

  const loginView = document.getElementById("login-view");
  const dashView  = document.getElementById("dash-view");

  const loginStatus = document.getElementById("login-status");

  function setStatus(msg) {
    if (!loginStatus) return;
    loginStatus.textContent = msg;
    loginStatus.style.display = "block";
  }

  function showDashboard() {
    loginView.classList.add("hidden");
    dashView.classList.remove("hidden");
    btnSignout.classList.remove("hidden");
  }

  function showLogin() {
    dashView.classList.add("hidden");
    loginView.classList.remove("hidden");
    btnSignout.classList.add("hidden");
  }

  // 🔐 تسجيل الدخول
  btnLogin.addEventListener("click", async () => {
    setStatus("جاري تسجيل الدخول...");

    const email = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) {
      setStatus("اكتبي الإيميل وكلمة المرور");
      return;
    }

    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("تم تسجيل الدخول ✅");
    showDashboard();
  });

  // 🚪 تسجيل الخروج
  btnSignout.addEventListener("click", async () => {
    await sb.auth.signOut();
    showLogin();
  });

  // 🔁 فحص الجلسة عند فتح الصفحة
  sb.auth.getSession().then(({ data }) => {
    if (data?.session) showDashboard();
    else showLogin();
  });
});