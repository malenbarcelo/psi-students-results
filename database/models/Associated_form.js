module.exports = (sequelize, DataTypes) => {

   const alias = "Associated_forms"
   const cols = {
   id:{
      type : DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,
      allowNull: false
   },
   id_forms:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   id_associated_form:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   }
   const config = {
      tableName : 'associated_forms',
      timestamps : false
   }

   const Associated_form = sequelize.define(alias, cols, config)

   Associated_form.associate = (models) => {
      Associated_form.belongsTo(models.Courses, {
         as: 'course_data',
         foreignKey: 'id_associated_form'
      })
   }
   
   return Associated_form
}