document.addEventListener('DOMContentLoaded', function() {
    const settingsContainer = document.getElementById('settings-content');
    
    const settingsData = [
        {

        },
        {
            title: 'Legal',
            items: [
                // { type: 'link', label: 'Terms and Conditions', url: 'py' },
                { type: 'link', label: 'Privacy Policy' },
                { type: 'link', label: 'Data Usage'}
            ]
        },
        {
            title: 'Account',
            items: [
                { type: 'link', label: 'Change Password'},
                { type: 'button', label: 'Logout', action: 'logout', url: '/logout/' }
            ]
        }
    ];

    function createSettingsGroup(groupData) {
        const group = document.createElement('div');
        group.className = 'settings-group';

        if (groupData.title) {
            const title = document.createElement('div');
            title.className = 'section-title';
            title.textContent = groupData.title;
            settingsContainer.appendChild(title);
        }

        const list = document.createElement('ul');
        list.className = 'settings-list';

        groupData.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'settings-item';
            listItem.textContent = item.label;

            switch (item.type) {
                case 'select':
                    const select = createSelect(item.options, item.value);
                    listItem.appendChild(select);
                    break;
                case 'toggle':
                    const toggle = createToggle(item.value);
                    listItem.appendChild(toggle);
                    break;
                case 'link':
                    listItem.innerHTML += ' <span>›</span>';
                    listItem.onclick = () => handleAction(item.url, item.label);
                    break;
                case 'button':
                    if (item.label === 'Logout') {
                        listItem.style.color = 'red';
                    }
                    listItem.onclick = () => handleAction(item.action, item.label, item.url);
                    break;
            }

            list.appendChild(listItem);
        });

        group.appendChild(list);
        settingsContainer.appendChild(group);
    }

    function createSelect(options, value) {
        const selectContainer = document.createElement('div');
        selectContainer.className = 'custom-select';

        const select = document.createElement('select');
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === value) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        const selectedDiv = document.createElement('div');
        selectedDiv.className = 'select-selected';
        selectedDiv.textContent = value;

        selectContainer.appendChild(select);
        selectContainer.appendChild(selectedDiv);

        return selectContainer;
    }

    function createToggle(value) {
        const label = document.createElement('label');
        label.className = 'toggle-switch';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = value;

        const span = document.createElement('span');
        span.className = 'toggle-slider';

        label.appendChild(input);
        label.appendChild(span);

        return label;
    }

    function handleAction(action, label, url) {
        switch (action) {
            case 'logout':
                showLogoutConfirmation(url);
                break;
            default:
                if (typeof action === 'string' && (action.startsWith('http') || action.startsWith('#'))) {
                    animatePageTransition(() => {
                        window.location.href = action;
                    });
                } else {
                    notification.show(`Coming Soon : ${label}`);
                }
        }
    }

    function showLogoutConfirmation(logoutUrl) {
        const confirmationBox = document.createElement('div');
        confirmationBox.className = 'confirmation-box';
        confirmationBox.innerHTML = `
            <div class="confirmation-content">
                <h2>Log Out</h2>
                <p>Are you sure you want to log out?</p>
                <div class="confirmation-buttons">
                    <button class="logout-button">Log Out</button>
                    <button class="cancel-button">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmationBox);

        // Trigger reflow to enable transition
        confirmationBox.offsetHeight;

        // Add active class to trigger animation
        confirmationBox.classList.add('active');

        confirmationBox.querySelector('.cancel-button').addEventListener('click', () => {
            confirmationBox.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(confirmationBox);
            }, 300); // Match the transition duration
        });

        confirmationBox.querySelector('.logout-button').addEventListener('click', () => {
            confirmationBox.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(confirmationBox);
                window.location.href = logoutUrl;
            }, 300); // Match the transition duration
        });
    }

    function animatePageTransition(callback) {
        settingsContainer.classList.add('fade-out');
        setTimeout(() => {
            callback();
            setTimeout(() => {
                settingsContainer.classList.remove('fade-out');
                settingsContainer.classList.add('fade-in');
                setTimeout(() => {
                    settingsContainer.classList.remove('fade-in');
                }, 300);
            }, 50);
        }, 300);
    }

    settingsData.forEach(createSettingsGroup);
});



// notification.js
class Notification {
    constructor() {
        this.notification = null;
        this.timeout = null;
    }

    show(message, duration = 3000) {
        if (this.notification) {
            this.hide();
        }

        this.notification = document.createElement('div');
        this.notification.className = 'notification';
        this.notification.innerHTML = `
            ${message}
            <button class="notification-close" aria-label="Close notification">
                <span class="material-icons">close</span>
            </button>
        `;

        document.body.appendChild(this.notification);

        // Trigger reflow to enable transition
        this.notification.offsetHeight;

        this.notification.classList.add('show');

        this.notification.querySelector('.notification-close').addEventListener('click', () => this.hide());

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.hide(), duration);
    }

    hide() {
        if (this.notification) {
            this.notification.classList.add('hide');
            this.notification.classList.remove('show');
            setTimeout(() => {
                if (this.notification && this.notification.parentNode) {
                    this.notification.parentNode.removeChild(this.notification);
                }
                this.notification = null;
            }, 500); // Match the animation duration
        }
    }
}

const notification = new Notification();