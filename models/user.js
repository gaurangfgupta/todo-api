var bcryptjs = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define(
        'user',
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.VIRTUAL,
                allowNull: false,
                validate: {
                    len: [5, 100]
                },
                set: function (value) {
                    var salt = bcryptjs.genSaltSync(10);
                    var hashedPassword = bcryptjs.hashSync(value, salt);
                    this.setDataValue('password', value);
                    this.setDataValue('salt', salt);
                    this.setDataValue('password_hash', hashedPassword);
                }
            },
            salt: {
                type: DataTypes.STRING
            },
            password_hash: {
                type: DataTypes.STRING
            }
        },
        {
            hooks: {
                beforeValidate: function (user, options) {
                    if (typeof user.email === 'string') {
                        user.email = user.email.toLowerCase();
                    }
                }
            },
            instanceMethods: {
                toPublicJSON: function () {
                    var json = this.toJSON();
                    return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
                },
                generateToken: function (type) {
                    if (!_.isString(type)) {
                        return undefined;
                    }
                    try {
                        var stringData = JSON.stringify({
                            id: this.get('id'),
                            type: type
                        });
                        var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123').toString();
                        var token = jwt.sign({
                            token: encryptedData,
                        }, 'qwerty098'
                        );
                        return token;
                    } catch (error) {
                        console.error(error);
                        return undefined;
                    }
                }
            },
            classMethods: {
                authenticate: function (body) {
                    return new Promise(function (resolve, reject) {
                        if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                            return reject();
                        }
                        // res.json(body);
                        var where;
                        user.findOne({
                            where: {
                                email: body.email
                            }
                        })
                            .then(function (user) {
                                if (!user || !bcryptjs.compareSync(body.password, user.get('password_hash'))) {
                                    return reject();
                                }
                                resolve(user);
                            },
                            function (error) {
                                // console.log(error);
                                reject();
                            });
                    });
                },
                findByToken: function (token) {
                    return new Promise(function (resolve, reject) {
                        try {
                            var decodedJWT = jwt.verify(token, 'qwerty098');
                            var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123');
                            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
                            user.findById(tokenData.id)
                                .then(function (user) {
                                    if (user) {
                                        resolve(user);
                                    } else {
                                        reject();
                                    }
                                }, function (error) {
                                    reject();
                                });
                        } catch (error) {
                            reject();
                        }
                    });
                }
            }
        }
    );
    return user;
}