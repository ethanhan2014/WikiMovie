'use strict';

/**
	* Tag Model
	*/

module.exports = function(sequelize, DataTypes) {

	var Tag = sequelize.define('Tag',
		{
      tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tag: DataTypes.STRING(100),
      gen_count: DataTypes.INTEGER,
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,

      // Need to associate tags being associated with movies.
      // For whatever reason, "as" binds with Movie while foreignKey binds
      // with Tag. Be very careful.
      associate: function(models) {
        Tag.belongsToMany(models.Movie, {
          as: 'Tagged',
          through: models.Tag_Belongs,
          foreignKey: 'tag_id',
          timestamps: false,
        });
      }
		}
	);

	return Tag;
};
