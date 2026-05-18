document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskDatetimeInput = document.getElementById('task-datetime');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    
    // Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editIdInput = document.getElementById('edit-id');
    const editNameInput = document.getElementById('edit-name');
    const editDatetimeInput = document.getElementById('edit-datetime');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize
    renderTasks();
    
    // Set default datetime to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    taskDatetimeInput.value = now.toISOString().slice(0, 16);

    // Event Listeners
    taskForm.addEventListener('submit', handleAddTask);
    editForm.addEventListener('submit', handleEditTask);
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    // Close modal on outside click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    // Functions
    function handleAddTask(e) {
        e.preventDefault();
        
        const name = taskNameInput.value.trim();
        const datetime = taskDatetimeInput.value;
        
        if (!name || !datetime) return;
        
        const newTask = {
            id: Date.now().toString(),
            name: name,
            datetime: datetime,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        
        // Reset inputs
        taskNameInput.value = '';
        taskNameInput.focus();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No tasks yet. Add one above!</p>';
            updateCount();
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            
            // Format datetime
            const dateObj = new Date(task.datetime);
            const formattedDate = dateObj.toLocaleDateString(undefined, { 
                weekday: 'short', month: 'short', day: 'numeric' 
            });
            const formattedTime = dateObj.toLocaleTimeString(undefined, { 
                hour: '2-digit', minute: '2-digit' 
            });
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <h3 class="task-name">${escapeHTML(task.name)}</h3>
                    <div class="task-datetime">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${formattedDate} at ${formattedTime}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit" title="Edit Task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn delete" title="Delete Task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            
            // Add listeners to new elements
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            
            const editBtn = li.querySelector('.action-btn.edit');
            editBtn.addEventListener('click', () => openEditModal(task));
            
            const deleteBtn = li.querySelector('.action-btn.delete');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(li);
        });
        
        updateCount();
    }

    function toggleTaskComplete(id) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        if(confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    }

    function openEditModal(task) {
        editIdInput.value = task.id;
        editNameInput.value = task.name;
        editDatetimeInput.value = task.datetime;
        editModal.classList.add('active');
        editNameInput.focus();
    }

    function closeEditModal() {
        editModal.classList.remove('active');
    }

    function handleEditTask(e) {
        e.preventDefault();
        
        const id = editIdInput.value;
        const name = editNameInput.value.trim();
        const datetime = editDatetimeInput.value;
        
        if (!name || !datetime) return;
        
        tasks = tasks.map(task => 
            task.id === id ? { ...task, name, datetime } : task
        );
        
        saveTasks();
        renderTasks();
        closeEditModal();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateCount() {
        const pendingTasks = tasks.filter(t => !t.completed).length;
        taskCount.textContent = `${pendingTasks} task${pendingTasks !== 1 ? 's' : ''} remaining`;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
