'use strict';

/**
	* User Model
	*/

var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {

	var User = sequelize.define('User',
		{
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
			name: DataTypes.STRING,
			email: DataTypes.STRING,
			username: DataTypes.STRING,
			pass_hash: DataTypes.STRING,
			provider: DataTypes.STRING,
			pass_salt: DataTypes.STRING,
			facebook_user_id: DataTypes.INTEGER,
			twitter_user_id: DataTypes.INTEGER,
			twitter_key: DataTypes.STRING,
			twitter_secret: DataTypes.STRING,
      open_id: DataTypes.STRING,
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,

			instanceMethods: {
				toJSON: function () {
					var values = this.get();
					delete values.pass_hash;
					delete values.pass_salt;
					return values;
				},
				makeSalt: function() {
					return crypto.randomBytes(16).toString('base64');
				},
				authenticate: function(plainText){
					return this.encryptPassword(plainText, this.pass_salt) === this.pass_hash;
				},
				encryptPassword: function(password, salt) {
					if (!password || !salt) {
                        return '';
                    }
					salt = new Buffer(salt, 'base64');
					return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
				}
			},
		}
	);

	return User;
};
