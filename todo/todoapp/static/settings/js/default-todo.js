document.addEventListener('DOMContentLoaded', function() {
    let defaultAddTodoButton, defaultAddTodoModal;
    const defaultSettingsContainer = document.getElementById('settings-content');
    const defaultDaysOfWeek = ['Daily', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    function createDefaultTodoViewPage() {
        defaultSettingsContainer.innerHTML = '';
        const defaultHeader = document.createElement('div');
        defaultHeader.className = 'flex justify-between items-center mb-4';
        const defaultTitle = document.createElement('h1');
        defaultTitle.className = 'text-2xl font-semibold';
        defaultTitle.textContent = 'Default Todos';
        defaultHeader.appendChild(defaultTitle);

        defaultAddTodoButton = document.createElement('button');
        defaultAddTodoButton.className = 'add-todo-button';
        defaultAddTodoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m499-287 335-335-52-52-335 335 52 52Zm-261 87q-100-5-149-42T40-349q0-65 53.5-105.5T242-503q39-3 58.5-12.5T320-542q0-26-29.5-39T193-600l7-80q103 8 151.5 41.5T400-542q0 53-38.5 83T248-423q-64 5-96 23.5T120-349q0 35 28 50.5t94 18.5l-4 80Zm280 7L353-358l382-382q20-20 47.5-20t47.5 20l70 70q20 20 20 47.5T900-575L518-193Zm-159 33q-17 4-30-9t-9-30l33-159 165 165-159 33Z"/></svg>';
        defaultHeader.appendChild(defaultAddTodoButton);
        defaultSettingsContainer.appendChild(defaultHeader);

        const defaultTodoList = document.createElement('ul');
        defaultTodoList.className = 'space-y-2';
        defaultTodoList.id = 'default-todo-list';
        defaultSettingsContainer.appendChild(defaultTodoList);

        fetchDefaultTodos();

        const defaultBackButton = document.createElement('button');
        defaultBackButton.textContent = 'Back to Settings';
        defaultBackButton.className = 'mt-4 px-4 py-2 bg-gray-200 rounded-lg';
        defaultBackButton.onclick = showDefaultMainSettings;
        defaultSettingsContainer.appendChild(defaultBackButton);

        createDefaultAddTodoModal();
        setupDefaultEventListeners();
    }

    function createDefaultAddTodoModal() {
        defaultAddTodoModal = document.createElement('div');
        defaultAddTodoModal.className = 'add-todo-modal';
        defaultAddTodoModal.innerHTML = `
            <div class="modal-header">
                <h2>Add Default Todo</h2>
                <button class="close-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <input type="text" id="default-todo-title" placeholder="Enter todo title">
            <textarea id="default-todo-description" placeholder="Enter description"></textarea>
            <div id="default-day-selector" class="day-selector"></div>
            <button id="default-save-todo">Add Todo</button>
        `;
        defaultSettingsContainer.appendChild(defaultAddTodoModal);

        const defaultDaySelector = defaultAddTodoModal.querySelector('#default-day-selector');
        defaultDaysOfWeek.forEach(day => {
            const defaultDayButton = document.createElement('button');
            defaultDayButton.textContent = day.charAt(0);
            defaultDayButton.className = 'day-button';
            defaultDayButton.setAttribute('data-day', day);
            defaultDaySelector.appendChild(defaultDayButton);
        });
    }

    function setupDefaultEventListeners() {
        defaultAddTodoButton.addEventListener('click', () => {
            defaultAddTodoModal.style.display = 'block';
            setTimeout(() => {
                defaultAddTodoModal.classList.add('active');
                document.getElementById('default-todo-title').focus();
            }, 10);
        });

        defaultAddTodoModal.querySelector('.close-modal').addEventListener('click', () => {
            defaultAddTodoModal.classList.remove('active');
            setTimeout(() => {
                defaultAddTodoModal.style.display = 'none';
            }, 300);
        });

        document.getElementById('default-save-todo').addEventListener('click', saveDefaultTodo);

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.add-todo-modal') && !event.target.closest('.add-todo-button')) {
                defaultAddTodoModal.classList.remove('active');
                setTimeout(() => {
                    defaultAddTodoModal.style.display = 'none';
                }, 300);
            }
        });

        const defaultDayButtons = defaultAddTodoModal.querySelectorAll('.day-button');
        defaultDayButtons.forEach(button => {
            button.addEventListener('click', toggleDefaultDaySelection);
        });
    }

    function toggleDefaultDaySelection(event) {
        const clickedButton = event.target;
        const isDaily = clickedButton.getAttribute('data-day') === 'Daily';

        if (isDaily) {
            defaultAddTodoModal.querySelectorAll('.day-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            clickedButton.classList.add('selected');
        } else {
            defaultAddTodoModal.querySelector('[data-day="Daily"]').classList.remove('selected');
            clickedButton.classList.toggle('selected');
        }

        updateDefaultDaySelectionUI();
    }

    function updateDefaultDaySelectionUI() {
        const selectedDays = Array.from(defaultAddTodoModal.querySelectorAll('.day-button.selected'))
            .map(btn => btn.getAttribute('data-day'));

        defaultAddTodoModal.querySelectorAll('.day-button').forEach(btn => {
            const day = btn.getAttribute('data-day');
            if (selectedDays.includes(day)) {
                btn.classList.add('selected');
                if (day !== 'Daily') {
                    addDefaultCrossIcon(btn);
                }
            } else {
                btn.classList.remove('selected');
                removeDefaultCrossIcon(btn);
            }
        });
    }

    function addDefaultCrossIcon(button) {
        if (!button.querySelector('.cross-icon')) {
            const defaultCrossIcon = document.createElement('span');
            defaultCrossIcon.className = 'cross-icon';
            defaultCrossIcon.innerHTML = '&times;';
            defaultCrossIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                button.classList.remove('selected');
                removeDefaultCrossIcon(button);
                updateDefaultDaySelectionUI();
            });
            button.appendChild(defaultCrossIcon);
        }
    }

    function removeDefaultCrossIcon(button) {
        const defaultCrossIcon = button.querySelector('.cross-icon');
        if (defaultCrossIcon) {
            defaultCrossIcon.remove();
        }
    }

    function saveDefaultTodo() {
        const title = document.getElementById('default-todo-title').value;
        const description = document.getElementById('default-todo-description').value;
        const selectedDays = Array.from(defaultAddTodoModal.querySelectorAll('.day-button.selected'))
            .map(btn => btn.getAttribute('data-day'));

        if (title && selectedDays.length > 0) {
            console.log('Saving default todo:', { title, description, days: selectedDays });

            const newDefaultTodo = createDefaultTodoListItem({ id: Date.now(), title, description, days: selectedDays });
            document.getElementById('default-todo-list').prepend(newDefaultTodo);

            defaultAddTodoModal.classList.remove('active');
            setTimeout(() => {
                defaultAddTodoModal.style.display = 'none';
            }, 300);
            document.getElementById('default-todo-title').value = '';
            document.getElementById('default-todo-description').value = '';
            defaultAddTodoModal.querySelectorAll('.day-button').forEach(btn => {
                btn.classList.remove('selected');
                removeDefaultCrossIcon(btn);
            });
        } else {
            alert('Please enter a title and select at least one day.');
        }
    }

    function fetchDefaultTodos() {
        // This function would typically fetch todos from your server
        // For now, let's add some dummy todos
        const dummyDefaultTodos = [
            { id: 1, title: "Complete project", description: "Finish the todo app", days: ['Monday', 'Wednesday', 'Friday'] },
            { id: 2, title: "Buy groceries", description: "Get milk, eggs, and bread", days: ['Daily'] }
        ];

        const defaultTodoList = document.getElementById('default-todo-list');
        defaultTodoList.innerHTML = '';
        dummyDefaultTodos.forEach(todo => {
            const listItem = createDefaultTodoListItem(todo);
            defaultTodoList.appendChild(listItem);
        });
    }

    function createDefaultTodoListItem(todo) {
        const defaultListItem = document.createElement('li');
        defaultListItem.className = 'default-todo-item';
        defaultListItem.setAttribute('data-id', todo.id);
        defaultListItem.innerHTML = `
            <span class="default-todo-title">${todo.title}</span>
            <div class="default-todo-days">${todo.days.join(', ')}</div>
            <div class="default-todo-actions">
                <img src="/static/info.svg" alt="Info" class="default-todo-info-icon">
            </div>
        `;
        defaultListItem.querySelector('.default-todo-info-icon').addEventListener('click', () => showDefaultTodoDetails(todo));
        return defaultListItem;
    }

    function showDefaultTodoDetails(todo) {
        const defaultModal = document.getElementById('defaultTodoDetailsModal');
        document.getElementById("defaultModalTitle").textContent = todo.title;
        document.getElementById("defaultModalDescription").textContent = todo.description || "No description provided";
        document.getElementById("defaultModalMeta").textContent = `Days: ${todo.days.join(', ')}`;
        defaultModal.style.display = "block";
        setTimeout(() => {
            defaultModal.classList.add("show");
        }, 10);
    }

    function showDefaultMainSettings() {
        defaultSettingsContainer.innerHTML = '';
        const defaultTitle = document.createElement('h1');
        defaultTitle.className = 'text-3xl font-bold';
        defaultTitle.textContent = 'Settings';
        defaultSettingsContainer.appendChild(defaultTitle);
        // Add other settings options here
    }

    document.addEventListener('showDefaultTodoView', createDefaultTodoViewPage);
});