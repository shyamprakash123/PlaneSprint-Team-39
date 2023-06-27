/* eslint-disable no-unused-vars */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class subModule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getSubModules(id){
      return this.findAll({
        where:{
          moduleId : id
        }
      })
    }
  }
  subModule.init({
    topicName: DataTypes.STRING,
    moduleId: DataTypes.INTEGER,
    moduleDescription: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'subModule',
  });
  return subModule;
};