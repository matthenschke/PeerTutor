const express = require('express');
const Redirect = require('../middlewares/redirect');
const models = require('../models');
const passport = require('../middlewares/authentication');

var errors = [];
var schools = [];
var favTutors = [];
var containsNumbersRegex = new RegExp(/\d/g);
 var aboutMeEmpty;

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', Redirect.ifNotLoggedIn(), this.index);
    router.post('/updateProfile', Redirect.ifNotLoggedIn(), this.updateProfile);
    router.post('/updateAboutMe', Redirect.ifNotLoggedIn(), this.updateAboutMe);
    
    return router;
  },
  index(req, res) {
      errors = [];
      schools = [];
      favTutors = [];
     
      
      favTutors.push("img/portfolio/cabin.png");
      favTutors.push("img/profile.png");
      favTutors.push("img/profile.png");
      favTutors.push("img/profile.png");
      favTutors.push("img/profile.png");
      
      models.schools.findAll().then(function(school){
          school.forEach(function(item){
              schools.push(item.schoolname);
          });
      
      });
      if(res.locals.cur_user.aboutMe === "")
          aboutMeEmpty = true;
      else
          aboutMeEmpty = false;
          
      console.log(aboutMeEmpty);
      
      res.render('profile', {
          user: req.user, 
          school: schools,
          favtutor: favTutors,
          aboutMeEmpty: aboutMeEmpty
      });
      
  },
  updateProfile(req, res){ 
      errors = [];
      var fname = req.body.fname;
      var lname = req.body.lname;
      var email = req.body.email;
      var cemail = req.body.cemail;
      var password = req.body.password;
      var cpassword = req.body.cpassword;
      var school = req.body.selected_school;
      var aboutMe = req.body.aboutMe;
      
      if(email !== cemail)
          errors.push('Make sure emails match.');
      if(password !== password)
          errors.push('Make sure passwords match.');
      if(password.length < 8 || containsNumbersRegex.test(password) == false)
          errors.push('Password must be longer than 8 characters and must include at least ONE number.');
      if(fname === "" || lname === "" || email === "" || cemail === "" || school === "Select your School")
          errors.push('All fields must have value!');
      
      
      if(errors.length === 0){

          req.user.update({
              firstname: fname,
              lastname: lname,
              email: email,
              password: password,
              school: school,
              aboutMe: aboutMe
          }, {
              where:{
                  id: req.user.id,
                  email: req.user.email,
                  school: req.user.school
              } 
          }).then((user) => {
              if(res.locals.cur_user.aboutMe === "")
                  aboutMeEmpty = true;
              else
                  aboutMeEmpty = false;
              
              passport.authenticate('local')(req, res);
              
                  res.render('profile',{
                  user: user,
                  error: errors,
                  school: schools,
                  favtutor: favTutors,
                  success: true,
                  aboutMeEmpty: aboutMeEmpty
              }); 
              
          }).catch(() => {
                  errors.push('This email is already taken.');
                  res.render('profile',{
                      user: req.user,
                      error: errors,
                      school: schools,
                      favtutor: favTutors,
                      success: false,
                      aboutMeEmpty: aboutMeEmpty
                  });
              });
      }
      else{
          res.render('profile',{
                  user: req.user,
                  error: errors,
                  school: schools,
                  favtutor: favTutors,
                  success: false,
              aboutMeEmpty: aboutMeEmpty
              });
      }
      
  },
  updateAboutMe(req, res){   
      errors = [];
      models.users.update({
          aboutMe: req.body.aboutMe,
      }, {
         where: {
             email: req.user.email
         } 
      }).then((user) => {
          res.render('profile',{
              user: req.user,
              error: errors,
              school: schools,
              favtutor: favTutors,
              success: true,
              aboutMeEmpty: aboutMeEmpty
          });
      });
      
      
  },
};
