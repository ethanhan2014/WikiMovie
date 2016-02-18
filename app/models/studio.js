'use strict';

/**
	* Studio Model
	*/

module.exports = function(sequelize, DataTypes) {

	var Studio = sequelize.define('Studio',
		{
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
			location: DataTypes.STRING(100),
      name: DataTypes.STRING(100),
      logo_url: DataTypes.STRING(200),
      description: DataTypes.STRING(1000),
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,

      // Need to associate studios with creating movies.
      // For whatever reason, "as" binds with Movie while foreignKey binds
      // with Studio. Be very careful.
      associate: function(models) {
        Studio.belongsToMany(models.Movie, {
          as: 'CreatedMovies',
          through: 'Creates_Movie',
          foreignKey: 'studio_id',
          timestamps: false,
        });

        Studio.belongsTo(models.Item, {
          as: 'Item',
          timestamps: false,
          foreignKey: 'item_id',
        });

      }
		}
	);

	return Studio;
};
