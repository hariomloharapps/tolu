// filter.js
document.addEventListener('DOMContentLoaded', function() {
    const filterToggle = document.getElementById('filterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const filterItems = filterMenu.querySelectorAll('.filter-item');
    const filterIcon = document.getElementById('filterIcon');
    const filterText = document.getElementById('filterText');
    const selectedFilter = document.getElementById('selectedFilter');
    const filterClear = document.getElementById('filterClear');
    const allTodos = document.getElementById('all-todos');
    const weekTodos = document.getElementById('week-todos');
    const monthTodos = document.getElementById('month-todos');

    filterToggle.addEventListener('click', function() {
        filterMenu.classList.toggle('show');
    });

    filterItems.forEach(item => {
        item.addEventListener('click', function() {
            const value = this.dataset.value;
            applyFilter(value);
            filterMenu.classList.remove('show');
        });
    });

    filterClear.addEventListener('click', function(event) {
        event.stopPropagation();
        clearFilter();
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.filter-dropdown')) {
            filterMenu.classList.remove('show');
        }
    });

    function applyFilter(value) {
        filterToggle.classList.add('filter-active');
        filterIcon.classList.add('slide-out');
        filterText.classList.add('slide-out');
        
        setTimeout(() => {
            filterIcon.classList.add('hidden');
            filterText.classList.add('hidden');
            filterClear.classList.remove('hidden');
            filterClear.classList.add('slide-in');
            selectedFilter.textContent = value.charAt(0).toUpperCase() + value.slice(1);
            selectedFilter.classList.remove('hidden');
            selectedFilter.classList.add('slide-in');
        }, 300);

        allTodos.classList.add('hidden');
        if (value === 'week') {
            fetchWeekTodos();
            weekTodos.classList.remove('hidden');
            monthTodos.classList.add('hidden');
        } else if (value === 'month') {
            fetchMonthTodos();
            monthTodos.classList.remove('hidden');
            weekTodos.classList.add('hidden');
        }
    }

    function clearFilter() {
        filterToggle.classList.remove('filter-active');
        selectedFilter.classList.add('slide-out');
        filterClear.classList.add('slide-out');
        
        setTimeout(() => {
            selectedFilter.classList.add('hidden');
            filterClear.classList.add('hidden');
            filterIcon.classList.remove('hidden');
            filterIcon.classList.add('slide-in');
            filterText.classList.remove('hidden');
            filterText.classList.add('slide-in');
        }, 300);

        setTimeout(() => {
            filterIcon.classList.remove('slide-in', 'slide-out');
            filterText.classList.remove('slide-in', 'slide-out');
            selectedFilter.classList.remove('slide-out');
            filterClear.classList.remove('slide-out');
        }, 600);

        allTodos.classList.remove('hidden');
        weekTodos.classList.add('hidden');
        monthTodos.classList.add('hidden');
    }

    function fetchWeekTodos() {
        fetch('/get_week_todos/')
            .then(response => response.json())
            .then(data => {
                renderTodos(data, 'week-todo-list');
            })
            .catch(error => console.error('Error:', error));
    }

    function fetchMonthTodos() {
        fetch('/get_month_todos/')
            .then(response => response.json())
            .then(data => {
                renderTodos(data, 'month-todo-list');
            })
            .catch(error => console.error('Error:', error));
    }

    function renderTodos(todos, containerId, period) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (todos.length === 0) {
            container.innerHTML = `<p class="text-gray-600">No todos for this ${period}.</p>`;
            return;
        }

        todos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.dataset.id = todo.id;
            
            const dueDateFormatted = formatDueDate(todo.due_date, period);
            
            todoItem.innerHTML = `
                <label class="checkbox-container">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <svg viewBox="0 0 64 64">
                        <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="checkbox-path"></path>
                    </svg>
                </label>
                <div class="todo-content">
                    <span class="todo-title">${todo.title}</span>
                </div>
                <img src="/static/info.svg" alt="Info" class="info-icon" onclick="openModal(${ todo.id })">
                <div class="todo-actions">
                </div>
            `;
            
            container.appendChild(todoItem);
        });

        // Add event listener for todo completion
        container.querySelectorAll('.checkbox-container').forEach(checkbox => {
            checkbox.addEventListener('click', handleTodoCompletion);
        });
    }

    function formatDueDate(dueDate, period) {
        // ... (previous code remains the same)
    }

    function handleTodoCompletion(event) {
        const todoItem = event.target.closest('.todo-item');
        const todoId = todoItem.dataset.id;
        const checkbox = todoItem.querySelector('input[type="checkbox"]');
        
        // Toggle the completed class
        todoItem.classList.toggle('completed');

        // Send AJAX request to update todo status
        fetch(`/complete-todo/${todoId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: checkbox.checked })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (checkbox.checked) {
                    setTimeout(() => {
                        todoItem.style.opacity = '0';
                        setTimeout(() => {
                            todoItem.remove();
                        }, 300);
                    }, 1000);
                }
            } else {
                // Revert the checkbox state if the request failed
                checkbox.checked = !checkbox.checked;
                todoItem.classList.toggle('completed');
                console.error('Failed to update todo status');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Revert the checkbox state if there was an error
            checkbox.checked = !checkbox.checked;
            todoItem.classList.toggle('completed');
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Placeholder functions for edit and delete (to be implemented later)
    window.editTodo = function(todoId) {
        console.log('Editing todo with ID:', todoId);
    }

    window.deleteTodo = function(todoId) {
        console.log('Deleting todo with ID:', todoId);
    }
});