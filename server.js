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
    var matchedTodo = _.findWhere(todos, { id: todoId });
    requiredProperties = ['description', 'completed'];
    var body = _.pick(req.body, requiredProperties);

    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send();
    }
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.length > 0) {
        body.description = body.description.trim();
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Listening on PORT: ' + PORT);
    });
});
