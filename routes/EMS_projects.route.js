const express = require('express');
const router = express.Router();
const { getAllProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/EMS_project.controller');

router.post('/ems_projects', getAllProjects);
router.get('/ems_projects/:id', getProjectById);
router.post('/create_ems_project', createProject);
router.put('/update_ems_project/:id', updateProject);
router.delete('/delete_ems_project/:id', deleteProject);

module.exports = router;