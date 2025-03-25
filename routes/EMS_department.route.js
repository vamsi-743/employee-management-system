const express = require('express');
const router = express.Router();
const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/EMS_department.controller');

router.post('/get_all_ems_departments', getAllDepartments);
router.get('/get_ems_department_by_id/:id', getDepartmentById);
router.post('/create_ems_department', createDepartment);
router.put('/update_ems_department/:id', updateDepartment);
router.delete('/delete_ems_department/:id', deleteDepartment);

module.exports = router;

