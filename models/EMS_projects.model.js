module.exports = (sequelize, DataTypes) => {
  const EMS_project = sequelize.define(
    "EMS_project",
    {
      project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "EMS_project",
      engine: "InnoDB",
      timestamps: false,
    }
  );

  EMS_project.associate = (models) => {
    EMS_project.belongsTo(models.EMSorganization, {
      foreignKey: "organization_id",
    });
  };

  return EMS_project;
};
