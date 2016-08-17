var Sequelize = require('sequelize'),
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': 'basic-sqlite-database.sqlite'
    }),
    Todo = sequelize.define('todo', {
        description: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        completed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    })
sequelize.sync(
    // force: true
)
    .then(function () {
        console.log('Everything is synced');
        Todo.findById(2)
            .then(function (todo) {
                if (todo) {
                    console.log(todo.toJSON());
                } else {
                    console.log('xxxxxxxxxxxxxxx    Todo not found    xxxxxxxxxxxxxxx');
                }
            });
        // Todo.create({
        //     description: 'Take out trash',
        // })
        //     .then(function (todo) {
        //         return Todo.create({
        //             description: 'Clean office',
        //         });
        //     })
        //     .then(function () {
        //         return Todo.findAll({
        //             where: {
        //                 description: {
        //                     $like: '%Office%'
        //                 }
        //             }
        //         });
        //     })
        //     .then(function (todos) {
        //         if (todos) {
        //             todos.forEach(function (todo) {
        //                 console.log(todo.toJSON());
        //             });

        //         } else {
        //             console.log('No todo found');
        //         }
        //     })
        //     .catch(function (error) {
        //         console.log(error);
        //     });
    });