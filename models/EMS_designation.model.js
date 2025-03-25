module.exports = (sequelize, DataTypes) => {
  const EMS_designation = sequelize.define(
    "EMS_designation",
    {
      designation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      designation_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      designation_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "EMS_designation",
      engine: "InnoDB",
      timestamps: false,
    }
  );

  EMS_designation.associate = (models) => {
    EMS_designation.hasMany(models.EMSemployee, {
      foreignKey: "designation_id",
    });
  };

  return EMS_designation;
};
