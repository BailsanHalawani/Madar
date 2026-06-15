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

document.addEventListener('DOMContentLoaded', () => {
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    // حارس الأمان
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (isAuthPage) window.location.href = 'index.html';
            document.body.classList.remove('hidden-app');
        } else {
            if (!isAuthPage) window.location.href = 'auth.html';
            else document.body.classList.remove('hidden-app');
        }
    });

    // 1. منطق تسجيل الدخول
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPassword').value;
            auth.signInWithEmailAndPassword(email, pass).catch(err => alert(err.message));
        });
    }

    // 2. منطق إضافة المهام
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            db.collection('tasks').add({
                userId: auth.currentUser.uid,
                name: document.getElementById('taskName').value,
                desc: document.getElementById('taskDesc').value,
                date: document.getElementById('taskDate').value,
                priority: document.getElementById('taskPriority').value
            }).then(() => {
                alert('تم حفظ المهمة!');
                window.location.href = 'calendar.html';
            });
        });
    }

    // 3. منطق الإعدادات (الخروج والوضع الداكن)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.signOut());
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-version');
        });
    }
});
