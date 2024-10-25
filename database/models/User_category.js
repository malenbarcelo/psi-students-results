module.exports = (sequelize, DataTypes) => {
    const alias = "User_categories"
    const cols = {
        id:{
          type : DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement : true,
          allowNull: false
       },
       category_name:{
          type: DataTypes.STRING,
          allowNull: false,
       }
    }
    const config = {
       tableName : 'user_categories',
       timestamps : false
    }

    const User_category = sequelize.define(alias, cols, config)

    return User_category

 }