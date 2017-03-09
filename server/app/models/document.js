module.exports = (sequelize, DataTypes) => {
  const Documents = sequelize.define('Documents', {
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    access: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public',
      validate: {
        isIn: [['public', 'private']]
      }
    }
  }, {
    classMethods: {
      associate: function (models) {
          // associations can be defined here
        Documents.belongsTo(models.Users, {
          foreignKey: 'owner',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return Documents;
};
