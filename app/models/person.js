'use strict';

/**
	* Person Model
	*/

module.exports = function(sequelize, DataTypes) {

	var Person = sequelize.define('Person',
		{
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
			name: DataTypes.STRING,
      image_url: DataTypes.STRING(200),
      birth_date: DataTypes.DATEONLY,
      death_date: DataTypes.DATEONLY,
      biography: DataTypes.STRING(5000),
      tmdb_id: DataTypes.INTEGER,
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      // Need to associate person as being involved in movies.
      // For whatever reason, "as" binds with Movie while foreignKey binds
      // with Person.
      associate: function(models) {

        // This is a one to many association, see Involved for more details.
        Person.hasMany(models.Involved, {
          as: 'Involvements',
          foreignKey: 'person_id'
        });

        Person.belongsTo(models.Item, {
          as: 'Item',
          timestamps: false,
          foreignKey: 'item_id',
        });
      }
		}
	);

	return Person;
};
