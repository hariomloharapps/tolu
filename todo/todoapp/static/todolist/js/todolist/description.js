

        function getTodoDetails(todoId) {
            fetch(`/api/todos/${todoId}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(todoDetails => {
                    document.getElementById("modalTitle").textContent = todoDetails.title;
                    document.getElementById("modalDescription").textContent = todoDetails.description || "No description provided";
                    
                    document.getElementById("modalCreatedAt").textContent = "Created: " + new Date(todoDetails.created_at).toLocaleString();

                    const modal = document.getElementById("todoDetailsModal");
                    modal.style.display = "block";
                    setTimeout(() => {
                        modal.classList.add("show");
                    }, 10);
                })
                .catch(error => {
                    console.error('Error fetching todo details:', error);
                    alert('Failed to load todo details. Please try again.');
                });
        }

        document.querySelectorAll('.todo-item').forEach(item => {
            item.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTodo(item));
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

        // Modal close functionality
        const modal = document.getElementById("todoDetailsModal");
        const closeBtn = modal.querySelector(".close");

        function closeModal() {
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
            }, 300);
        }

        closeBtn.onclick = closeModal;

        window.onclick = function(event) {
            if (event.target == modal) {
                closeModal();
            }
        }