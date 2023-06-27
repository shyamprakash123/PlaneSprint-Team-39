/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const flash = require("connect-flash");
var cookieParser = require("cookie-parser");
const { Users, course, modu } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(flash());
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { where } = require("sequelize");
const { Session } = require("inspector");
const saltRounds = 10;

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("shh! some secret string"));

app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my_super-secret-key-2148411464649777996311316",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Users.findOne({ where: { email: username } })
        .then(async (Users) => {
          const result = await bcrypt.compare(password, Users.password);
          if (result) {
            return done(null, Users);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(null, false, { message: "Invalid credentials" });
        });
    }
  )
);

passport.serializeUser((Users, done) => {
  console.log("Serializing Users in session", Users.id);
  done(null, Users.id);
});

passport.deserializeUser((id, done) => {
  Users.findByPk(id)
    .then((Users) => {
      done(null, Users);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async (request, response) => {
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/signup", async (request, response) => {
  response.render("signup", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", async (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/signout", async (request, response, next) => {
  request.logOut((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.post("/users", async (request, response) => {
  const hasedPwd = await bcrypt.hash(request.body.password, saltRounds);
  let flag = true;
  if (request.body.firstName.length == 0) {
    request.flash("error", "First Name should not be empty!");
    flag = false;
  }
  if (request.body.lastName.length == 0) {
    request.flash("error", "Last Name should not be empty!");
    flag = false;
  }
  if (request.body.email.length == 0) {
    request.flash("error", "Email should not be empty!");
    flag = false;
  }
  if (request.body.password.length == 0) {
    request.flash("error", "Password should not be empty!");
    flag = false;
  }
  if (request.body.dob.length == 0) {
    request.flash("error", "DOB should not be empty!");
    flag = false;
  }
  if (request.body.gender.length == 0) {
    request.flash("error", "Gender should not be empty!");
    flag = false;
  }
  if (request.body.phoneNumber.length == 0) {
    request.flash("error", "Phone Number should not be empty!");
    flag = false;
  }else if(request.body.phoneNumber.length !=10){
    request.flash("error", "Phone Number is invalid!");
    flag = false;
  }
  if (request.body.std.length == 0) {
    request.flash("error", "Standard should not be empty!");
    flag = false;
  }
  if (request.body.role.length == 0) {
    request.flash("error", "Role should not be empty!");
    flag = false;
  }
  try {
    if (flag == true) {
      const users = await Users.create({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
        password: hasedPwd,
        dob: request.body.dob,
        gender : request.body.gender,
        phoneNumber : request.body.phoneNumber,
        std : request.body.std,
        role: request.body.role
      });

      request.login(users, (err) => {
        if (err) {
          console.error(err);
          request.flash("error", err);
        }
        response.redirect("/home");
      });
    } else {
      response.redirect("/signup");
    }
  } catch (err) {
    console.error(err);
    request.flash("error", "Account Already exists");
    response.redirect("/signup");
  }
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (request, response) => {
    response.redirect("/home");
  }
);

app.get("/home",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const userId = request.user.id;
  const user = await Users.getUser(userId);
  const courseList = await course.getCourses();
  let isInst = false;
  if(user.role == "Instructor"){
    isInst = true;
  }
  response.render("home", {
    courseList,
    user,
    isInst,
    csrfToken: request.csrfToken(),
  });
});
app.get("/newCourse",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  response.render("newCourse", {
    csrfToken: request.csrfToken(),
  });
});
app.get("/addModule",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  response.render("addModule", {
    csrfToken: request.csrfToken(),
  });
});
app.get("/topicDetails",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  response.render("topicDetails", {
    csrfToken: request.csrfToken(),
  });
});

app.post("/newCourse",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  let flag = true;
  let courseTitle = request.body.courseTitle;
  let courseDescription = request.body.courseDescription;
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;
  let topics = request.body.topics;
  let price = request.body.price;
  let userId = request.user.id;
  if (courseTitle.length == 0) {
    request.flash("error", "Course Name should not be empty!");
    flag = false;
  }
  if (courseDescription.length == 0) {
    request.flash("error", "Course Description should not be empty!");
    flag = false;
  }
  if (startDate.length == 0) {
    request.flash("error", "Start Date should not be empty!");
    flag = false;
  }
  if (endDate.length == 0) {
    request.flash("error", "End Date should not be empty!");
    flag = false;
  }
  if (topics.length == 0) {
    request.flash("error", "Topics should not be empty!");
    flag = false;
  }
  if (price.length == 0) {
    request.flash("error", "Price should not be empty!");
    flag = false;
  }
  try{
    if(flag){
    let topicsArray = topics.split(",");
    const courses = await course.addCourse(courseTitle,courseDescription,startDate,endDate,topicsArray,price,userId);
    response.redirect("/home");
    }else{
      response.redirect("/newCourse");
    }
  }catch(e){
    request.flash("error", e.message);
    response.redirect("/newCourse");
  }
});

app.get("/courseDetails/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const courseId = request.params.id;
  const courseDetails = await course.getCoursesById(courseId);
  const userId = request.user.id;
  const user = await Users.getUser(userId);
  let isInst = false;
  if(user.role == "Instructor"){
    isInst = true;
  }
  console.log(courseDetails);
  const instructor = await Users.getUser(courseDetails.instructorId);
  const instructorName = instructor.firstName+" "+instructor.lastName;
  let dt2 = courseDetails.endDate;
  let dt1 = courseDetails.startDate;
  let date2 = new Date(dt2);
  let date1 = new Date(dt1);
  var diff =(date2.getTime() - date1.getTime()) / 1000;
  diff /= (60 * 60 * 24 * 7);
  let duration = Math.abs(Math.round(diff));
  response.render("courseDetails", {
    isInst,
    courseId,
    duration,
    instructorName,
    courseDetails,
    csrfToken: request.csrfToken(),
  });
});

app.get("/moduleDetails/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const courseId = request.params.id;
  // const modules = await modu.getModules(courseId);
  // let submodulesArray = [];
  // for(let i=0; i < modules.length; i++){
  //   let submodules = await modu.getSubModules(modules[i].id);
  //   submodulesArray.push(submodules);
  // }
  const userId = request.user.id;
  const user = await Users.getUser(userId);
  let isInst = false;
  if(user.role == "Instructor"){
    isInst = true;
  }
  response.render("moduleDetails", {
    isInst,
    courseId,
    // submodulesArray,
    // modules,
    csrfToken: request.csrfToken(),
  });
});

app.post("/addModule",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const moduleName = request.body.moduleName;
  const courseId = request.body.courseId;

  response.render("moduleDetails", {
    csrfToken: request.csrfToken(),
  });
});


module.exports = app;