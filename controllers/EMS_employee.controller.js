const connectToDatabase = require("../misc/db");
// const { QueryTypes } = require("sequelize");
const { Op } = require("sequelize");

// Get all employees
async function getEmployees(req, res) {
  try {
    const { EMSemployee, EMSdesignation, EMSdepartment } =
      await connectToDatabase();
    const organization_id = req.body.organization_id;

    const new_employee = await EMSemployee.findAll({
      where: {
        organization_id: organization_id,
        status: 1,
      },
      include: [
        {
          model: EMSdesignation,
          attributes: ["designation_name"],
        },
        {
          model: EMSdepartment,
          attributes: ["department_name"],
        },
      ],
    });

    const formattedEmployees = await Promise.all(
      new_employee.map(async (employee) => {
        const { EMS_designation, EMS_department, ...employeeData } =
          employee.toJSON();

        return {
          ...employeeData,
          designation_name: EMS_designation?.designation_name || null, // Update with correct value
          department_name: EMS_department?.department_name || null, // Update with correct value
        };
      })
    );

    return res.status(200).json(formattedEmployees);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

//create employee
async function createEmployee(req, res) {
  const transaction = await connectToDatabase().transaction();
  try {
    const { EMSemployee, EMSdesignation, EMSdepartment } =
      await connectToDatabase();

    // Check if the employee already exists within the organization
    const existingEmployee = await EMSemployee.findOne({
      where: {
        EMS_employee_id: req.body.EMS_employee_id,
        organization_id: req.body.organization_id,
      },
      transaction,
    });

    if (existingEmployee) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Employee already exists within the organization",
      });
    }

    //  check if the same designation & same organization employee then update total_employees values on designation table
    const designation = await EMSdesignation.findOne({
      where: {
        designation_id: req.body.designation_id,
        organization_id: req.body.organization_id,
      },
      transaction,
    });
    if (designation) {
      await designation.update(
        {
          designation_total_employees:
            designation.designation_total_employees + 1,
        },
        { transaction }
      );
    }

    //  check if the same department & same organization employee then update total_employees values on department table
    const department = await EMSdepartment.findOne({
      where: {
        department_id: req.body.department_id,
        organization_id: req.body.organization_id,
      },
      transaction,
    });
    if (department) {
      await department.update(
        {
          department_total_employees: department.department_total_employees + 1,
        },
        { transaction }
      );
    }

    // create employee
    const employee = await EMSemployee.create(req.body, { transaction });
    await transaction.commit();
    return res.status(200).json(employee);
  } catch (error) {
    await transaction.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: error.message,
        message: "Employee id already exists within the organization",
        EMS_employee_id: req.body.EMS_employee_id,
      });
    }
    return res.status(500).json({ error: error.message });
  }
}

