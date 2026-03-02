console.log("admin_dashboard.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const sb = window.sb || window.supabaseClient;

  const btnLogin = document.getElementById("btn-login");
  const btnSignout = document.getElementById("btn-signout");
  const btnRefresh = document.getElementById("btn-refresh");
  const btnApply = document.getElementById("btn-apply");

  const emailEl = document.getElementById("login-email");
  const passEl = document.getElementById("login-pass");

  const loginView = document.getElementById("login-view");
  const dashView = document.getElementById("dash-view");

  const loginStatus = document.getElementById("login-status");
  const dashStatus = document.getElementById("dash-status");
  const tbody = document.getElementById("tbody");
  const countLine = document.getElementById("count-line");

  const fSearch = document.getElementById("f-search");
  const fSpec = document.getElementById("f-spec");
  const fCity = document.getElementById("f-city");
  const fStatus = document.getElementById("f-status");

  function setStatus(el, msg, kind = "") {
    if (!el) return;
    el.textContent = msg || "";
    el.style.display = msg ? "block" : "none";
    el.classList.remove("ok", "err");
    if (kind) el.classList.add(kind);
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("ar-SA");
  }

  function statusLabel(status) {
    const map = {
      new: "جديد",
      shortlisted: "مرشح",
      contacted: "تم التواصل",
      rejected: "مرفوض",
      archived: "مؤرشف"
    };
    return map[status] || "جديد";
  }

  async function getSignedCvUrl(path) {
    if (!path) return null;
    const { data, error } = await sb.storage.from("cvs").createSignedUrl(path, 60);
    if (error) {
      console.error("createSignedUrl error:", error);
      return null;
    }
    return data?.signedUrl || null;
  }

  async function updateStatus(id, nextStatus) {
    setStatus(dashStatus, "جاري تحديث الحالة...");
    const { error } = await sb
      .from("trainers")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      setStatus(dashStatus, "تعذر تحديث الحالة: " + error.message, "err");
      return;
    }

    setStatus(dashStatus, "تم تحديث الحالة ✅", "ok");
    await loadApplications();
  }

  async function loadApplications() {
    if (!sb) {
      setStatus(dashStatus, "Supabase غير مهيأ.", "err");
      return;
    }

    setStatus(dashStatus, "جاري تحميل الطلبات...");
    tbody.innerHTML = `<tr><td colspan="5" class="muted">جاري التحميل...</td></tr>`;

    let query = sb
      .from("trainers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    const statusValue = fStatus?.value?.trim();
    const specValue = fSpec?.value?.trim();
    const cityValue = fCity?.value?.trim();

    if (statusValue) query = query.eq("status", statusValue);
    if (specValue) query = query.ilike("specialization", `%${specValue}%`);
    if (cityValue) query = query.ilike("city", `%${cityValue}%`);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="5" class="muted">تعذر تحميل الطلبات</td></tr>`;
      setStatus(dashStatus, "فشل تحميل الطلبات: " + error.message, "err");
      return;
    }

    let rows = Array.isArray(data) ? data : [];

    const searchValue = fSearch?.value?.trim().toLowerCase();
    if (searchValue) {
      rows = rows.filter((row) => {
        const haystack = [
          row.full_name,
          row.phone,
          row.email
        ].join(" ").toLowerCase();
        return haystack.includes(searchValue);
      });
    }

    countLine.textContent = `عدد النتائج: ${rows.length}`;

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="muted">لا توجد طلبات مطابقة.</td></tr>`;
      setStatus(dashStatus, "", "");
      return;
    }

    const htmlParts = [];

    for (const row of rows) {
      const name = row.full_name || "بدون اسم";
      const phone = row.phone || "—";
      const email = row.email || "—";
      const spec = row.specialization || "—";
      const city = row.city || "—";
      const status = row.status || "new";
      const bio = row.bio || "";
      const years = row.years_experience ?? "—";

      const cvUrl = row.cv_path ? await getSignedCvUrl(row.cv_path) : null;

      htmlParts.push(`
        <tr>
          <td>${escapeHtml(formatDate(row.created_at))}</td>
          <td>
            <div><strong>${escapeHtml(name)}</strong></div>
            <div class="muted">الجوال: ${escapeHtml(phone)}</div>
            <div class="muted">الإيميل: ${escapeHtml(email)}</div>
            <div class="muted">الخبرة: ${escapeHtml(years)}</div>
            ${bio ? `<div class="muted" style="margin-top:6px;">${escapeHtml(bio)}</div>` : ""}
          </td>
          <td>
            <div>${escapeHtml(spec)}</div>
            <div class="muted">${escapeHtml(city)}</div>
          </td>
          <td><span class="pill">${escapeHtml(statusLabel(status))}</span></td>
          <td>
            <div class="actions">
              ${
                cvUrl
                  ? `<a class="btn btn-ghost btn-sm" href="${cvUrl}" target="_blank" rel="noopener noreferrer">فتح CV</a>`
                  : `<span class="muted">لا يوجد CV</span>`
              }
              <button class="btn btn-ghost btn-sm js-status" data-id="${row.id}" data-status="shortlisted">مرشح</button>
              <button class="btn btn-ghost btn-sm js-status" data-id="${row.id}" data-status="contacted">تم التواصل</button>
              <button class="btn btn-ghost btn-sm js-status" data-id="${row.id}" data-status="rejected">رفض</button>
              <button class="btn btn-ghost btn-sm js-status" data-id="${row.id}" data-status="archived">أرشفة</button>
            </div>
          </td>
        </tr>
      `);
    }

    tbody.innerHTML = htmlParts.join("");
    setStatus(dashStatus, "تم تحميل الطلبات ✅", "ok");

    tbody.querySelectorAll(".js-status").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const nextStatus = btn.getAttribute("data-status");
        await updateStatus(id, nextStatus);
      });
    });
  }

  btnLogin?.addEventListener("click", async () => {
    if (!sb) {
      setStatus(loginStatus, "Supabase غير مهيأ.", "err");
      return;
    }

    setStatus(loginStatus, "جاري تسجيل الدخول.");
    const email = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) {
      setStatus(loginStatus, "اكتبي الإيميل وكلمة المرور", "err");
      return;
    }

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus(loginStatus, error.message, "err");
      return;
    }

    setStatus(loginStatus, "تم تسجيل الدخول ✅", "ok");
    showDashboard();
    await loadApplications();
  });

  btnSignout?.addEventListener("click", async () => {
    await sb.auth.signOut();
    showLogin();
    setStatus(dashStatus, "");
  });

  btnRefresh?.addEventListener("click", loadApplications);
  btnApply?.addEventListener("click", loadApplications);

  sb?.auth.getSession().then(async ({ data }) => {
    if (data?.session) {
      showDashboard();
      await loadApplications();
    } else {
      showLogin();
    }
  });
});