// Flag to track if animation has run this session
let hasAnimatedThisSession = false;

// Flag to track if a request has been made during the page load
let hasRequested = false;

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = '#' + Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function setRankingsWithoutAnimation(data) {
    document.getElementById('ranking30d').innerHTML = '#' + data.ranking_30d;
    document.getElementById('ranking7d').innerHTML = '#' + data.ranking_7d;
}

function fetchAndDisplayRankings() {
    if (hasRequested) return; // Prevent multiple requests on page load
    hasRequested = true; // Set the flag to true to indicate that a request has been made

    // Delay the request by 3 seconds
    setTimeout(() => {
        fetch('/get_rank/')  // Adjust this URL to match your Django URL configuration
            .then(response => response.json())
            .then(data => {
                if (!hasAnimatedThisSession) {
                    animateValue(document.getElementById('ranking30d'), 0, data.ranking_30d, 500);
                    animateValue(document.getElementById('ranking7d'), 0, data.ranking_7d, 500);
                    hasAnimatedThisSession = true;
                } else {
                    setRankingsWithoutAnimation(data);
                }
            })
            .catch(error => console.error('Error fetching ranking data:', error));
    }, 3000); // 3000 milliseconds delay (3 seconds)
}

document.addEventListener('DOMContentLoaded', () => {
    const analyticsContent = document.getElementById('analytics-content');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (!analyticsContent.classList.contains('hidden')) {
                    fetchAndDisplayRankings();
                }
            }
        });
    });
    observer.observe(analyticsContent, { attributes: true });
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

    // Fetch rankings when switching to analytics page
    if (page === 'analytics') {
        fetchAndDisplayRankings();
    }
}

// Initialize the page based on the current hash
function initializePage() {
    const hash = window.location.hash.slice(1) || 'todo';
    switchPage(hash);
}

// Call initializePage when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Listen for hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    switchPage(hash);
});