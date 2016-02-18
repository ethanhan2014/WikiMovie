'use strict';

/**
	* Movie Model
	*/

module.exports = function(sequelize, DataTypes) {

	var Movie = sequelize.define('Movie',
		{
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
			title: DataTypes.STRING(200),
			duration: DataTypes.INTEGER,
      image_url: DataTypes.STRING(200),
      description: DataTypes.STRING(1000),
      release_date: DataTypes.DATEONLY,
			rt_audience_rating: DataTypes.DECIMAL(5,2),
      rt_critic_rating: DataTypes.DECIMAL(5, 2),
      tmdb_rating: DataTypes.DECIMAL(5, 2),
      tmdb_id: DataTypes.INTEGER,
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,

      // Need to associate movies as being created by studios.
      // For whatever reason, "as" binds with Studio while foreignKey binds
      // with Movie. Be very careful.
      //
      // Also associate movies with people in a similar manner (using involved)
      associate: function(models) {
        Movie.belongsToMany(models.Studio, {
          as: 'Creators',
          through: 'Creates_Movie',
          foreignKey: 'movie_id',
          timestamps: false,
        });

        // This is a one to many association, see Involved for more details.
        Movie.hasMany(models.Involved, {
          as: 'Involvements',
          foreignKey: 'movie_id'
        });

        Movie.belongsToMany(models.Tag, {
          as: 'Tags',
          through: models.Tag_Belongs,
          foreignKey: 'movie_id',
          timestamps: false,
        });

        Movie.belongsTo(models.Item, {
          as: 'Item',
          timestamps: false,
          foreignKey: 'item_id',
        });
      }
		}
	);

	return Movie;
};
