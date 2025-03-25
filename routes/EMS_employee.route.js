const express = require("express");
const controller = require("../controllers/EMS_employee.controller");
const router = express.Router();

router.post("/get_all_ems_employees", controller.getEmployees);
router.post("/get_ems_employee_by_id/:employee_id", controller.getEmployeeById);
router.post("/create_ems_employee", controller.createEmployee);
router.get("/get_recent_ems_employees", controller.getRecentEmployees);
router.post("/ems_dashboard", controller.getDashboard);
router.put("/update_ems_employee/:employee_id", controller.updateEmployee);
router.post("/get_ems_employee_id_list", controller.getEmployeeIdList);
router.post("/create_bulk_ems_employees", controller.createBulkEmployees);
router.put(
  "/handle_ems_employee_status/:employee_id",
  controller.handleEmployeeStatus
);
router.post(
  "/get_disactive_ems_employee_list",
  controller.getDisactiveEmployeeList
);
router.delete("/delete_ems_employee/:employee_id", controller.deleteEmployee);
router.post("/ems_employee_login", controller.EMSemployeeLogin);
router.post("/get_ems_employee_tasks_list", controller.getEmployeeTasksList);
router.post("/update_ems_employee_task_status", controller.updateTaskStatus);
module.exports = router;
