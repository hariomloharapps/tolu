$(document).ready(function() {
    let addTodoButton, addTodoModal;
    
    // Create add todo button
    addTodoButton = $('<button class="add-todo-button"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m499-287 335-335-52-52-335 335 52 52Zm-261 87q-100-5-149-42T40-349q0-65 53.5-105.5T242-503q39-3 58.5-12.5T320-542q0-26-29.5-39T193-600l7-80q103 8 151.5 41.5T400-542q0 53-38.5 83T248-423q-64 5-96 23.5T120-349q0 35 28 50.5t94 18.5l-4 80Zm280 7L353-358l382-382q20-20 47.5-20t47.5 20l70 70q20 20 20 47.5T900-575L518-193Zm-159 33q-17 4-30-9t-9-30l33-159 165 165-159 33Z"/></svg></button>');
    $('body').append(addTodoButton);

    // Create add todo modal
    addTodoModal = $(`
        <div class="add-todo-modal">
            <div class="modal-header">
                <h2>Add Todo  </h2>
                <button class="close-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <input type="text" id="todo-title" placeholder="Enter todo title">
            
            <textarea id="todo-description" style="display:none;" placeholder="Enter description"></textarea>
            
            <div class="button-container">
                <button class="toggle-description ">Add Description</button>
                <button class="edit-duration ">Edit Default</button>
            </div>
            <button id="save-todo">Add Todo</button>
        </div>
    `);
    $('body').append(addTodoModal);

    // Create edit duration modal
    let editDurationModal = $(`
        <div class="edit-duration-modal">
            <h3>Edit Default Duration</h3>
            <select id="default-duration">
                <option value="1">A day</option>
                <option value="2">A week</option>
                <option value="3">A month</option>
            </select>
            <button id="save-duration">Save</button>
        </div>
    `);
    $('body').append(editDurationModal);

    // Toggle description field
    $('.toggle-description').on('click', function() {
        $('#todo-description').slideToggle(300);
        $(this).text(function(i, text) {
            return text === "Add Description" ? "Remove Description" : "Add Description";
        });
    });
    
    
    let defaultDuration = "1"; // Default duration set to "A day"

    // Open edit duration modal
    $('.edit-duration').on('click', function() {
        editDurationModal.addClass('active');
    });

    // Save default duration
    $('#save-duration').on('click', function() {
        defaultDuration = $('#default-duration').val();
        editDurationModal.removeClass('active');
    });

    // Close modals
    $('.close-modal').on('click', function() {
        addTodoModal.removeClass('active');
        editDurationModal.removeClass('active');
    });

    $('#todo-list').on('click', '.todo-item .checkbox-container', function() {
        const todoItem = $(this).closest('.todo-item');
        const todoId = todoItem.data('id');
     //   $(this).toggleClass('completed');
        
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

    addTodoButton.on('click', function() {
        addTodoModal.addClass('active');
        setTimeout(() => {
            $('#todo-title').focus();
        }, 300);
    });

    $('#save-todo').on('click', function() {
        const title = $('#todo-title').val();
        const description = $('#todo-description').val();
        
        if (title) {
            $.ajax({
                url: '/add-todo/',
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                data: {
                    title: title,
                    description: description,
                    duration: defaultDuration // Use the defaultDuration here
                },
                success: function(response) {
                    if (response.success) {
                        const newTodo = $(`
                    <div class="todo-item" data-id=" ${ response.id }">

                        <div class="todo-content">
                            <label class="checkbox-container">
                                <input type="checkbox" >
                                <svg viewBox="0 0 64 64" width="25" height="25">
                                    <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="checkbox-path"></path>
                                </svg>
                            </label>
                            <span class="todo-title nunito-semibold">${ title }</span>
                            <img src="/static/info.svg" alt="Info" class="info-icon" onclick="getTodoDetails(${ response.id })">
                        </div>
                        <div class="delete-btn">Delete</div>
      

                        `);
                        $('#todo-list').prepend(newTodo);
                        addTodoModal.removeClass('active');
                        $('#todo-title').val('');
                        $('#todo-description').val('').hide();
                        $('.toggle-description').text('Add Description');
                    }
                }
            });
        }
    });
        
        
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.add-todo-modal, .add-todo-button, .edit-duration-modal').length) {
            addTodoModal.removeClass('active');
            editDurationModal.removeClass('active');
        }
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

    // Show/hide add todo button based on the current page
    function updateAddTodoButtonVisibility() {
        const currentPage = location.hash.slice(1) || 'home';
        if (currentPage === 'todo') {
            addTodoButton.show();
        } else {
            addTodoButton.hide();
        }
    }

    // Call this function when the page loads and when the hash changes
    $(window).on('load hashchange', updateAddTodoButtonVisibility);
});

