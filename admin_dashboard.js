console.log("admin_dashboard.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const btnSignout = document.getElementById("btn-signout");

  const emailEl = document.getElementById("login-email");
  const passEl  = document.getElementById("login-pass");

  const loginView = document.getElementById("login-view");
  const dashView  = document.getElementById("dash-view");

  const loginStatus = document.getElementById("login-status");

  function setStatus(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
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

  // زر الدخول
  btnLogin?.addEventListener("click", async () => {
    setStatus(loginStatus, "جاري تسجيل الدخول...");

    const email = (emailEl?.value || "").trim();
    const password = passEl?.value || "";

    if (!email || !password) {
      setStatus(loginStatus, "اكتبي الإيميل وكلمة المرور");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus(loginStatus, error.message);
      return;
    }

    setStatus(loginStatus, "تم تسجيل الدخول ✅");
    showDashboard();
  });

  // زر الخروج
  btnSignout?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    showLogin();
  });

  // لو فيه جلسة موجودة مسبقًا
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session) showDashboard();
    else showLogin();
  });
});