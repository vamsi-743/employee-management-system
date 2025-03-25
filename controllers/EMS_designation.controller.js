const connectToDatabase = require("../misc/db");

// Get all designations
const getAllDesignations = async (req, res) => {
  try {
    const { EMSdesignation } = await connectToDatabase();
    // only get request organization_id is required
    const organization_id = req.body.organization_id;
    const designations = await EMSdesignation.findAll({ where: { organization_id: organization_id } });
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get designation by ID
const getDesignationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { EMSdesignation } = await connectToDatabase();
    const designation = await EMSdesignation.findByPk(id);
    if (designation) {
      res.status(200).json(designation);
    } else {
      res.status(404).json({ message: 'Designation not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new designation
const createDesignation = async (req, res) => {
  try {
    const { designation_name, designation_description, organization_id } = req.body;
    const { EMSdesignation } = await connectToDatabase();
    const newDesignation = await EMSdesignation.create({
      designation_name,
      designation_description,
      organization_id
    });
    res.status(201).json(newDesignation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a designation
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { designation_name, designation_description, organization_id } = req.body;
    const { EMSdesignation } = await connectToDatabase();
    const updatedDesignation = await EMSdesignation.update({
      designation_name,
      designation_description,
      organization_id
    }, { where: { designation_id: id } });
    if (updatedDesignation[0] === 1) {
      res.status(200).json({ message: 'Designation updated successfully' });
    } else {
      res.status(404).json({ message: 'Designation not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a designation
const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { EMSdesignation } = await connectToDatabase();
    const deletedDesignation = await EMSdesignation.destroy({ where: { designation_id: id } });
    if (deletedDesignation === 1) {
      res.status(200).json({ message: 'Designation deleted successfully' });
    } else {
      res.status(404).json({ message: 'Designation not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
    getAllDesignations,
    getDesignationById,
    createDesignation,
    updateDesignation,
    deleteDesignation
};