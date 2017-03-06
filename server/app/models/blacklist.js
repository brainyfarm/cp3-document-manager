module.exports = function(sequelize, DataTypes) {
  const Blacklists = sequelize.define('Blacklists', {
    token: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Blacklists;
};
