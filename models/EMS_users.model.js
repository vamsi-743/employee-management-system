module.exports = (sequelize, DataTypes) => {
    const EMSusers = sequelize.define(
      "EMS_users",
      {
        user_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        user_role: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        organization_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        createdat: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        updatedat: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
  
      {
        tableName: "EMS_users",
        engine: "InnoDB",
        timestamps: false,
      }
    );
    
    // add a foreign key to the organization table
    EMSusers.associate = (models) => {
      EMSusers.belongsTo(models.EMSorganization, { foreignKey: "organization_id" });
    };
  
    return EMSusers;
  };
  