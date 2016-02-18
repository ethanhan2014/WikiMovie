'use strict';

/**
	* Item Model
	*/

module.exports = function(sequelize, DataTypes) {

	var Item = sequelize.define('Item',
		{
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING(256),
      type: DataTypes.STRING(10),
		},
		{
      // Make the model consistent with our pre-existing schema
      timestamps: false,
      underscored: true,
      freezeTableName: true,

      associate: function(models) {
        Item.hasOne(models.Movie, {
          as: 'Movie',
          timestamps: false,
          foreignKey: 'item_id',
        });

        Item.hasOne(models.Person, {
          as: 'Person',
          timestamps: false,
          foreignKey: 'item_id',
        });

        Item.hasOne(models.Studio, {
          as: 'Studio',
          timestamps: false,
          foreignKey: 'item_id',
        });
      }
		}
	);

	return Item;
};
