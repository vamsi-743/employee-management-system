const express = require("express");
const controller = require("../controllers/file.controller");

const router = express.Router();

router.post("/makeorder", controller.makeOrder);
router.post("/checkorder", controller.checkOrder);

module.exports = router;