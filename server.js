var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [
    {
        id: 1,
        description: 'Meet Mom for lunch',
        completed: false
    },
    {
        id: 2,
        description: 'Go to market',
        completed: false
    },
    {
        id: 3,
        description: 'Buy vegetables',
        completed: true
    }
];

app.get('/', function (req, res) {
    res.send('Todo API root');
});

app.get('/todos', function (req, res) {
    res.send(todos);
});

app.get('/todo/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo;
    todos.forEach(function (todo) {
        if (todo.id === todoId) {
            matchedTodo = todo;
        }
    });

    if (matchedTodo) {
        res.send(matchedTodo);
    } else {
        res.status(404).send;
    }
});

app.listen(PORT, function () {
    console.log('Listening on PORT: ' + PORT);
});