//get employee by id
async function getEmployeeById(req, res) {
  try {
    const {
      EMSemployee,
      EMSdesignation,
      EMSdepartment,
      EMSemployeeTask,
      EMStasks,
      EMSproject,
    } = await connectToDatabase();
    console.log(req.params.employee_id);
    const employee = await EMSemployee.findOne({
      where: {
        EMS_employee_id: req.params.employee_id,
        organization_id: req.body.organization_id,
      },
      include: [
        {
          model: EMSdesignation,
          attributes: ["designation_name"],
        },
        {
          model: EMSdepartment,
          attributes: ["department_name"],
        },
      ],
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const { EMS_designation, EMS_department, ...employeeData } =
      employee.toJSON();
    const formattedEmployee = {
      ...employeeData,
      designation_name: EMS_designation
        ? EMS_designation.designation_name
        : null,
      department_name: EMS_department ? EMS_department.department_name : null,
    };

    // Get tasks assigned to the employee
    const tasks = await EMSemployeeTask.findAll({
      where: { EMS_employee_id: req.params.employee_id },
      include: [
        {
          model: EMStasks,
          attributes: [
            "title",
            "description",
            "status",
            "priority",
            "due_date",
          ],
          include: [
            {
              model: EMSproject,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    const formattedTasks = tasks.map((task) => {
      const taskData = task.toJSON();
      return {
        employee_task_id: taskData.employee_task_id,
        EMS_employee_id: taskData.EMS_employee_id,
        task_id: taskData.task_id,
        assigned_at: taskData.assigned_at,
        employee_task_status: taskData.employee_task_status,
        task_title: taskData.EMS_task.title,
        task_description: taskData.EMS_task.description,
        task_priority: taskData.EMS_task.priority,
        task_due_date: taskData.EMS_task.due_date,
        project_name: taskData.EMS_task.EMS_project.name,
      };
    });

    // Add tasks to the employee data
    formattedEmployee.tasks = formattedTasks;

    return res.status(200).json(formattedEmployee);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// get recently add 5 employees
async function getRecentEmployees(req, res) {
  try {
    const { EMSemployee } = await connectToDatabase();
    const employees = await EMSemployee.findAll({
      order: [["id", "DESC"]],
      limit: 5,
    });
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Dashboard
async function getDashboard(req, res) {
  try {
    const { EMSemployee, EMSdesignation, EMSdepartment, EMSproject, EMStasks } =
      await connectToDatabase();
    const organization_id = req.body.organization_id;

    // total employee on organization
    const employees = await EMSemployee.findAll({
      where: { organization_id },
    });
    const total_employees = employees.length;

    // Recently added employees
    const recently_added = await EMSemployee.findAll({
      where: { organization_id: organization_id, status: 1 },
      order: [["EMS_id", "DESC"]],
      limit: 5,
    });

    // active employees count
    const active_employees = await EMSemployee.count({
      where: { organization_id, status: 1 },
    });

    // inactive employees count
    const inactive_employees = await EMSemployee.count({
      where: { organization_id, status: 0 },
    });

    // gender wise employee count
    const male_employees = await EMSemployee.count({
      where: { organization_id, gender: "male", status: 1 },
    });
    const female_employees = await EMSemployee.count({
      where: { organization_id, gender: "female", status: 1 },
    });
    const other_employees = await EMSemployee.count({
      where: { organization_id, gender: "other", status: 1 },
    });

    // total project on organization
    const total_projects = await EMSproject.count({
      where: { organization_id },
    });

    // total task on organization
    const total_tasks = await EMStasks.count({
      include: [
        {
          model: EMSproject,
          where: { organization_id },
        },
      ],
    });

    // completed task on organization
    const completed_tasks = await EMStasks.count({
      include: [
        {
          model: EMSproject,
          where: { organization_id },
        },
      ],
      where: { status: "completed" },
    });

    // pending task on organization
    const pending_tasks = await EMStasks.count({
      include: [
        {
          model: EMSproject,
          where: { organization_id },
        },
      ],
      where: { status: "pending" },
    });

    // in_progress task on organization
    const in_progress_tasks = await EMStasks.count({
      include: [
        {
          model: EMSproject,
          where: { organization_id },
        },
      ],
      where: { status: "in_progress" },
    });

    const gender_wise_employee = {
      male_employees,
      female_employees,
      other_employees,
    };

    return res.status(200).json({
      total_employees,
      recently_added,
      active_employees,
      inactive_employees,
      gender_wise_employee,
      total_projects,
      total_tasks,
      completed_tasks,
      pending_tasks,
      in_progress_tasks,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// update employee
async function updateEmployee(req, res) {
  const transaction = await connectToDatabase().transaction();
  try {
    const { EMSemployee, EMSdesignation, EMSdepartment } =
      await connectToDatabase();

    // Find the current employee details
    const currentEmployee = await EMSemployee.findOne({
      where: { EMS_employee_id: req.params.employee_id },
      transaction,
    });

    if (!currentEmployee) {
      await transaction.rollback();
      return res.status(404).json({ error: "Employee not found" });
    }

    // Check if designation or department is changing
    const isDesignationChanging =
      req.body.designation_id &&
      req.body.designation_id !== currentEmployee.designation_id;
    const isDepartmentChanging =
      req.body.department_id &&
      req.body.department_id !== currentEmployee.department_id;

    // Update the employee details
    const [updatedRows] = await EMSemployee.update(req.body, {
      where: { EMS_employee_id: req.params.employee_id },
      transaction,
    });

    if (updatedRows === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "No rows updated" });
    }

    // If designation is changing, update the counts
    if (isDesignationChanging) {
      // Decrease the count in the previous designation
      if (currentEmployee.designation_id) {
        const previousDesignation = await EMSdesignation.findOne({
          where: { designation_id: currentEmployee.designation_id },
          transaction,
        });
        if (previousDesignation) {
          await previousDesignation.update(
            {
              designation_total_employees:
                previousDesignation.designation_total_employees - 1,
            },
            { transaction }
          );
        }
      }

      // Increase the count in the new designation
      const newDesignation = await EMSdesignation.findOne({
        where: { designation_id: req.body.designation_id },
        transaction,
      });
      if (newDesignation) {
        await newDesignation.update(
          {
            designation_total_employees:
              newDesignation.designation_total_employees + 1,
          },
          { transaction }
        );
      }
    }

    // If department is changing, update the counts
    if (isDepartmentChanging) {
      // Decrease the count in the previous department
      if (currentEmployee.department_id) {
        const previousDepartment = await EMSdepartment.findOne({
          where: { department_id: currentEmployee.department_id },
          transaction,
        });
        if (previousDepartment) {
          await previousDepartment.update(
            {
              department_total_employees:
                previousDepartment.department_total_employees - 1,
            },
            { transaction }
          );
        }
      }

      // Increase the count in the new department
      const newDepartment = await EMSdepartment.findOne({
        where: { department_id: req.body.department_id },
        transaction,
      });
      if (newDepartment) {
        await newDepartment.update(
          {
            department_total_employees:
              newDepartment.department_total_employees + 1,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    return res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ error: error.message });
  }
}

// get employee id list
async function getEmployeeIdList(req, res) {
  try {
    const { EMSemployee } = await connectToDatabase();
    const employees = await EMSemployee.findAll({
      attributes: ["EMS_employee_id"],
    });
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// create bulk employees
async function createBulkEmployees(req, res) {
  const transaction = await connectToDatabase().transaction();
  try {
    const { EMSemployee, EMSdesignation, EMSdepartment, EMSorganization } =
      await connectToDatabase();
    const employees = req.body;
    const newEmployees = [];

    for (const emp of employees) {
      // check organization_id on EMS_organization table
      const organization = await EMSorganization.findOne({
        where: { organization_id: emp.organization_id },
        transaction,
      });
      if (!organization) {
        return res
          .status(404)
          .json({ error: `Organization ${emp.organization_id} is not found` });
      }
      const existingEmployee = await EMSemployee.findOne({
        where: { EMS_employee_id: emp.EMS_employee_id },
        transaction,
      });
      if (!existingEmployee) {
        // Check and create designation if it doesn't exist
        let designation = await EMSdesignation.findOne({
          where: {
            designation_name: emp.designation_name,
            organization_id: emp.organization_id,
          },
          transaction,
        });
        if (!designation) {
          designation = await EMSdesignation.create(
            {
              designation_name: emp.designation_name,
              organization_id: emp.organization_id,
              designation_description: emp.designation_description,
              designation_total_employees: 1,
            },
            { transaction }
          );
        } else {
          await designation.update(
            {
              designation_total_employees:
                designation.designation_total_employees + 1,
            },
            { transaction }
          );
        }

        // Check and create department if it doesn't exist
        let department = await EMSdepartment.findOne({
          where: {
            department_name: emp.department_name,
            organization_id: emp.organization_id,
          },
          transaction,
        });
        if (!department) {
          department = await EMSdepartment.create(
            {
              department_name: emp.department_name,
              organization_id: emp.organization_id,
              department_description: emp.department_description,
              department_total_employees: 1,
            },
            { transaction }
          );
        } else {
          await department.update(
            {
              department_total_employees:
                department.department_total_employees + 1,
            },
            { transaction }
          );
        }

        // check if the employee already exists within the organization
        const existingEmployee = await EMSemployee.findOne({
          where: {
            EMS_employee_id: emp.EMS_employee_id,
            organization_id: emp.organization_id,
          },
          transaction,
        });

        if (existingEmployee) {
          await transaction.rollback();
          return res.status(400).json({
            error: "Employee already exists within the organization",
          });
        }

        // Create the employee
        const newEmployee = await EMSemployee.create(
          {
            ...emp,
            designation_id: designation.designation_id,
            department_id: department.department_id,
          },
          { transaction }
        );

        newEmployees.push(newEmployee);
      }
    }
    await transaction.commit();
    return res.status(200).json(newEmployees);
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
}

// handle employee status
async function handleEmployeeStatus(req, res) {
  try {
    const { EMSemployee } = await connectToDatabase();
    const employee_id = req.params.employee_id;
    await EMSemployee.update(
      {
        status: req.body.status,
      },
      {
        where: { employee_id: employee_id },
      }
    );
    return res.status(200).json({
      message: `Employee status ${
        req.body.status == 1 ? "active" : "inactive"
      } updated successfully`,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// get disactive employee list
async function getDisactiveEmployeeList(req, res) {
  try {
    const { EMSemployee } = await connectToDatabase();
    const employees = await EMSemployee.findAll({
      where: { status: 0 },
    });
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// permanent delete employee
async function deleteEmployee(req, res) {
  try {
    const { EMSemployee, EMSsalary, EMSloan } = await connectToDatabase();
    const employee_id = req.params.employee_id;
    // delete salary history on employee_id
    await EMSsalary.destroy({
      where: { employee_id: employee_id },
    });
    // delete loan history on employee_id
    await EMSloan.destroy({
      where: { employee_id: employee_id },
    });
    // delete employee
    await EMSemployee.destroy({
      where: { employee_id: employee_id },
    });
    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// EMS employee login
async function EMSemployeeLogin(req, res) {
  try {
    const { EMSemployee } = await connectToDatabase();
    const employee = await EMSemployee.findOne({
      where: { employee_id: req.body.employee_id, password: req.body.password },
    });
    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found or wrong password" });
    }
    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// list of assigned tasks in employee by employee_id
async function getEmployeeTasksList(req, res) {
  try {
    const { EMSemployee, EMStasks, EMSproject, EMSemployeeTask } =
      await connectToDatabase();
    const employee_id = req.body.employee_id;
    const tasks = await EMSemployeeTask.findAll({
      where: { EMS_employee_id: employee_id },
      include: [
        {
          model: EMStasks,
          attributes: [
            "title",
            "description",
            "status",
            "priority",
            "due_date",
          ],
          include: [
            {
              model: EMSproject,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    const formattedTasks = tasks.map((task) => {
      const taskData = task.toJSON();
      return {
        employee_task_id: taskData.employee_task_id,
        EMS_employee_id: taskData.EMS_employee_id,
        task_id: taskData.task_id,
        assigned_at: taskData.assigned_at,
        employee_task_status: taskData.employee_task_status,
        task_title: taskData.EMS_task.title,
        task_description: taskData.EMS_task.description,
        task_priority: taskData.EMS_task.priority,
        task_due_date: taskData.EMS_task.due_date,
        project_name: taskData.EMS_task.EMS_project.name,
      };
    });

    return res.status(200).json(formattedTasks);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// update task status
async function updateTaskStatus(req, res) {
  try {
    const { EMSemployeeTask, EMStasks } = await connectToDatabase();
    const {
      employee_task_id,
      task_id,
      employee_task_status,
      EMS_employee_id,
      employee_task_description,
      employee_task_time_spent,
    } = req.body;
    console.log(req.body);

    // Update the status of the employee task
    await EMSemployeeTask.update(
      {
        employee_task_status: employee_task_status,
        employee_task_description: employee_task_description,
        employee_task_time_spent: employee_task_time_spent,
      },
      {
        where: {
          employee_task_id: employee_task_id,
          EMS_employee_id: EMS_employee_id,
        },
      }
    );

    // update task status if employee_task_status is in_progress
    if (employee_task_status === "in_progress") {
      // check status on EMS_task table
      const task = await EMStasks.findOne({
        where: { task_id: task_id },
      });
      if (task.status !== "in_progress") {
        await task.update({
          status: "in_progress",
        });
      }
    }

    // Check if all employees assigned to the same task have completed it
    const employeeTask = await EMSemployeeTask.findOne({
      where: { task_id: task_id },
    });

    if (employeeTask) {
      const task_id = employeeTask.task_id;
      const incompleteTasks = await EMSemployeeTask.count({
        where: {
          task_id: task_id,
          employee_task_status: { [Op.ne]: "completed" },
        },
      });

      if (incompleteTasks === 0) {
        // All employees have completed the task, update the task status
        await EMStasks.update(
          { status: "completed" },
          { where: { task_id: task_id } }
        );
      }
    }

    return res
      .status(200)
      .json({ message: "Task status updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  getRecentEmployees,
  getDashboard,
  updateEmployee,
  getEmployeeIdList,
  createBulkEmployees,
  handleEmployeeStatus,
  getDisactiveEmployeeList,
  deleteEmployee,
  EMSemployeeLogin,
  getEmployeeTasksList,
  updateTaskStatus,
};
