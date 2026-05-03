const STORAGE_KEY = 'deadlineOrbitDeadlines';

function getDeadlines() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return [];
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error('Invalid deadline data:', error);
        return [];
    }
}

function saveDeadlines(deadlines) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
}

function loadAllDeadlines() {
    const deadlines = getDeadlines();
    displayDeadlinesOnPage(deadlines);
}

function displayDeadlinesOnPage(deadlines) {
    const listDiv = document.getElementById('deadline-list');
    listDiv.innerHTML = '';

    if (deadlines.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #a0aab2;">No active missions found.</p>';
        return;
    }

    deadlines.forEach(function(item) {
        const dueDate = new Date(item.dueDate);
        const hoursRemaining = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60);
        const cardClass = hoursRemaining <= 24 ? 'card urgent' : 'card';

        listDiv.innerHTML += `
            <div class="${cardClass}">
                <div class="card-content">
                    <div class="card-title">${item.title}</div>
                    <div class="card-info">
                        Due: ${dueDate.toLocaleString()}<br>
                        Priority: ${item.priority}
                    </div>
                </div>
                <div>
                    <button class="btn-edit" onclick="redirectToEditPage('${item.id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteDeadline('${item.id}')">Delete</button>
                </div>
            </div>
        `;
    });
}

function saveNewDeadline(title, dueDate, priority) {
    const deadlines = getDeadlines();
    deadlines.push({
        id: Date.now().toString(),
        title: title || 'Untitled mission',
        dueDate: dueDate,
        priority: priority || 'Medium'
    });
    saveDeadlines(deadlines);
    window.location.href = 'index.html';
}

function deleteDeadline(id) {
    if (!confirm('Delete this mission?')) {
        return;
    }
    const deadlines = getDeadlines().filter(function(item) {
        return item.id !== id;
    });
    saveDeadlines(deadlines);
    loadAllDeadlines();
}

function redirectToEditPage(id) {
    window.location.href = 'edit.html?id=' + id;
}

function loadDeadlineForEditing() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const item = getDeadlines().find(function(deadline) {
        return deadline.id === id;
    });

    if (!item) {
        alert('Mission not found.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('title').value = item.title;
    document.getElementById('dueDate').value = item.dueDate;
    document.getElementById('priority').value = item.priority;
}

function saveEditedDeadline(title, dueDate, priority) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const deadlines = getDeadlines().map(function(item) {
        if (item.id === id) {
            return {
                id: id,
                title: title || 'Untitled mission',
                dueDate: dueDate,
                priority: priority || 'Medium'
            };
        }
        return item;
    });
    saveDeadlines(deadlines);
    window.location.href = 'index.html';
}

function askForNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
