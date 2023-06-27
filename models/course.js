/* eslint-disable no-unused-vars */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static addCourse(courseTitle,courseDescription,startDate,endDate,topicsArray,price,userId){
      return this.create({
        courseName : courseTitle,
        description : courseDescription,
        instructorId : userId,
        startDate : startDate,
        endDate : endDate,
        topics : topicsArray,
        price : price,
        img : "https://www.dreamhost.com/blog/wp-content/uploads/2018/09/elements-web-design-opt-730x485.jpg"
      });
    }

    static getCourses(){
      return this.findAll();
    }
    static getCoursesById(id){
      return this.findByPk(id);
    }
  }
  course.init({
    courseName: DataTypes.STRING,
    description: DataTypes.STRING,
    instructorId: DataTypes.INTEGER,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    topics: DataTypes.ARRAY(DataTypes.STRING),
    price: DataTypes.INTEGER,
    img : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'course',
  });
  return course;
};
