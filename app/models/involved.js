'use strict';

/**
	* A model that captures the "Involved" relation between movies and people.
  * We need to create a model for this (even though its a join table) because
  * there are extra attributes.
	*/

module.exports = function(sequelize, DataTypes) {

	var Involved = sequelize.define('Involved',
		{
      involve_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      movie_id: DataTypes.INTEGER,
      person_id: DataTypes.INTEGER,
      role_name: DataTypes.STRING(300),
      cast_order: DataTypes.INTEGER,
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      // Involved was originally intended as a join table for a Many to Many
      // association between Movies and People. However, a pair (movie, person)
      // can occur more than once, so it needs to be a non-unique many-to-many.
      // Sequelize does not currently handle this (it is bugged), and none of
      // the other ORMs handle this either. See https://github.com/sequelize/sequelize/issues/4742
      // Thus, we model it as two one to many associations.
      associate: function(models) {

        Involved.belongsTo(models.Movie, {
          as: 'InvolvedMovies',
          foreignKey: 'movie_id'
        });

        Involved.belongsTo(models.Person, {
          as: 'InvolvedPeople',
          foreignKey: 'person_id'
        });
      }
		}
	);

	return Involved;
};
