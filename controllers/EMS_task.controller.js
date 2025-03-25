const connectToDatabase = require("../misc/db");
const { QueryTypes } = require("sequelize");

// get all tasks
async function getAllTasks(req, res) {
  try {
    const { EMStasks, EMSproject } = await connectToDatabase();
    const organization_id = req.body.organization_id;

    const tasks = await EMStasks.findAll({
      include: [
        {
          model: EMSproject,
          attributes: ["name"],
          where: { organization_id: organization_id },
        },
      ],
    });

    const formattedTasks = tasks.map((task) => {
      const taskData = task.toJSON();
      return {
        task_id: taskData.task_id,
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.due_date,
        status: taskData.status,
        priority: taskData.priority,
        project_id: taskData.project_id,
        project_name: taskData.EMS_project.name,
      };
    });

    res.status(200).json(formattedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// get task by id
async function getTaskById(req, res) {
  try {
    const { EMStasks } = await connectToDatabase();
    const query = `SELECT 
    EMS_tasks.task_id,
    EMS_tasks.title,
    EMS_tasks.description,
    EMS_tasks.due_date,
    EMS_tasks.status,
    EMS_tasks.priority,
    EMS_tasks.project_id,
    EMS_project.name as project_name,
    EMS_employees.first_name as employee_name,
    EMS_employees.EMS_employee_id as employee_id,
    EMS_employee_task.employee_task_status,
    EMS_employee_task.employee_task_description,
    EMS_employee_task.employee_task_time_spent
    FROM EMS_tasks 
    LEFT JOIN EMS_employee_task ON EMS_tasks.task_id = EMS_employee_task.task_id
    LEFT JOIN EMS_employees ON EMS_employee_task.EMS_employee_id = EMS_employees.EMS_employee_id
    LEFT JOIN EMS_project ON EMS_tasks.project_id = EMS_project.project_id
    WHERE EMS_tasks.task_id = ${req.params.id}`;

    const task = await EMStasks.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!task.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Group employee names by task
    const taskDetails = task.reduce((acc, curr) => {
      if (!acc.task_id) {
        acc = {
          task_id: curr.task_id,
          title: curr.title,
          description: curr.description,
          due_date: curr.due_date,
          status: curr.status,
          priority: curr.priority,
          project_id: curr.project_id,
          project_name: curr.project_name,
          employee_list: [],
        };
      }
      acc.employee_list.push({
        employee_name: curr.employee_name,
        employee_id: curr.employee_id,
        employee_task_status: curr.employee_task_status,
        employee_task_description: curr.employee_task_description,
        employee_task_time_spent: curr.employee_task_time_spent,
      });
      return acc;
    }, {});

    res.status(200).json(taskDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// create task and assign to employee on employee task table
async function createTask(req, res) {
  try {
    const { EMStasks, EMSemployeeTask } = await connectToDatabase();
    const task = await EMStasks.create(req.body);
    console.log(req.body);

    const { assigned_to } = req.body;

    // Assign task to employee on employee task table
    await Promise.all(
      assigned_to.map(async (employeeId) => {
        console.log(employeeId);
        await EMSemployeeTask.create({
          task_id: task.task_id,
          EMS_employee_id: employeeId,
        });
      })
    );

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// update task
async function updateTask(req, res) {
  try {
    const { EMStasks, EMSemployeeTask } = await connectToDatabase();
    const task = await EMStasks.findOne({ where: { task_id: req.params.id } });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
    }
    await task.update(req.body);

    // get previous employee_id's from EMS_employee_task table with same task_id
    const previousEmployeeTasks = await EMSemployeeTask.findAll({
      where: { task_id: req.params.id },
    });
    const previousEmployeeIds = previousEmployeeTasks.map(
      (employeeTask) => employeeTask.EMS_employee_id
    );
    console.log(previousEmployeeIds);

    previousEmployeeIds.forEach(async (employeeId) => {
      if (!req.body.assigned_to.includes(employeeId)) {
        await EMSemployeeTask.destroy({
          where: { task_id: req.params.id, EMS_employee_id: employeeId },
        });
      }
    });

    // assign new employee_id to EMS_employee_task table
    await Promise.all(
      req.body.assigned_to.map(async (employeeId) => {
        // check if employee_id already exists in EMS_employee_task table with same task_id
        const employeeTask = await EMSemployeeTask.findOne({
          where: { task_id: req.params.id, EMS_employee_id: employeeId },
        });
        if (!employeeTask) {
          await EMSemployeeTask.create({
            task_id: req.params.id,
            EMS_employee_id: employeeId,
          });
        }
      })
    );
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// delete task
async function deleteTask(req, res) {
  try {
    const { EMStasks, EMSemployeeTask } = await connectToDatabase();
    const task = await EMStasks.findByPk(req.params.id);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
    }
    await EMSemployeeTask.destroy({ where: { task_id: req.params.id } });
    await task.destroy();
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update task status for an employee
async function updateEmployeeTaskStatus(req, res) {
  try {
    const { EMSemployeeTask, EMStasks } = await connectToDatabase();
    const { employee_task_id, employee_task_status, EMS_employee_id } =
      req.body;

    // Update the status in the EMS_employee_task table
    const employeeTask = await EMSemployeeTask.findByPk(employee_task_id);
    if (!employeeTask) {
      return res.status(404).json({ error: "Employee task not found" });
    }

    await employeeTask.update({ employee_task_status });

    // Check if the task status needs to be updated in the EMS_tasks table
    if (employee_task_status === "in_progress") {
      const task = await EMStasks.findByPk(employeeTask.task_id);
      if (task.status === "pending") {
        await task.update({ status: "in_progress" });
      }
    }

    // Check if all employees have completed the task
    if (employee_task_status === "completed") {
      const task = await EMStasks.findByPk(employeeTask.task_id);
      const employeeTasks = await EMSemployeeTask.findAll({
        where: { task_id: employeeTask.task_id },
      });

      const allCompleted = employeeTasks.every(
        (et) => et.employee_task_status === "completed"
      );
      if (allCompleted) {
        await task.update({ status: "completed" });
      }
    }

    res.status(200).json({ message: "Task status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateEmployeeTaskStatus,
  // getTaskDetails,
};
