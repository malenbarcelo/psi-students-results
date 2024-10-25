module.exports = (sequelize, DataTypes) => {

   const alias = "Forms_data"
   const cols = {
      id:{
         type : DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement : true,
         allowNull: false
      },
      date:{
         type: DataTypes.DATE,
         allowNull: false,
      },
      email:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      grade:{
         type: DataTypes.DECIMAL,
         allowNull: false,
      },
      last_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      first_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      company:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      dni:{
         type: DataTypes.STRING,
         allowNull: true,
      },
      form_name:{
         type: DataTypes.STRING,
         allowNull: true,
      },
      course_code:{
         type: DataTypes.INTEGER,
         allowNull: true,
      },
      student_code:{
         type: DataTypes.STRING,
         allowNull: true,
      },
      observations:{
         type: DataTypes.STRING,
         allowNull: true,
      },
   }
   const config = {
   tableName : 'forms_data',
   timestamps : false
   }
   const Form_data = sequelize.define(alias, cols, config)

   Form_data.associate = (models) => {
      Form_data.belongsTo(models.Courses, {
        as: 'forms_data_courses',
        foreignKey: 'form_name',
        targetKey: 'course_name', 
      });
      Form_data.hasMany(models.Profile_images, {
         as: 'student_image',
         foreignKey: 'dni',
         sourceKey: 'dni', 
       });
    };

   return Form_data
}