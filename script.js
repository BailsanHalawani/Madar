/* ==========================================================================
   تطبيق مَدار (Madar) - ملف البرمجة السحابي الآمن والمطور بالكامل
   ========================================================================== */

// 1. تهيئة الـ Firebase باستخدام بيانات مشروعكِ السحابي
const firebaseConfig = {
  apiKey: "AIzaSyC-s5C1yZwaECir8Hn8c3OrARaDbR6EJho",
  authDomain: "madar-f660d.firebaseapp.com",
  projectId: "madar-f660d",
  storageBucket: "madar-f660d.firebasestorage.app",
  messagingSenderId: "959260592107",
  appId: "1:959260592107:web:01bb9985ba0a8963b37bae"
};

// تشغيل الخدمات سحابياً
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// مصفوفة محلية مؤقتة لعرض المهام
let tasks = [];

document.addEventListener('DOMContentLoaded', () => {

    // حارس الأمان الذكي: التحقق الصارم من صلاحية الدخول ومنع النموذج الافتراضي
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('auth.html');
auth.onAuthStateChanged((user) => {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('auth.html');

        if (user) {
            // إذا كان المستخدم مسجلاً
            if (isAuthPage) {
                window.location.href = 'index.html'; // إذا في صفحة التسجيل، اذهب للرئيسية
            }
            // إذا كان في الرئيسية، أكمل عملك (جلب البيانات)
            const displayUserEl = document.getElementById('displayUsername');
            const avatarEl = document.getElementById('userAvatar');
            if (displayUserEl) displayUserEl.textContent = user.displayName || user.email.split('@')[0];
            fetchUserTasks(user.uid);
        } else {
            // إذا لم يكن المستخدم مسجلاً
            if (!isAuthPage) {
                window.location.href = 'auth.html'; // إذا ليس في صفحة التسجيل، اذهب إليها
            }
        }
    });
 

    // تشغيل وظائف المنظومة التفاعلية الأساسية
    initDarkMode();
    if (isAuthPage) initAuthSystem();
    if (document.getElementById('taskForm')) initTaskForm();
    if (document.getElementById('clearDataBtn')) initSettings();

    // ==========================================
    // 🔑 أولاً: منظومة الحسابات السحابية
    // ==========================================
    function initAuthSystem() {
        const authForm = document.getElementById('authForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const usernameGroup = document.getElementById('usernameGroup');
        const regUsernameInput = document.getElementById('regUsername');
        const authEmailInput = document.getElementById('authEmail');
        const authPasswordInput = document.getElementById('authPassword');
        const authBtn = document.getElementById('authBtn');
        const switchAuthLink = document.getElementById('switchAuthLink');
        const toggleAuthText = document.getElementById('toggleAuthText');

        let isLoginMode = true;

        if (switchAuthLink) {
            switchAuthLink.addEventListener('click', function handleSwitch(e) {
                e.preventDefault();
                isLoginMode = !isLoginMode;

                if (isLoginMode) {
                    authTitle.textContent = 'تسجيل الدخول إلى مَدار';
                    authSubtitle.textContent = 'مرحباً بكِ مجدداً! يرجى إدخال بياناتك لمتابعة مهامك.';
                    if (usernameGroup) usernameGroup.style.display = 'none';
                    if (regUsernameInput) regUsernameInput.required = false;
                    authBtn.textContent = 'دخول';
                    if (toggleAuthText) toggleAuthText.innerHTML = `ليس لديكِ حساب؟ <a href="#" id="switchAuthLink">إنشاء حساب جديد</a>`;
                } else {
                    authTitle.textContent = 'إنشاء حساب في مَدار';
                    authSubtitle.textContent = 'انضمي إلينا وابدأي بتنظيم مهامك ومشاريعك اليوم بكل سهولة.';
                    if (usernameGroup) usernameGroup.style.display = 'flex';
                    if (regUsernameInput) regUsernameInput.required = true;
                    authBtn.textContent = 'تسجيل الحساب الجديد';
                    if (toggleAuthText) toggleAuthText.innerHTML = `لديكِ حساب بالفعل؟ <a href="#" id="switchAuthLink">تسجيل الدخول</a>`;
                }
                const newSwitchLink = document.getElementById('switchAuthLink');
                if (newSwitchLink) newSwitchLink.addEventListener('click', handleSwitch);
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = authEmailInput.value.trim().toLowerCase();
                const password = authPasswordInput.value;

                if (isLoginMode) {
                    auth.signInWithEmailAndPassword(email, password)
                        .then(() => { window.location.href = 'index.html'; })
                        .catch((error) => alert('❌ خطأ في تسجيل الدخول: ' + error.message));
                } else {
                    const username = regUsernameInput.value.trim();
                    auth.createUserWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            return userCredential.user.updateProfile({ displayName: username });
                        })
                        .then(() => {
                            alert('✨ أهلاً بكِ في مَدار! تم إنشاء حسابكِ السحابي بنجاح.');
                            window.location.href = 'index.html';
                        })
                        .catch((error) => alert('❌ خطأ في إنشاء الحساب: ' + error.message));
                }
            });
        }
    }

    // ==========================================
    // 📡 ثانياً: إدارة المهام سحابياً (Firestore)
    // ==========================================
    function fetchUserTasks(userId) {
        db.collection('tasks').where('userId', '==', userId)
        .get()
        .then((querySnapshot) => {
            tasks = [];
            querySnapshot.forEach((doc) => {
                let taskData = doc.data();
                taskData.id = doc.id;
                tasks.push(taskData);
            });
            if (document.getElementById('taskTableBody')) initCalendarTable();
            if (document.querySelector('.stats-grid')) initDashboardStats();
        });
    }

    function initTaskForm() {
        const taskForm = document.getElementById('taskForm');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return;

            const newTask = {
                userId: user.uid,
                name: document.getElementById('taskName').value.trim(),
                desc: document.getElementById('taskDesc').value.trim() || 'لا توجد ملاحظات إضافية.',
                date: document.getElementById('taskDate').value,
                priority: document.getElementById('taskPriority').value,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            db.collection('tasks').add(newTask)
                .then(() => {
                    alert('✨ تم حفظ المهمة سحابياً بنجاح!');
                    window.location.href = 'calendar.html';
                });
        });
    }

    function initCalendarTable() {
        const tableBody = document.getElementById('taskTableBody');
        if (!tableBody) return;

        if (tasks.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: #8a7667;">📭 حسابك السحابي خالٍ من المهام حالياً.</td></tr>`;
            return;
        }

        tableBody.innerHTML = '';
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

        tasks.forEach(task => {
            const tr = document.createElement('tr');
            let priorityText = task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة';
            let priorityClass = 'priority-' + task.priority;
            const formattedDate = task.date.split('-').reverse().join(' / ');

            tr.innerHTML = `
                <td class="task-date-cell">${formattedDate}</td>
                <td class="task-name-cell" style="${task.status === 'completed' ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.name}</td>
                <td class="task-desc-cell">${task.desc}</td>
                <td><span class="badge ${priorityClass}">${priorityText}</span></td>
                <td class="actions-cell">
                    <button class="btn-action complete-btn" data-id="${task.id}">${task.status === 'completed' ? '🔄' : '✅'}</button>
                    <button class="btn-action delete-btn" data-id="${task.id}">❌</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        tableBody.onclick = (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            if (!id) return;

            if (target.classList.contains('delete-btn')) {
                if (confirm('حذف هذه المهمة نهائياً من حسابكِ السحابي؟')) {
                    db.collection('tasks').doc(id).delete().then(() => window.location.reload());
                }
            }
            if (target.classList.contains('complete-btn')) {
                const currentTask = tasks.find(t => t.id === id);
                if (currentTask) {
                    db.collection('tasks').doc(id).update({
                        status: currentTask.status === 'completed' ? 'pending' : 'completed'
                    }).then(() => window.location.reload());
                }
            }
        };
    }

    function initDashboardStats() {
        if (document.querySelector('.total .stat-number')) {
            document.querySelector('.total .stat-number').textContent = tasks.length;
            document.querySelector('.completed .stat-number').textContent = tasks.filter(t => t.status === 'completed').length;
            
            const todayStr = new Date().toISOString().split('T')[0];
            const delayedCount = tasks.filter(t => t.date < todayStr && t.status !== 'completed').length;
            if (document.querySelector('.delayed .stat-number')) {
                document.querySelector('.delayed .stat-number').textContent = delayedCount;
            }
        }
    }

    // ==========================================
    // ⚙️ ثالثاً: الإعدادات وتسجيل الخروج
    // ==========================================
    function initSettings() {
        const settingsCard = document.querySelector('.settings-card');
        if (!settingsCard) return;

        if (!document.getElementById('logoutBtn')) {
            const logoutRow = document.createElement('div');
            logoutRow.className = 'setting-row';
            logoutRow.innerHTML = `
                <div class="setting-info">
                    <h3>تسجيل الخروج</h3>
                    <p>الخروج الآمن من حسابكِ الحالي لحماية بياناتكِ.</p>
                </div>
                <div class="setting-action">
                    <button type="button" class="btn-optimize" id="logoutBtn" style="border-color: #c2593f; color: #c2593f;">خروج</button>
                </div>
            `;
            settingsCard.insertBefore(logoutRow, document.querySelector('.danger-zone'));

            document.getElementById('logoutBtn').addEventListener('click', () => {
                auth.signOut().then(() => {
                    alert('🔒 تم تسجيل خروجكِ بنجاح.');
                    window.location.href = 'auth.html';
                });
            });
        }

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('⚠️ حذف جميع مهام حسابكِ الحالي نهائياً؟')) {
                const batch = db.batch();
                tasks.forEach(task => batch.delete(db.collection('tasks').doc(task.id)));
                batch.commit().then(() => {
                    alert('🗑️ تم تفريغ المهام بنجاح.');
                    window.location.href = 'index.html';
                });
            }
        });
    }

    // ==========================================
    // 🌓 رابعاً: منظومة الوضع الداكن
    // ==========================================
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
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
});

function switchPage(pageId) {
    document.querySelectorAll('.main-content-section').forEach(section => section.style.display = 'none');
    const activeSection = document.getElementById(pageId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}
