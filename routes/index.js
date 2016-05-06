var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt        = require("jsonwebtoken");

var User = require("../common/users");
var Project = require("../common/projects");
var Task = require("../common/tasks");

mongoose.connect("mongodb://127.0.0.1:27017/tomatoList");

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index.html');
});
router.post('/authenticate', function(req, res) {
  User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        res.json({
          type: true,
          data: user,
          token: user.token,
        });
      } else {
        res.json({
          type: false,
          data: "错误的邮箱或者密码"
        });
      }
    }
  });
});

router.post('/signin', function(req, res) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        res.json({
          type: false,
          data: "User already exists!"
        });
      } else {
        var userModel = new User();
        userModel.email = req.body.email;
        userModel.password = req.body.password;
        userModel.save(function(err, user) {
          user.token = jwt.sign(user, "secret");
          user.save(function(err, user1) {
            res.json({
              type: true,
              data: user1,
              token: user1.token
            });
          });
        })
      }
    }
  });
});

router.get('/me', ensureAuthorized, function(req, res) {
    User.findOne({token: req.token}, function(err, user) {
        Project.find({userid:user._id},function(err,project){
          Task.find({userid:user._id},function(err,task){
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                res.json({
                  type:true,
                  user:user,
                  projects:project,
                  tasks:task
                });
            }


          });
        });
    });
});


router.post('/addProject', ensureAuthorized, function(req, res) {
    Project.findOne({userid: req.body.userid,name:req.body.name}, function(err, project) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if(project){
              res.json({
                type:false,
                data:"你存在同名的项目"
              });
            }else{
              var project = new Project(req.body);
              project.save(function(err,project){
                if(err){
                  res.json({
                  type:false,
                  data:err
                });
                }else{
                  res.json({
                  type:true,
                  data:project
                });
                }
              });

            }
        }
    });

});


router.post('/addTask', ensureAuthorized, function(req, res) {
    Task.findOne({userid:req.body.userid,projectName:req.body.projectName,name:req.body.name}, function(err, task) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if(task){
              res.json({
                type:false,
                data:"该项目存在同名的任务"
              });
            }else{
              var task = new Task(req.body);
              console.log(task);
              console.log(req.body);
              task.save(function(err,task){
                if(err){
                  res.json({
                  type:false,
                  data:err
                });
                }else{
                  res.json({
                  type:true,
                  data:task
                });
                }
              });

            }
        }
    });
    
});

router.post('/modifyTask', ensureAuthorized, function(req, res) {
    var condition = {_id:req.body._id};
    var update = {$set : req.body.task};
    Task.update(condition,update,function(err,task){
      if(err){
        res.json({
          type:false,
          data:err
        });
      }else{
        res.json({
          type:true,
          data:"修改成功"
        });
      }
    })
});

router.delete('/deleteTask/', ensureAuthorized, function(req, res) {
    var condition = {_id:req.query._id};
    Task.remove(condition,function(err){
      if(err){
        res.json({
          type:false,
          data:err
        });
      }else{
        res.json({
          type:true,
          data:"删除成功"
        })
      }
    });
});

router.post('/modifyProject', ensureAuthorized, function(req, res) {
    var condition = {_id:req.body._id};
    var update = {$set : req.body.project};
    Project.update(condition,update,function(err,project){
      if(err){
        res.json({
          type:false,
          data:err
        });
      }else{
        res.json({
          type:true,
          data:"修改成功"
        });
      }
    });
});

router.delete('/deleteProject/', ensureAuthorized, function(req, res) {
    var condition = {_id:req.query._id};
    Project.remove(condition,function(err){
      if(err){
        res.json({
          type:false,
          data:err
        });
      }else{
        res.json({
          type:true,
          data:"删除成功"
        })
      }
    });
});

router.put('/stoptask/', ensureAuthorized, function(req, res) {
    var condition = {_id:req.query._id};
    var taskbreak = req.query.taskbreak;
    var update = {$set:{breaka : taskbreak}};
    Task.update(condition,update,function(err,task){
       if(err){
        res.json({
          type:false,
          data:err
        });
      }else{
        res.json({
          type:true,
          data:task
        });
      }
    });
});


router.put('/finishTask/', ensureAuthorized, function(req, res) {
    var condition = {_id:req.query._id};
    var update = {$set:{state:'已完成'}};
    Task.update(condition,update,function(err,task){
       if(err){
        res.json({
          type:false,
          data:err
        });
      }else{
        res.json({
          type:true,
          data:"task"
        });
      }
    });
});


function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
};

module.exports = router;
