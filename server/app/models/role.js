module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
      classMethods: {
        associate: (models) => {
        }
      }
    });
  return Roles;
};
