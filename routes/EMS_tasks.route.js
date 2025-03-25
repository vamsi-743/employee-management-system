const express = require('express');
const router = express.Router();
const {getAllTasks, getTaskById, createTask, updateTask, deleteTask, getTaskDetails, updateEmployeeTaskStatus} = require('../controllers/EMS_task.controller');

router.post('/get_all_ems_tasks', getAllTasks);
router.get('/get_ems_tasks_by_id/:id', getTaskById);
router.post('/create_ems_tasks', createTask);
router.put('/update_ems_tasks/:id', updateTask);
router.delete('/delete_ems_tasks/:id', deleteTask);
router.post('/update_employee_task_status', updateEmployeeTaskStatus);
// router.get('/get_task_details/:id', getTaskDetails);

module.exports = router;
