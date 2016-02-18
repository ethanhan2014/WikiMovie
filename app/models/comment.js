'use strict';

/**
	* Comment Model
	*/

module.exports = function(sequelize, DataTypes) {

	var Comment = sequelize.define('Comment',
		{
      comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      item_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      timestamp: DataTypes.DATE,
      content: DataTypes.STRING(1000),
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,

      associate: function(models) {
        Comment.belongsTo(models.Item, {
          as: 'Subject',
          timestamps: false,
          foreignKey: 'item_id',
        });

        Comment.belongsTo(models.User, {
          as: 'Author',
          timestamps: false,
          foreignKey: 'user_id',
        });
      }
		}
	);

	return Comment;
};
