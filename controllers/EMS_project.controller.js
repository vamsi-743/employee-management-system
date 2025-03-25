const connectToDatabase = require("../misc/db");

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const { EMSproject } = await connectToDatabase();
    // only get projects for the organization that the user is in
    const projects = await EMSproject.findAll({ where: { organization_id: req.body.organization_id } });
    res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get project by id
const getProjectById = async (req, res) => {
    try {
        const { EMSproject } = await connectToDatabase();
        const project = await EMSproject.findByPk(req.params.id);
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Create a new project
const createProject = async (req, res) => {
    try {
        const { EMSproject } = await connectToDatabase();
        const project = await EMSproject.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update a project
const updateProject = async (req, res) => {
    try {
        const { EMSproject } = await connectToDatabase();
        const project = await EMSproject.update(req.body, { where: { project_id: req.params.id } });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a project
const deleteProject = async (req, res) => {
    try {
        const { EMSproject } = await connectToDatabase();
        await EMSproject.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
}
