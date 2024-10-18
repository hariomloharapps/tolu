$(document).ready(function() {
    let touchStartX = 0;
    let touchEndX = 0;
    let currentItem = null;
    const deleteThreshold = 0.5;
    const completeThreshold = -0.3;
    let isSliding = false;
    let currentState = 'default';

    $(document).on('touchstart', '.todo-content', function(e) {
        if ($(e.target).hasClass('info-icon')) return;
        touchStartX = e.originalEvent.touches[0].clientX;
        currentItem = $(this).closest('.todo-item');
        isSliding = false;
        currentState = currentItem.hasClass('delete-ready') ? 'delete-ready' : 'default';
    });

    $(document).on('touchmove', '.todo-content', function(e) {
        if (!currentItem || $(e.target).hasClass('info-icon')) return;
        
        touchEndX = e.originalEvent.touches[0].clientX;
        const diffX = touchStartX - touchEndX;
        const maxSlide = currentItem.width() * 0.3;

        isSliding = true;
        if (diffX > 0 && diffX <= maxSlide) {
            $(this).css('transform', `translateX(-${diffX}px)`);
            currentItem.find('.delete-btn').css('right', `-${30 - (diffX / maxSlide) * 30}%`);
        } else if (diffX < 0 && diffX >= -maxSlide) {
            $(this).css('transform', `translateX(-${diffX}px)`);
        }
    });

    $(document).on('touchend', '.todo-content', function(e) {
        if (!currentItem || $(e.target).hasClass('info-icon')) return;

        const diffX = touchStartX - touchEndX;
        const maxSlide = currentItem.width() * 0.3;

        if (isSliding) {
            if (diffX > maxSlide * deleteThreshold) {
                $(this).css('transform', `translateX(-${maxSlide}px)`);
                currentItem.find('.delete-btn').css('right', '0');
                currentItem.addClass('delete-ready');
                currentState = 'delete-ready';
            } else if (diffX < maxSlide * completeThreshold) {
                if (currentState === 'delete-ready') {
                    resetTodoItem(currentItem);
                    currentState = 'default';
                } else if (currentState === 'default') {
                    completeTodoItem(currentItem);
                    currentState = 'completed';
                }
            } else {
                resetTodoItem(currentItem);
                currentState = 'default';
            }
        }

        currentItem = null;
        isSliding = false;
    });

    $(document).on('click', '.delete-btn', function() {
        const todoItem = $(this).closest('.todo-item');
        deleteTodoItem(todoItem);
    });

    function resetTodoItem(item) {
        item.find('.todo-content').css('transform', 'translateX(0)');
        item.find('.delete-btn').css('right', '-30%');
        item.removeClass('delete-ready');
    }

    function completeTodoItem(item) {
        const todoId = item.data('id');
        $.ajax({
            url: `/complete-todo/${todoId}/`,
            type: 'POST',
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            },
            success: function(response) {
                if (response.success) {
                    item.addClass('completing');
                    item.find('.todo-content').css('transform', 'translateX(0)');
                    
                    // Fade out the content as the sweep passes
                    item.on('animationstart', function() {
                        $(this).find('.todo-content > *').css('opacity', function(index) {
                            return 1 - (index * 0.2); // Staggered fade out
                        });
                    });

                    // When the sweep is done, add the smoke effect
                    setTimeout(() => {
                        item.addClass('sweep-done');
                        setTimeout(() => {
                            item.remove();
                            updateEmptyState();
                        }, 1000); // Match this to the smoke animation duration
                    }, 1000); // Match this to the sweep animation duration
                } else {
                    alert('Failed to complete the todo. Please try again.');
                }
            },
            error: function() {
                alert('An error occurred. Please try again.');
            }
        });
    }

    function deleteTodoItem(item) {
        const todoId = item.data('id');
        $.ajax({
            url: `/delete-todo/${todoId}/`,
            type: 'POST',
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            },
            success: function(response) {
                if (response.success) {
                    // Reset the item to its original position
                    resetTodoItem(item);
                    // Add the deleting class to start the smoke animation
                    item.addClass('deleting');
                    // Remove the item after the animation completes
                    setTimeout(() => {
                        item.remove();
                        updateEmptyState();
                    }, 1500); // Match this to the animation duration
                } else {
                    alert('Failed to delete the todo. Please try again.');
                }
            },
            error: function() {
                alert('An error occurred. Please try again.');
            }
        });
    }

    function updateEmptyState() {
        if ($('#todo-list').children().length === 0) {
            $('#todo-list').html('<p class="text-gray-600 text-center py-8">No tasks yet. Start by adding some!</p>');
        }
    }

    // Checkbox click handler
    $(document).on('click', '.checkbox-container', function() {
        const todoItem = $(this).closest('.todo-item');
        completeTodoItem(todoItem);
    });
});