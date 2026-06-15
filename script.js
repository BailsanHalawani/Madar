/* ==========================================================================
   تطبيق مَدار (Madar) - ملف البرمجة المطور لمنظومة المستخدمين (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // جلب بيانات منظومة الحسابات والمستخدم الحالي
    let users = JSON.parse(localStorage.getItem('madar_users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('madar_current_user')) || null;
    
    // التحقق من صلاحية الدخول وحماية الصفحات الداخلية
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    if (!currentUser && !isAuthPage) {
        // إذا لم يسجل دخوله وهو في صفحة داخلية، يتم نقله فوراً لصفحة الدخول
        window.location.href = 'auth.html';
        return;
    }

    // إذا كان مسجل دخول ويحاول فتح صفحة الدخول، يتم نقله للرئيسية
    if (currentUser && isAuthPage) {
        window.location.href = 'index.html';
        return;
    }

    // عرض بيانات المستخدم الحالي في القائمة الجانبية ديناميكياً
    if (currentUser) {
        const displayUserEl = document.getElementById('displayUsername');
        const avatarEl = document.getElementById('userAvatar');
        if (displayUserEl) displayUserEl.textContent = currentUser.username;
        if (avatarEl) avatarEl.textContent = currentUser.username.charAt(0).toUpperCase();
    }

    // تصفية جلب المهام لتكون خاصة بالمستخدم الحالي فقط
    let allTasks = JSON.parse(localStorage.getItem('madar_tasks')) || [];
    let tasks = currentUser ? allTasks.filter(t => t.userEmail === currentUser.email) : [];

    // تشغيل وظائف المنظومة التفاعلية
    initDarkMode();
    if (isAuthPage) initAuthSystem();
    if (document.getElementById('taskForm')) initTaskForm();
    if (document.getElementById('taskTableBody')) initCalendarTable();
    if (document.querySelector('.stats-grid')) initDashboardStats();
    if (document.getElementById('clearDataBtn')) initSettings();

    // ==========================================================================
    // 🔑 برمجة نظام تسجيل الدخول والحسابات الجديد (Auth System)
    // ==========================================================================
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

        let isLoginMode = true; // وضع الدخول الافتراضي

        // التبديل بين وضع تسجيل الدخول ووضع حساب جديد
        switchAuthLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;

            if (isLoginMode) {
                authTitle.textContent = 'تسجيل الدخول إلى مَدار';
                authSubtitle.textContent = 'مرحباً بكِ مجدداً! يرجى إدخال بياناتك لمتابعة مهامك.';
                usernameGroup.style.display = 'none';
                regUsernameInput.required = false;
                authBtn.textContent = 'دخول';
                toggleAuthText.innerHTML = `ليس لديكِ حساب؟ <a href="#" id="switchAuthLink">إنشاء حساب جديد</a>`;
            } else {
                authTitle.textContent = 'إنشاء حساب في مَدار';
                authSubtitle.textContent = 'انضمي إلينا وابدأي بتنظيم مهامك ومشاريعك اليوم بكل سهولة.';
                usernameGroup.style.display = 'flex';
                regUsernameInput.required = true;
                authBtn.textContent = 'تسجيل الحساب الجديد';
                toggleAuthText.innerHTML = `لديكِ حساب بالفعل؟ <a href="#" id="switchAuthLink">تسجيل الدخول</a>`;
            }
            // إعادة ربط الحدث للرابط الجديد بعد إعادة بناء النص
            initAuthToggleLink();
        });

        function initAuthToggleLink() {
            document.getElementById('switchAuthLink').addEventListener('click', (e) => {
                e.preventDefault();
                switchAuthLink.click();
            });
        }

        // معالجة إرسال النموذج (Form Submit)
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = authEmailInput.value.trim().toLowerCase();
            const password = authPasswordInput.value;

            if (isLoginMode) {
                // عملية تسجيل الدخول
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    localStorage.setItem('madar_current_user', JSON.stringify(user));
                    window.location.href = 'index.html';
                } else {
                    alert('❌ خطأ في البريد الإلكتروني أو كلمة المرور، يرجى المحاولة مرة أخرى.');
                }
            } else {
                // عملية إنشاء حساب جديد
                const username = regUsernameInput.value.trim();
                const userExists = users.some(u => u.email === email);

                if (userExists) {
                    alert('❌ هذا البريد الإلكتروني مسجل بالفعل! يرجى الدخول مباشرة.');
                    return;
                }

                const newUser = {
                    username: username,
                    email: email,
                    password: password // في التطبيقات المتقدمة يتم تشفيرها
                };

                users.push(newUser);
                localStorage.setItem('madar_users', JSON.stringify(users));
                localStorage.setItem('madar_current_user', JSON.stringify(newUser));
                
                alert('✨ أهلاً بكِ في مَدار! تم إنشاء حسابكِ بنجاح.');
                window.location.href = 'index.html';
            }
        });
    }

    // ==========================================================================
    // وظيفة حفظ المهام (tasks.html) مرتبطة بحساب المستخدم
    // ==========================================================================
    function initTaskForm() {
        const taskForm = document.getElementById('taskForm');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newTask = {
                id: 'task_' + Date.now(),
                userEmail: currentUser.email, // ربط المهمة بحسابك الحالي
                name: document.getElementById('taskName').value.trim(),
                desc: document.getElementById('taskDesc').value.trim() || 'لا توجد ملاحظات إضافية.',
                date: document.getElementById('taskDate').value,
                priority: document.getElementById('taskPriority').value,
                status: 'pending'
            };

            allTasks.push(newTask);
            localStorage.setItem('madar_tasks', JSON.stringify(allTasks));

            alert('✨ تم حفظ المهمة في حسابكِ الخاص بنجاح!');
            window.location.href = 'calendar.html';
        });
    }

    // ==========================================================================
    // وظيفة عرض التقويم والمستندات (calendar.html)
    // ==========================================================================
    function initCalendarTable() {
        const tableBody = document.getElementById('taskTableBody');
        if (tasks.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: #8a7667;">📭 حسابكِ خالٍ من المهام حالياً. قومي بإضافة مهمتكِ الأولى!</td></tr>`;
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
                if (confirm('حذف هذه المهمة نهائياً من حسابكِ؟')) {
                    allTasks = allTasks.filter(t => t.id !== id);
                    localStorage.setItem('madar_tasks', JSON.stringify(allTasks));
                    window.location.reload();
                }
            }
            if (target.classList.contains('complete-btn')) {
                const idx = allTasks.findIndex(t => t.id === id);
                if (idx > -1) {
                    allTasks[idx].status = allTasks[idx].status === 'completed' ? 'pending' : 'completed';
                    localStorage.setItem('madar_tasks', JSON.stringify(allTasks));
                    window.location.reload();
                }
            }
        };
    }

    // ==========================================================================
    // وظيفة الإحصائيات (index.html)
    // ==========================================================================
    function initDashboardStats() {
        if (document.querySelector('.total .stat-number')) {
            document.querySelector('.total .stat-number').textContent = tasks.length;
            document.querySelector('.completed .stat-number').textContent = tasks.filter(t => t.status === 'completed').length;
            
            const todayStr = new Date().toISOString().split('T')[0];
            document.querySelector('.delayed .stat-number').textContent = tasks.filter(t => t.date < todayStr && t.status !== 'completed').length;
            
            const miniTaskList = document.querySelector('.task-list-mini');
            const active = tasks.filter(t => t.status !== 'completed');
            
            if (active.length === 0) {
                miniTaskList.innerHTML = `<p style="color: #8a7667; text-align: center; font-size: 14px; padding: 10px;">🎉 لا توجد مهام معلقة في حسابكِ حالياً.</p>`;
                return;
            }
            
            miniTaskList.innerHTML = '';
            active.slice(0, 2).forEach(t => {
                const div = document.createElement('div');
                div.className = `mini-task-item ${t.priority}-priority`;
                div.innerHTML = `<div class="task-meta"><span class="priority-dot ${t.priority}"></span><span class="task-title">${t.name}</span></div><span class="task-date">${t.date.split('-').reverse().join(' / ')}</span>`;
                miniTaskList.appendChild(div);
            });
        }
    }

    // ==========================================================================
    // وظيفة الإعدادات وتسجيل الخروج (settings.html)
    // ==========================================================================
    function initSettings() {
        // إضافة خيار تسجيل الخروج ديناميكياً لحماية الحساب
        const settingsCard = document.querySelector('.settings-card');
        const logoutRow = document.createElement('div');
        logoutRow.className = 'setting-row';
        logoutRow.innerHTML = `
            <div class="setting-info">
                <h3>تسجيل الخروج</h3>
                <p>الخروج الآمن من حسابكِ الحالي لحماية بياناتكِ ومنع الوصول إليها.</p>
            </div>
            <div class="setting-action">
                <button type="button" class="btn-optimize" id="logoutBtn" style="border-color: #c2593f; color: #c2593f;">خروج</button>
            </div>
        `;
        settingsCard.insertBefore(logoutRow, document.querySelector('.danger-zone'));

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('madar_current_user');
            alert('🔒 تم تسجيل خروجكِ بنجاح من تطبيق مدار.');
            window.location.href = 'auth.html';
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('⚠️ هل أنتِ متأكدة من حذف مهام حسابك الحالي فقط؟')) {
                allTasks = allTasks.filter(t => t.userEmail !== currentUser.email);
                localStorage.setItem('madar_tasks', JSON.stringify(allTasks));
                alert('🗑️ تم تفريغ مهام حسابكِ بنجاح.');
                window.location.href = 'index.html';
            }
        });
    }

    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (localStorage.getItem('madar_dark_mode') === 'enabled') document.body.classList.add('dark-version');
        if (darkModeToggle) {
            darkModeToggle.checked = localStorage.getItem('madar_dark_mode') === 'enabled';
            darkModeToggle.addEventListener('change', () => {
                document.body.classList.toggle('dark-version');
                localStorage.setItem('madar_dark_mode', darkModeToggle.checked ? 'enabled' : 'disabled');
            });
        }
    }
});
function switchPage(pageId) {
    // إخفاء جميع الأقسام أولاً
    document.querySelectorAll('.main-content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // إظهار القسم المطلوب بسلاسة
    const activeSection = document.getElementById(pageId);
    activeSection.style.display = 'block';
    
    // إضافة تأثير ظهور تدريجي (Fade-in) إذا رغبتِ
    activeSection.style.opacity = 0;
    setTimeout(() => {
        activeSection.style.transition = 'opacity 0.3s ease';
        activeSection.style.opacity = 1;
    }, 10);
}
// الانتظار حتى تحميل الصفحة بالكامل لتفادي أخطاء الـ null
document.addEventListener('DOMContentLoaded', () => {
    // 1. تحديد زر التبديل (تأكدي أن الـ id في الـ HTML هو theme-toggle أو عدليه هنا)
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // 2. التحقق من الاختيار المخزن مسبقاً في المتصفح وتطبيقه فوراً
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // 3. الاستماع لضغطة الزر وتبديل الوضع
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // تبديل الـ class في الـ body
            document.body.classList.toggle('dark-theme');
            
            // حفظ الخيار الحالي في الـ LocalStorage للاحتفاظ به عند الانتقال بين الصفحات
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    } else {
        console.warn("تنبيه: لم يتم العثور على عنصر يحمل id='theme-toggle' في هذه الصفحة.");
    }
});
