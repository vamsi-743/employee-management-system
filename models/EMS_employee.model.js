module.exports = (sequelize, DataTypes) => {
  const EMSemployee = sequelize.define("EMSemployee", {
    EMS_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    EMS_employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_of_joining: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    work_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    annual_ctc: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    personal_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fathers_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_line1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    tableName: "EMS_employees",
    engine: "InnoDB",
    timestamps: false,
  });

  EMSemployee.associate = (models) => {
    EMSemployee.belongsTo(models.EMSorganization, {
      foreignKey: "organization_id",
    });
    EMSemployee.belongsTo(models.EMSdesignation, {
      foreignKey: "designation_id",
    });
    EMSemployee.belongsTo(models.EMSdepartment, { foreignKey: "department_id" });
  };

  // Add composite unique constraint
  EMSemployee.addHook("beforeValidate", (employee, options) => {
    employee.uniqueKeys = {
      uniqueEMSemployee: {
        fields: ["EMS_employee_id", "organization_id"],
      },
    };
  });

  return EMSemployee;
};
