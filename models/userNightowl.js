//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

//module.exports = mongoose.model('User', new Schema({
  //  username: String,
  //  password: String,
//}));
var bcrypt = require('bcryptjs');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function (sequelize, DateTypes) {
    return sequelize.define('users', {
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
        salt: {
            type: DateTypes.STRING
        }, //salt adds random string to password so that the end hash is unique. best practice
        password_hash: {
            type: DateTypes.STRING
        },
        password: { //prevents password from being stored in database. Lets us override set functionality. 
            type: DateTypes.VIRTUAL,
            allowNull: false,
            unique: true,
            set: function(value){ //generate salt using crypto module
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: { //hooks used to convert email/username to lowercase before app checks db for matching user
            beforeValidate: function(user, options){
                if(typeof user.username ==="string"){
                    user.username = user.username.toLowerCase();
                }
            } //can't use toLowerCase on numbers. need to check for string
        },
        instanceMethods: {
            generateToken: function (type){
                if(typeof type !== 'string'){
                    return undefined;
                }
                try {
                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, 'tai123');
                    return token; 
                } catch(e){
                    return undefined;
                }
            } //token hides user's data and is returned to user
        }
    });
    
}

//took out the email validate and set define('users') so that 'users' matches db
