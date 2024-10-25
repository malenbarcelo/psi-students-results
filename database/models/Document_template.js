module.exports = (sequelize, DataTypes) => {

   const alias = "Documents_templates"
   const cols = {
   id:{
      type : DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,
      allowNull: false
   },
   id_courses:{
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   certificate_logo:{
      type: DataTypes.STRING,
      allowNull: true,
   },
   credential_logo:{
      type: DataTypes.STRING,
      allowNull: true,
   },
   signature1_image:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   signature2_image:{
      type: DataTypes.STRING,
      allowNull: true,
   },
   course_name:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   credential_forehead:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   credential_back:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   certificate_normatives:{
      type: DataTypes.STRING,
      allowNull: true,
   },
   credential_normatives:{
      type: DataTypes.STRING,
      allowNull: true,
   },
   enabled:{
      type: DataTypes.INTEGER,
      allowNull: true,
   }
   }
   const config = {
   tableName : 'documents_templates',
   timestamps : false
   }
   const Document_template = sequelize.define(alias, cols, config)

   
   return Document_template
}