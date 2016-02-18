'use strict';

/**
	* A model that captures the "Tag_Belongs" relation between movies and tags.
  * We need to create a model for this (even though its a join table) because
  * there are extra attributes.
	*/

module.exports = function(sequelize, DataTypes) {

	var Tag_Belongs = sequelize.define('Tag_Belongs',
		{
      relevance: DataTypes.FLOAT,
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      associate: function (models) {

        // Although this is a join table, this is useful for browsing tags.
        Tag_Belongs.belongsTo(models.Movie, {
          foreignKey: 'movie_id'
        });

        Tag_Belongs.belongsTo(models.Tag, {
          foreignKey: 'tag_id'
        });
      },
		}
	);

	return Tag_Belongs;
};
