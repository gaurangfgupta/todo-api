var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API root');
});

app.get('/todos', function (req, res) {
    res.send(todos);
});

app.get('/todo/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoId });

    if (matchedTodo) {
        // console.log('Matched: ' + matchedTodo);
        res.send(matchedTodo);
    } else {
        // console.log('No match: ' + matchedTodo);
        res.status(404).send();
    }
});

app.post('/todos', function (req, res) {
    requiredProperties = ['description', 'completed'];
    var body = _.pick(req.body, requiredProperties);
    body.description = body.description.trim();

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.length === 0) {
        return res.status(400).send();
    }
    body.id = todoNextId++;
    todos.push(body);
    console.log('Description: ' + body.description);
    res.json(body);
});

app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoId });

    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).json({ "error": "No todo found" });
    }

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
app.listen(PORT, function () {
    console.log('Listening on PORT: ' + PORT);
});