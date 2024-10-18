// main.js
$(document).ready(function() {
    // Todo item completion
    $('.todo-item .w-6').on('click', function() {
        var todoItem = $(this).closest('.todo-item');
        var todoId = todoItem.data('id');
        $(this).addClass('bg-green-500 border-green-500');
        
        $.ajax({
            url: '/complete-todo/' + todoId + '/',
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

    // Bottom navigation
    
    
});