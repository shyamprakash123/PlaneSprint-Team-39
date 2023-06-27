/* eslint-disable no-unused-vars */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class topicDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    
  }
  topicDetails.init({
    content: DataTypes.STRING,
    videos: DataTypes.ARRAY(DataTypes.STRING),
    imgs: DataTypes.ARRAY(DataTypes.STRING),
    pdf: DataTypes.ARRAY(DataTypes.STRING),
    topicId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'topicDetails',
  });
  return topicDetails;
};