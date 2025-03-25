const connectToDatabase = require("../misc/db");

// get all organizations
const getAllOrganizations = async (req, res) => {
    try {
        const { EMSorganization } = await connectToDatabase();
        const organizations = await EMSorganization.findAll();
        res.status(200).json(organizations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get organization by id
const getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;
        const { EMSorganization } = await connectToDatabase();
        const organization = await EMSorganization.findByPk(id);
        res.status(200).json(organization);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllOrganizations,
    getOrganizationById
}