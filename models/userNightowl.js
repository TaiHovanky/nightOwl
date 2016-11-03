//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

//module.exports = mongoose.model('User', new Schema({
  //  username: String,
  //  password: String,
//}));

module.exports = function (sequelize, DateTypes) {
    var users = sequelize.define('users', {
        email: {
            type: DateTypes.STRING,
            allowNull: true,
            unique: true,
        },
        username: {
            type: DateTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DateTypes.STRING,
            allowNull: false,
            unique: true
        }
    });
    return users;
}

//took out the email validate and set define('users') so that 'users' matches db
