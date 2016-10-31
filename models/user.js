//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

//module.exports = mongoose.model('User', new Schema({
  //  username: String,
  //  password: String,
//}));

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define('Users', {
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });
    return user;
}