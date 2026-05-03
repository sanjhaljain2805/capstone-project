const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'deadlines.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

function readDeadlinesFromFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    if (!fileContent || fileContent.trim() === '') {
        return [];
    }
    try {
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('JSON Parse Error:', error);
        return [];
    }
}

function writeDeadlinesToFile(deadlineList) {
    const textContent = JSON.stringify(deadlineList, null, 2);
    fs.writeFileSync(DATA_FILE, textContent);
}

app.get('/api/deadlines', function(request, response) {
    const deadlineList = readDeadlinesFromFile();
    response.json(deadlineList);
});

app.post('/api/deadlines', function(request, response) {
    console.log('Received new deadline request:', request.body);
    const newDeadline = {
        id: uuidv4(),
        title: request.body.title || 'Untitled',
        dueDate: request.body.dueDate || new Date().toISOString(),
        priority: request.body.priority || 'Medium'
    };
    const deadlineList = readDeadlinesFromFile();
    deadlineList.push(newDeadline);
    writeDeadlinesToFile(deadlineList);
    response.status(201).json(newDeadline);
});

app.delete('/api/deadlines/:id', function(request, response) {
    const deadlineId = request.params.id;
    const deadlineList = readDeadlinesFromFile();
    const newList = [];
    for (let i = 0; i < deadlineList.length; i++) {
        if (deadlineList[i].id !== deadlineId) {
            newList.push(deadlineList[i]);
        }
    }
    writeDeadlinesToFile(newList);
    response.json({ message: 'Deleted' });
});

app.put('/api/deadlines/:id', function(request, response) {
    const deadlineId = request.params.id;
    const deadlineList = readDeadlinesFromFile();
    let updatedDeadline = null;
    for (let i = 0; i < deadlineList.length; i++) {
        if (deadlineList[i].id === deadlineId) {
            deadlineList[i].title = request.body.title;
            deadlineList[i].dueDate = request.body.dueDate;
            deadlineList[i].priority = request.body.priority;
            updatedDeadline = deadlineList[i];
            break;
        }
    }
    if (updatedDeadline) {
        writeDeadlinesToFile(deadlineList);
        response.json(updatedDeadline);
    } else {
        response.status(404).json({ message: 'Not found' });
    }
});

if (require.main === module) {
    app.listen(PORT, function() {
        console.log('Server running on http://localhost:' + PORT);
    });
}

module.exports = app;
