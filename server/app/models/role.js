module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    title: {
      type: DataTypes.STRING
    }
  }, {
      classMethods: {
        associate: (models) => {
        }
      }
    });
  return Roles;
};
