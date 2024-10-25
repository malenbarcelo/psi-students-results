module.exports = (sequelize, DataTypes) => {

   const alias = "Profile_images"
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
      image:{
         type: DataTypes.STRING,
         allowNull: false,
      },
   }
   const config = {
   tableName : 'profile_images',
   timestamps : false
   }
   const Profile_image = sequelize.define(alias, cols, config)

   Profile_image.associate = (models) => {
      Profile_image.belongsTo(models.Forms_data, {
         as: 'form_data',
         foreignKey: 'dni',
         targetKey: 'dni' 
     });
    };

   return Profile_image
}