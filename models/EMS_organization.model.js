module.exports = (sequelize, DataTypes) => {
    const EMSorganization = sequelize.define(
      "EMS_organization",
      {
        organization_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        organization_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        organization_address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        tableName: "EMS_organization",
        engine: "InnoDB",
        timestamps: false,
      }
    );
  
    EMSorganization.associate = (models) => {
      EMSorganization.hasMany(models.EMSusers, { foreignKey: 'organization_id' });
    };
  
    return EMSorganization;
  };