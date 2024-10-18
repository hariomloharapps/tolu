$(document).ready(function() {
    const navItems = [
        { name: 'home', svg1: '/static/images/home1.svg', svg2: '/static/images/home2.svg' },
        { name: 'todo', svg1: '/static/images/todo1.svg', svg2: '/static/images/todo2.svg' },
        { name: 'analytics', svg1: '/static/images/analytics1.svg', svg2: '/static/images/analytics2.svg' },
        { name: 'settings', svg1: '/static/images/settings1.svg', svg2: '/static/images/settings2.svg' }
    ];

    // Create navigation items
    const navHtml = navItems.map(item => `
        <a href="#" class="nav-item" data-page="${item.name}">
            <div class="nav-icon-container">
                <img src="${item.svg1}" alt="${item.name}" class="nav-icon nav-icon-1">
                <img src="${item.svg2}" alt="${item.name}" class="nav-icon nav-icon-2">
            </div>
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

        // Animate icon change
        $('.nav-item').each(function() {
            const item = $(this);
            const isActive = item.hasClass('active');
            
            if (isActive) {
                item.addClass('animating');
                setTimeout(() => {
                    item.removeClass('animating');
                }, 300);
            }
        });

        history.pushState(null, '', `#${page}`);

        // Show or hide the add todo button based on the current page
        if (page === 'todo') {
            $('.add-todo-button').show();
        } else {
            $('.add-todo-button').hide();
        }
    }

    $(window).on('popstate', function() {
        const page = location.hash.slice(1) || 'home';
        switchPage(page);
    });

    const initialPage = location.hash.slice(1) || 'home';
    switchPage(initialPage);
});