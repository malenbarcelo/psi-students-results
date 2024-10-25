module.exports = (sequelize, DataTypes) => {

   const alias = "Users"
   const cols = {
      id:{
         type : DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement : true,
         allowNull: false
      },
      first_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      last_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      user_email:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      password:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      id_user_categories:{
      type: DataTypes.INTEGER,
      allowNull: false,
      },
      company:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      enabled:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
   }
   const config = {
   tableName : 'users',
   timestamps : false
   }
   const User = sequelize.define(alias, cols, config)

   User.associate = (models) => {
      User.belongsTo(models.User_categories,{
         as:'user_user_category',
         foreignKey: 'id_user_categories'
      })
   }
   return User
}