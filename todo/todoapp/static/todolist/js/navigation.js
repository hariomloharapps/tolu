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

    // Updated navigation item structure
    const navItems = [
        { name: 'home', svg1: '/static/images/home1.svg', svg2: '/static/images/home2.svg' },
        { name: 'todo', svg1: '/static/images/todo1.svg', svg2: '/static/images/todo2.svg' },
        { name: 'analytics', svg1: '/static/images/analytics1.svg', svg2: '/static/images/analytics2.svg' },
        { name: 'settings', svg1: '/static/images/settings1.svg', svg2: '/static/images/settings2.svg' }
    ];

    // Create navigation items
    const navHtml = navItems.map(item => `
        <a href="#" class="nav-item" data-page="${item.name}">
            <img src="${item.svg1}" alt="${item.name}" class="nav-icon nav-icon-1">
            <img src="${item.svg2}" alt="${item.name}" class="nav-icon nav-icon-2" style="display: none;">
            <span>${item.name}</span>
        </a>
    `).join('');

    $('.bottom-nav').html(navHtml);

    $('.nav-item').on('click', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        switchPage(page);
    });

    function switchPage(page) {
        $('.page-content').removeClass('active').addClass('hidden');
        $(`#${page}-content`).removeClass('hidden').addClass('active');
        
        $('.nav-item').removeClass('active');
        const activeItem = $(`.nav-item[data-page="${page}"]`);
        activeItem.addClass('active');

        // Animate SVG change
        $('.nav-item').each(function() {
            const item = $(this);
            const isActive = item.hasClass('active');
            const icon1 = item.find('.nav-icon-1');
            const icon2 = item.find('.nav-icon-2');

            if (isActive) {
                icon1.fadeOut(300, function() {
                    icon2.fadeIn(300);
                });
            } else {
                icon2.fadeOut(300, function() {
                    icon1.fadeIn(300);
                });
            }
        });

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

    // ... (rest of the code remains the same)

});