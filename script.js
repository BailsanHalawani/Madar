// script.js
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

document.addEventListener('DOMContentLoaded', () => {
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (isAuthPage) window.location.href = 'index.html';
            document.body.classList.remove('hidden-app'); 
        } else {
            if (!isAuthPage) window.location.href = 'auth.html';
            else document.body.classList.remove('hidden-app');
        }
    });

    // معالجة تسجيل الدخول إذا كنا في صفحة الدخول
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPassword').value;
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => window.location.href = 'index.html')
                .catch(err => alert(err.message));
        });
    }
});
