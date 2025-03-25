const connectToDatabase = require("../misc/db");

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const { EMSdepartment } = await connectToDatabase();
    // only get request organization_id is required
    const organization_id = req.body.organization_id;
    const departments = await EMSdepartment.findAll({ where: { organization_id: organization_id } });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { EMSdepartment } = await connectToDatabase();
    const department = await EMSdepartment.findByPk(req.params.id);
    if (department) {
      res.status(200).json(department);
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { EMSdepartment } = await connectToDatabase();
    const newDepartment = await EMSdepartment.create(req.body);
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { EMSdepartment } = await connectToDatabase();
    const department = await EMSdepartment.findByPk(req.params.id);
    if (department) {
      await department.update(req.body);
      res.status(200).json(department);
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const { EMSdepartment } = await connectToDatabase();
    const department = await EMSdepartment.findByPk(req.params.id);
    if (department) {
      await department.destroy();
      res.status(200).json({ message: "Department deleted successfully" });
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
