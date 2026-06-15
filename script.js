/* ==========================================================================
   تطبيق مَدار (Madar) - ملف البرمجة السحابي الآمن والمطور
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyC-s5C1yZwaECir8Hn8c3OrARaDbR6EJho",
  authDomain: "madar-f660d.firebaseapp.com",
  projectId: "madar-f660d",
  storageBucket: "madar-f660d.firebasestorage.app",
  messagingSenderId: "959260592107",
  appId: "1:959260592107:web:01bb9985ba0a8963b37bae"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let tasks = [];

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('auth.html');

    // حارس الأمان الذكي
    auth.onAuthStateChanged((user) => {
        if (!user && !isAuthPage) {
            window.location.href = 'auth.html';
            return;
        }

        if (user && isAuthPage) {
            window.location.href = 'index.html';
            return;
        }

        // إظهار الصفحة بعد التحقق
        document.body.style.display = 'block';

        if (user) {
            const displayUserEl = document.getElementById('displayUsername');
            const avatarEl = document.getElementById('userAvatar');
            const username = user.displayName || user.email.split('@')[0];
            
            if (displayUserEl) displayUserEl.textContent = username;
            if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();

            fetchUserTasks(user.uid);
        }
    });

    // تشغيل الوظائف
    initDarkMode();
    if (isAuthPage) initAuthSystem();
    if (document.getElementById('taskForm')) initTaskForm();
    if (document.getElementById('clearDataBtn')) initSettings();
});

// --- دوال النظام (Auth, Tasks, Settings) ---
// (احتفظي بكل الدوال الموجودة في كودك السابق كما هي، فهي ممتازة)
// تأكدي فقط من إضافة دوال initAuthSystem, fetchUserTasks, initTaskForm, initCalendarTable, initDashboardStats, initSettings, initDarkMode كما كانت في كودكِ.

// ملاحظة: تأكدي أن دالة initDarkMode تستخدم id="theme-toggle" (كما في settings.html) وليس "darkModeToggle"
function initDarkMode() {
    const darkModeToggle = document.getElementById('theme-toggle'); // تم التعديل ليطابق settings.html
    if (localStorage.getItem('madar_dark_mode') === 'enabled') {
        document.body.classList.add('dark-version');
    }
    if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('madar_dark_mode') === 'enabled';
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-version');
            localStorage.setItem('madar_dark_mode', document.body.classList.contains('dark-version') ? 'enabled' : 'disabled');
        });
    }
}

// باقي الدوال (initAuthSystem, fetchUserTasks, إلخ) ضعيها أسفل هنا كما كانت في كودك.
