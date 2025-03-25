const express = require("express");
const router = express.Router();
const controller = require("../controllers/EMS_designation.controller");

router.post("/create_ems_designation", controller.createDesignation);
router.post("/get_all_ems_designations", controller.getAllDesignations);
router.get("/get_ems_designation_by_id/:id", controller.getDesignationById);
router.put("/update_ems_designation/:id", controller.updateDesignation);
router.delete("/delete_ems_designation/:id", controller.deleteDesignation);

module.exports = router;
