module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
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
        Document.belongsTo(models.User, {
          foreignKey: 'owner',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return Document;
};
