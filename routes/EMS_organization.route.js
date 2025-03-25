const express = require('express');
const router = express.Router();
const EMSorganizationController = require('../controllers/EMS_organization.controller');

router.get('/get_all_ems_organizations', EMSorganizationController.getAllOrganizations);
router.get('/get_ems_organization_by_id/:id', EMSorganizationController.getOrganizationById);

module.exports = router;