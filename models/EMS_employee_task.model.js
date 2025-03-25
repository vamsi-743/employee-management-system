module.exports = (sequelize, DataTypes) => {
  const EMS_employee_task = sequelize.define(
    "EMS_employee_task",
    {
      employee_task_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      EMS_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      employee_task_status: {
        type: DataTypes.ENUM,
        values: ['not_started', 'in_progress', 'completed'],
        allowNull: true,
      },
      employee_task_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      employee_task_time_spent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "EMS_employee_task",
      engine: "InnoDB",
      timestamps: false,
    }
  );

  EMS_employee_task.associate = (models) => {
    EMS_employee_task.belongsTo(models.EMSemployee, {
      foreignKey: "EMS_employee_id",
    });
    EMS_employee_task.belongsTo(models.EMStasks, {
      foreignKey: "task_id",
    });
  };

  return EMS_employee_task;
};
