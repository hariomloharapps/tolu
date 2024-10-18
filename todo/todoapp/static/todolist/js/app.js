$(document).ready(function() {
    let addTodoButton, addTodoModal;

    // Create add todo button
    addTodoButton = $('<div class="add-todo-button" style="display:none;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></div>');
    $('body').append(addTodoButton);

    // Create add todo modal
    addTodoModal = $(`
        <div class="add-todo-modal">
            <input type="text" id="todo-title" placeholder="Enter todo title">
            <select id="todo-duration">
                <option value="1">A day</option>
                <option value="2">A week</option>
                <option value="3">A month</option>
            </select>
            <button id="save-todo">Save Todo</button>
        </div>
    `);
    $('body').append(addTodoModal);

    $('.nav-item').on('click', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        switchPage(page);
    });

    function switchPage(page) {
        $('.page-content').removeClass('active').addClass('hidden');
        $(`#${page}-content`).removeClass('hidden').addClass('active');
        $('.nav-item').removeClass('active');
        $(`.nav-item[data-page="${page}"]`).addClass('active');
        history.pushState(null, '', `#${page}`);

        // Show or hide the add todo button based on the current page
        if (page === 'todo') {
            addTodoButton.show();
        } else {
            addTodoButton.hide();
        }
    }

    $(window).on('popstate', function() {
        const page = location.hash.slice(1) || 'home';
        switchPage(page);
    });

    const initialPage = location.hash.slice(1) || 'home';
    switchPage(initialPage);

    $('#todo-list').on('click', '.todo-item .w-6', function() {
        const todoItem = $(this).closest('.todo-item');
        const todoId = todoItem.data('id');
        $(this).addClass('bg-green-500 border-green-500');
        
        $.ajax({
            url: `/complete-todo/${todoId}/`,
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                if (response.success) {
                    setTimeout(function() {
                        todoItem.fadeOut(300, function() {
                            $(this).remove();
                        });
                    }, 1000);
                }
            }
        });
    });

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

    addTodoButton.on('click', function() {
        addTodoModal.addClass('active');
    });

    $('#save-todo').on('click', function() {
        const title = $('#todo-title').val();
        const duration = $('#todo-duration').val();

        if (title) {
            $.ajax({
                url: '/add-todo/',
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                data: {
                    title: title,
                    duration: duration
                },
                success: function(response) {
                    if (response.success) {
                        const newTodo = $(`
                            <div class="todo-item bg-white rounded-max shadow-lg p-4 flex items-center" data-id="${response.id}">
                                <div class="w-6 h-6 bg-white border-2 border-gray-300 rounded-max mr-4 flex-shrink-0 cursor-pointer hover:bg-gray-100 transition-colors duration-200"></div>
                                <span class="text-lg text-gray-800">${title}</span>
                            </div>
                        `);
                        $('#todo-list').prepend(newTodo);
                        addTodoModal.removeClass('active');
                        $('#todo-title').val('');
                    }
                }
            });
        }
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.add-todo-modal, .add-todo-button').length) {
            addTodoModal.removeClass('active');
        }
    });

    // Initial visibility check for add todo button
    if (initialPage === 'todo') {
        addTodoButton.show();
    } else {
        addTodoButton.hide();
    }
});

