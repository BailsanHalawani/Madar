const firebaseConfig = { apiKey: "AIzaSyC-s5C1yZwaECir8Hn8c3OrARaDbR6EJho", authDomain: "madar-f660d.firebaseapp.com", projectId: "madar-f660d", storageBucket: "madar-f660d.firebasestorage.app", messagingSenderId: "959260592107", appId: "1:959260592107:web:01bb9985ba0a8963b37bae" };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
    // الوضع الداكن
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) themeToggle.addEventListener('click', () => document.body.classList.toggle('dark-mode'));

    // تسجيل الدخول
    const authForm = document.getElementById('authForm');
    if(authForm) authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value)
        .then(() => window.location.href = 'index.html');
    });

    // الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'auth.html'));

    // حماية الصفحات
    auth.onAuthStateChanged(user => {
        if(user) {
            document.body.classList.remove('hidden-app');
            if(window.location.pathname.includes('auth.html')) window.location.href = 'index.html';
        } else {
            if(!window.location.pathname.includes('auth.html')) window.location.href = 'auth.html';
        }
    });
});
