var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-nightowl.sqlite'
});

var db = {};
db.user = sequelize.import(__dirname + '/models/userNightowl.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;