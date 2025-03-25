module.exports = (sequelize, DataTypes) => {
  const EMS_tasks = sequelize.define(
    "EMS_tasks",
    {
      task_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "in_progress", "completed"],
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM,
        values: ["low", "medium", "high"],
        allowNull: false,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "EMS_tasks",
      engine: "InnoDB",
      timestamps: false,
    }
  );

  EMS_tasks.associate = (models) => {
    EMS_tasks.belongsTo(models.EMSproject, {
      foreignKey: "project_id",
    });
    EMS_tasks.hasMany(models.EMSemployeeTask, {
      foreignKey: "task_id",
    });
  };

  return EMS_tasks;
};
