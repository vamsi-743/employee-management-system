module.exports = (sequelize, DataTypes) => {
    const EMS_department = sequelize.define('EMS_department', {
        department_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        department_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        department_total_employees: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        department_description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'EMS_department',
        engine: 'InnoDB',
        timestamps: false,
    });

    EMS_department.associate = (models) => {
        EMS_department.hasMany(models.EMSemployee, { foreignKey: 'department_id' });
    };

    return EMS_department;
};

