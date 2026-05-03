const API_BASE_URL = '/api/deadlines';

function askForNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
}

function loadAllDeadlines() {
    fetch(API_BASE_URL)
        .then(function(response) {
            return response.json();
        })
        .then(function(deadlineData) {
            displayDeadlinesOnPage(deadlineData);
            checkDeadlinesForReminders(deadlineData);
        })
        .catch(function(error) {
            console.error('Error loading deadlines:', error);
        });
}

function displayDeadlinesOnPage(deadlinesArray) {
    const listDiv = document.getElementById('deadline-list');
    listDiv.innerHTML = '';
    if (deadlinesArray.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #a0aab2;">No active missions found.</p>';
        return;
    }
    for (let i = 0; i < deadlinesArray.length; i++) {
        const currentDeadline = deadlinesArray[i];
        const dueDate = new Date(currentDeadline.dueDate);
        const now = new Date();
        const timeRemaining = dueDate.getTime() - now.getTime();
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);
        
        // A mission is "Urgent" if it's due within 24 hours OR if it's already overdue
        const isUrgent = hoursRemaining <= 24;
        
        let cardClass = 'card';
        if (isUrgent === true) {
            cardClass = 'card urgent';
        }
        const cardHTML = `
            <div class="${cardClass}">
                <div class="card-content">
                    <div class="card-title">${currentDeadline.title}</div>
                    <div class="card-info">
                        Due: ${dueDate.toLocaleString()} <br>
                        Priority: ${currentDeadline.priority}
                    </div>
                </div>
                <div>
                    <button class="btn-edit" onclick="redirectToEditPage('${currentDeadline.id}')">Edit</button>
                    <button class="btn-delete" onclick="removeDeadlineFromServer('${currentDeadline.id}')">Delete</button>
                </div>
            </div>
        `;
        listDiv.innerHTML = listDiv.innerHTML + cardHTML;
    }
}

function saveNewDeadline(title, date, priority) {
    const dataToSend = { title: title, dueDate: date, priority: priority };
    fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })
    .then(function(response) {
        if (response.ok === true) {
            window.location.href = 'index.html';
        } else {
            alert('Failed to save deadline');
        }
    })
    .catch(function(error) {
        alert('Network error while saving');
    });
}

function removeDeadlineFromServer(deadlineId) {
    if (confirm('Are you sure?')) {
        fetch(API_BASE_URL + '/' + deadlineId, { method: 'DELETE' })
        .then(function(response) {
            if (response.ok === true) {
                loadAllDeadlines();
            }
        });
    }
}

function redirectToEditPage(deadlineId) {
    window.location.href = 'edit.html?id=' + deadlineId;
}

function loadDeadlineForEditing() {
    const urlParams = new URLSearchParams(window.location.search);
    const deadlineId = urlParams.get('id');
    fetch(API_BASE_URL)
        .then(function(response) {
            return response.json();
        })
        .then(function(deadlines) {
            for (let i = 0; i < deadlines.length; i++) {
                if (deadlines[i].id === deadlineId) {
                    document.getElementById('title').value = deadlines[i].title;
                    document.getElementById('dueDate').value = deadlines[i].dueDate;
                    document.getElementById('priority').value = deadlines[i].priority;
                    break;
                }
            }
        })
        .catch(function(error) {
            console.error('Error loading mission for edit:', error);
        });
}

function saveEditedDeadline(title, date, priority) {
    const urlParams = new URLSearchParams(window.location.search);
    const deadlineId = urlParams.get('id');
    const dataToSend = { title: title, dueDate: date, priority: priority };
    fetch(API_BASE_URL + '/' + deadlineId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })
    .then(function(response) {
        if (response.ok === true) {
            window.location.href = 'index.html';
        } else {
            alert('Failed to update deadline');
        }
    })
    .catch(function(error) {
        alert('Network error while updating');
    });
}

function checkDeadlinesForReminders(deadlinesArray) {
    if (Notification.permission !== 'granted') return;
    const now = new Date();
    for (let i = 0; i < deadlinesArray.length; i++) {
        const deadline = deadlinesArray[i];
        const dueDate = new Date(deadline.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursLeft = timeDiff / (1000 * 60 * 60);
        if (hoursLeft > 0 && hoursLeft <= 24) {
            const storageKey = 'notified_' + deadline.id;
            if (localStorage.getItem(storageKey) === null) {
                new Notification('URGENT', { body: 'Mission "' + deadline.title + '" is due soon!' });
                localStorage.setItem(storageKey, 'true');
            }
        }
    }
}
