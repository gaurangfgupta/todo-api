var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API root');
});

// GET /todos?complete=true?q=work
app.get('/todos', function (req, res) {
    var query = req.query;
    var where = {};
    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }
    db.todo.findAll({ where: where })
        .then(function (todos) {
            if (todos) {
                res.json(todos);
            } else {
                res.status(404).send();
            }
        })
        .catch(function (error) {
            res.status(500).send();
        });
});

app.get('/todo/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId)
        .then(function (todo) {
            console.log(todo);
            if (todo) {
                res.json(todo.toJSON());
            } else {
                res.status(404).send();
            }
        }, function (error) {
            res.status(500).send();
        });
});

app.post('/todos', function (req, res) {
    requiredProperties = ['description', 'completed'];
    var body = _.pick(req.body, requiredProperties);
    //Call create on db.todo
    //  Respond with and todo
    //Else Respond error and 404 status

    db.todo.create(body)
        .then(
        function (todo) {
            res.json(todo.toJSON());
        },
        function (error) {
            res.status(400).json(error);
        });
});

app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.destroy({
        where: {
            id: todoId
        }
    })
        .then(function (rowsDeleted) {
            if (rowsDeleted === 0) {
                res.status(404).json({ error: 'No todo with id' });
            } else {
                res.status(204).send();
            }
        }, function (error) {
            res.status(500).send();
        });
});

app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    requiredProperties = ['description', 'completed'];
    var body = _.pick(req.body, requiredProperties);

    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description.trim();
    }

    db.todo.findById(todoId)
        .then(function (todo) {
            if (todo) {
                todo.update(attributes)
                    .then(function (todo) {
                        res.json(todo.toJSON());
                    }, function (error) {
                        res.status(400).json(error);
                    })
            } else {
                res.status(404).send();
            }
        },
        function (error) {
            res.status(500).json();
        })
        .catch(function (error) {
            console.log(error);
        });
});

app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    db.user.create(body)
        .then(function (user) {
            res.json(user.toJSON());
        },
        function (error) {
            res.status(400).json(error);
        });
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Listening on PORT: ' + PORT);
    });
});