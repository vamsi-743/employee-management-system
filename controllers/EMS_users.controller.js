const { query } = require('express');
const connectToDatabase = require('../misc/db');
const { jwtTokens } = require('../middleware/authorization');
const { Op } = require('sequelize');

// signup user
async function signupUser(req, res) {
    try {
        const { EMSusers, EMSorganization } = await connectToDatabase();
        let organization_id;
        // check if user already exists 
        const user = await EMSusers.findOne({
            where: { email: req.body.email },
        });
        if (user) return res.status(400).json({ error: 'User email already exists' });
        // organization name is added to organization table and also organization name is not add multiple times 
        const organization = await EMSorganization.findOne({
            where: { organization_name: req.body.organization_name },
        });
        // if organization name is there then get the organization id else create a new organization
        if (organization) {
            organization_id = organization.organization_id;
        } else {
            const newOrganization = await EMSorganization.create({
                organization_name: req.body.organization_name,
                organization_address: req.body.organization_address,
            });
            organization_id = newOrganization.organization_id;
        } 
        // organization id is added to the user table
        const newUser = await EMSusers.create({
            ...req.body,    
            organization_id: organization_id,
            user_role: req.body.user_role,
        });
        return res.status(200).json(newUser);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
}

// get all users
async function getUsers(req, res) {
    try {
        const { EMSusers, EMSorganization } = await connectToDatabase();
        // organization name is get from organization table and added to the user table
        // users get only same login user organization users
        const users = await EMSusers.findAll({
            include: [{
                model: EMSorganization,
                attributes: ['organization_name'],
            }],
            where: {
                organization_id: req.body.organization_id,
            },
        });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// get user by id
async function getUserById(req, res) {
    try {
        const { EMSusers } = await connectToDatabase();
        const user = await EMSusers.findOne({
            where: { id: req.params.id },
        });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// update user
async function updateUser(req, res) {
    try {
        const { EMSusers } = await connectToDatabase();
        
        // Check if the email is being updated
        if (req.body.email) {
            // Find if any other user (with a different user_id) has the same email
                const userEmail = await EMSusers.findOne({
                where: {
                    email: req.body.email, // Check for the new email
                    user_id: { [Op.ne]: req.params.id } // Ensure it's not the same user
                }
            });
            
            // If an email match is found, return an error response
            if (userEmail) {
                return res.status(400).json({ error: 'User email already exists' });
            }
        }
        
        // Set updated_at to the current timestamp
        req.body.updatedat = new Date();
        
        // Proceed with updating the user
        const user = await EMSusers.update(req.body, {
            where: { user_id: req.params.id }
        });
        
        // Return the updated user response
        return res.status(200).json(user);
        
    } catch (error) {
        // Handle any errors that might occur
        return res.status(500).json({ error: error.message });
    }
}


// delete user
async function deleteUser(req, res) {
    try {
        const { EMSusers } = await connectToDatabase();
        const user = await EMSusers.destroy({
            where: { user_id: req.params.id },
        });
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// signin user
async function signinUser(req, res) {
    try {
        const { EMSusers, EMSemployee } = await connectToDatabase();
        // check user_role is ems_admin or ems_employee
        if (req.body.user_role === 'ems_admin') {
            const user = await EMSusers.findOne({
                where: { email: req.body.email, password: req.body.password },
            });
            if (!user) return res.status(404).json({ error: 'Invalid email or password' });
            const token = jwtTokens(user.dataValues);
            return res.status(200).json({ user, token });
        } else if (req.body.user_role === 'ems_employee') {
            const employee = await EMSemployee.findOne({
                where: { email: req.body.email, password: req.body.password },
            });
            if (!employee) return res.status(404).json({ error: 'Invalid email or password' });
            const modifiedEmployee = {
                user_id: employee.EMS_id,
                employee_id: employee.EMS_employee_id,
                user_name: employee.first_name + ' ' + employee.last_name,
                email: employee.email,
                organization_id: employee.organization_id,
                password: employee.password,
                user_role: employee.user_role,
            };
            // const token = jwtTokens(modifiedEmployee);
            return res.status(200).json({user : modifiedEmployee });
        } else {
            return res.status(400).json({ error: 'Invalid user role' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// create user
async function createUser(req, res) {
    try {
        const { EMSusers, EMSorganization } = await connectToDatabase();
        // check email is already exists
        const user = await EMSusers.findOne({
            where: { email: req.body.email },
        });
        if (user) return res.status(400).json({ error: 'User email already exists' });
        const organization = await EMSorganization.findOne({
            where: { organization_id: req.body.organization_id },
        });
        if (!organization) return res.status(404).json({ error: 'Organization not found' });
        const newUser = await EMSusers.create({
            ...req.body
        });
        return res.status(200).json(newUser);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    signupUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    signinUser,
    createUser,
};