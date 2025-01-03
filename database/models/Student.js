module.exports = (sequelize, DataTypes) => {

   const alias = "Students"
   const cols = {
      id:{
         type : DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement : true,
         allowNull: false
      },
      dni:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      first_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      last_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      email:{
         type: DataTypes.STRING,
         allowNull: true,
      },
      company:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      image:{
         type: DataTypes.STRING,
         allowNull: true,
      },
      enabled:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
   }
   const config = {
      tableName : 'students',
      timestamps : false
   }
   const Student = sequelize.define(alias, cols, config)

   return Student
}