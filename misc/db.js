const Sequelize = require("sequelize");

const EMSorganizationModel = require("../models/EMS_organization.model");
const EMSuserModel = require("../models/EMS_users.model");
const EMSemployeeModel = require("../models/EMS_employee.model");
const EMSdepartmentModel = require("../models/EMS_department.model");
const EMSdesignationModel = require("../models/EMS_designation.model");
const EMSprojectModel = require("../models/EMS_projects.model");
const EMStasksModel = require("../models/EMS_tasks.model");
const EMSemployeeTaskModel = require("../models/EMS_employee_task.model");


const sequelize = new Sequelize(
 "employee_task_management",
  "root",
  "ismav.743",
  {
    dialect: "mysql",
    host: "127.0.0.1",
    port: 3306,
    //logging: true,
    logging: false,
  }
);

const EMSorganization = EMSorganizationModel(sequelize, Sequelize);
const EMSusers = EMSuserModel(sequelize, Sequelize);
const EMSemployee = EMSemployeeModel(sequelize, Sequelize);
const EMSdepartment = EMSdepartmentModel(sequelize, Sequelize);
const EMSdesignation = EMSdesignationModel(sequelize, Sequelize);
const EMSproject = EMSprojectModel(sequelize, Sequelize);
const EMStasks = EMStasksModel(sequelize, Sequelize);
const EMSemployeeTask = EMSemployeeTaskModel(sequelize, Sequelize);


const Models = {
  EMSorganization,
  EMSusers,
  EMSemployee,
  EMSdepartment,
  EMSdesignation,
  EMSproject,
  EMStasks,
  EMSemployeeTask,
};

// Define associations
Object.keys(Models).forEach((modelName) => {
  if (Models[modelName].associate) {
    Models[modelName].associate(Models);
  }
});

// Employee associations
// Employee.belongsTo(Organization, { foreignKey: "organization_id" });
// Employee.belongsTo(Designation, { foreignKey: "designation_id" });
// Employee.belongsTo(Department, { foreignKey: "department_id" });

// Organization.hasMany(Employee, { foreignKey: "organization_id" });
// Designation.hasMany(Employee, { foreignKey: "designation_id" });
// Department.hasMany(Employee, { foreignKey: "department_id" });

EMSemployee.belongsTo(EMSdepartment, { foreignKey: "department_id" });
EMSdepartment.hasMany(EMSemployee, { foreignKey: "department_id" });

EMSemployee.belongsTo(EMSdesignation, { foreignKey: "designation_id" });
EMSdesignation.hasMany(EMSemployee, { foreignKey: "designation_id" });

EMSemployee.belongsTo(EMSorganization, { foreignKey: "organization_id" });
EMSorganization.hasMany(EMSemployee, { foreignKey: "organization_id" });

EMSproject.belongsTo(EMSorganization, { foreignKey: "organization_id" });
EMSorganization.hasMany(EMSproject, { foreignKey: "organization_id" });

EMStasks.belongsTo(EMSproject, { foreignKey: "project_id" });
EMSproject.hasMany(EMStasks, { foreignKey: "project_id" });

// EMStasks.belongsTo(EMSemployee, { foreignKey: 'EMS_employee_id' });

EMSemployeeTask.belongsTo(EMSemployee, { foreignKey: "EMS_employee_id" });
EMSemployee.hasMany(EMSemployeeTask, { foreignKey: "EMS_employee_id" });

EMSemployeeTask.belongsTo(EMStasks, { foreignKey: "task_id" });
EMStasks.hasMany(EMSemployeeTask, { foreignKey: "task_id" });

EMStasks.belongsTo(EMSproject, { foreignKey: "project_id" });
EMSproject.hasMany(EMStasks, { foreignKey: "project_id" });

EMSproject.hasMany(EMStasks, { foreignKey: "project_id" });
EMStasks.belongsTo(EMSproject, { foreignKey: "project_id" });

EMSemployeeTask.belongsTo(EMSemployee, { foreignKey: "EMS_employee_id" });
EMSemployeeTask.belongsTo(EMStasks, { foreignKey: "task_id" });
EMStasks.hasMany(EMSemployeeTask, { foreignKey: "task_id" });

const connection = {};

module.exports = async () => {
  try {
    if (connection.isConnected) {
      console.log("=> Using existing connection.");
      return { sequelize, ...Models };
    }

    await sequelize.sync();
    await sequelize.authenticate();
    connection.isConnected = true;
    console.log("=>Created a new connection.");
    return { sequelize, ...Models };
  } catch (error) {
    console.log("Error while connecting to database", error);
    return error;
  }
};


