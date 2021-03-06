import bcrypt from 'bcrypt-nodejs';

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
          Users.hasMany(models.Documents, {
            foreignKey: 'owner'
          });
          Users.belongsTo(models.Roles, {
            foreignKey: 'role'
          });
        }
      },
      instanceMethods: {
        hashPassword: function hashPassword() {
          this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
        }
      },
      hooks: {
        beforeCreate(user) {
          user.hashPassword();
        },

        beforeUpdate(user) {
          if (user._changed.password) {
            user.hashPassword();
          }
        }
      }
    });
  return Users;
};
