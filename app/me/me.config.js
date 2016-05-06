var meModule = angular.module('me.config',['ui.router','ngStorage','auth','ui.bootstrap',"highcharts-ng"]);

meModule.config(function($stateProvider,$urlRouterProvider,$httpProvider){
    $urlRouterProvider.when("/me",'/me/work');
    $stateProvider
        .state('me',{
            url:'/me',
            templateUrl:'/me/me.view.html',
            controller:'meCtrl'
        })
        .state('me.work',{
            url:'/work',
            templateUrl:'/work/work.view.html',
            controller:'workCtrl'
        })
        .state('me.project',{
            url:'/project',
            templateUrl:'/project/project.view.html',
            controller:'projectCtrl'
        })
        .state('me.timeline',{
            url:'/timeline',
            templateUrl:'/timeline/timeline.view.html',
            controller:'timelineCtrl'
        })
            .state('me.chart',{
            url:'/chart',
            templateUrl:'/chart/chart.view.html',
            controller:'chartCtrl'
        })

    $httpProvider.interceptors.push('authInterceptor');
});


meModule.controller('meCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Main', function($rootScope, $scope, $location, $localStorage, Main){
     Main.me(function(res) {
            $scope.myDetails = res;
            $scope.taskList = res.tasks;
            $scope.projectList = res.projects;
            // $localStorage.tasks = $scope.taskList;可以存进本地
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        });
    $rootScope.menuHide = false;
    $rootScope.topMenuHide = true;
    //创建补0函数
    function p(s) {
        return s < 10 ? '0' + s: s;
    }

    $scope.localDate = new Date().getFullYear()+" "+p((new Date().getMonth()+1))+" "+p(new Date().getDate())+" - "+p(new Date().getHours())+":"+p(new Date().getMinutes());
    $scope.project={
        userid:1,
        name: "项目名",
        start: $scope.localDate,
        finish: "",
        state:"未开始",
        description:"默认描述",
    };
    $scope.task = {
        userid: 1,
        name:"任务名",
        projectName:"默认",
        description:"默认描述",
        start:$scope.localDate,
        finish:"",
        color:"red",
        state:"未开始",
        breaka:0,
        pomodoro:{
            number:1,
            leng:45,
            rest:5
        }
    };
    $scope.pomodoro = {
        number:1,
        leng:45,
        rest:5,
        second:00
    }

}]);
meModule.controller('workCtrl', ['$scope','Main','$rootScope','$http','$interval', function($scope,Main,$rootScope,$http,$interval){
    $rootScope.tab = 1;
    // $scope.taskView = true;
    // $scope.showTaskView = function(){
    //    $scope.taskView = !$scope.taskView;
    // };
//Accordion
    $scope.open = true;
    $scope.open1 = true;
    $scope.open2= true;
    $scope.open3 = true;
//
$scope.showAllTask = function(){
        $scope.select_project = "";
    };
//弹出框添加任务
    $scope.addTask = function(){
    var formData = {
        userid : $scope.myDetails.user._id,
        name :$scope.task.name,
        description : $scope.task.description,
        projectName:$scope.task.projectName,
        start:$scope.task.start,
        finish:$scope.task.finish,
        color: $scope.task.color,
        breaka:0,
        pomodoro:{
            number:$scope.task.pomodoro.number,
            leng:$scope.task.pomodoro.leng,
            rest:$scope.task.pomodoro.rest
        }
    }
    angular.extend($scope.task, formData);
            console.log($scope.task);
            console.log(formData);
    $scope.newTask = jQuery.extend(true,{},$scope.task);//复制$scope.task用于添加
    Main.addTask($scope.task, function(res) {
            if(res.type == true){
                $scope.newTask._id = res.data._id;
                $scope.taskList.push($scope.newTask);
                $scope.addTaskError = false;
            }else{
                $scope.addTaskError = res.data;
            }
        }, function() {
            $rootScope.error = 'Failed to addTask';
        })
    };
//修改任务
    $scope.modifyTaskView = function(i){
        $scope.taskC = jQuery.extend(true,{},i);//复制task对象用于中间数据绑定显示
        $scope.taskB = i;//用于修改成功修改视图数据
    };    

    $scope.modifyTask = function(){
        var formData = {
        userid : $scope.myDetails.user._id,
        name :$scope.taskC.name,
        description : $scope.taskC.description,
        projectName:$scope.taskC.projectName,
        start:$scope.taskC.start,
        finish:$scope.taskC.finish,
        color: $scope.taskC.color,
        breaka:0,
        pomodoro:{
            number:$scope.taskC.pomodoro.number,
            leng:$scope.taskC.pomodoro.length,
            rest:$scope.taskC.pomodoro.rest
            }
        };
        angular.extend($scope.task, formData);
        var newData = {
            task:$scope.task,
            _id:$scope.taskC._id
        };
                console.log($scope.task);
                console.log(formData);
                console.log(newData);
        Main.modifyTask(newData, function(res) {
                if(res.type == true){
                    console.log("sucees");
                    angular.extend($scope.taskB, formData);
                    $scope.addTaskError = false;
                }else{
                    $scope.addTaskError = res.data;
                }
            }, function() {
                $rootScope.error = 'Failed to modifyTask';
            })
        }
// 删除任务        
    $scope.deleteTask = function(i){
        var data = i._id;
        $http({
            url:"http://localhost:3000/deleteTask",
            method:'delete',
            params:{'_id':i._id}
        }).success(function(res){
            if(res.type == true){
                $scope.taskList.splice(jQuery.inArray(i,$scope.taskList),1);
            }else{
                $scope.addTaskError = res.data;
            }
        }).error(function() {
            $rootScope.error = 'Failed to modifyTask';
        });
    }
            //番茄钟

    $scope.pomodoro = function(i){
        $scope.taskD = jQuery.extend(true,{},i);
        $scope.taskE = i;//用于修改状态
        $scope.pomodoro.leng = $scope.taskD.pomodoro.leng;
        $scope.pomodoro.second = "00";
    }
    $scope.workinterval;
    var workPomodoro = function(i){
        $scope.pomodoro.leng = i.pomodoro.leng;
        $scope.pomodoro.second = '00';
        $scope.pomodoro.number = i.pomodoro.number;
        function reduceM(){$scope.pomodoro.leng = $scope.pomodoro.leng - 1;}
        function reduceS(){
            if($scope.pomodoro.second == 00){
                if($scope.pomodoro.leng == 0){
                    $interval.cancel($scope.workinterval);
                    $scope.workinterval = undefined;
                    alert("一个番茄钟结束")
                }else{
                    $scope.pomodoro.second = 59;
                    reduceM();
                }
            }else{
                $scope.pomodoro.second = $scope.pomodoro.second-1;
                if($scope.pomodoro.second < 10){
                    $scope.pomodoro.second = "0" + $scope.pomodoro.second;
                }
            }
        }
            $scope.workinterval = $interval(reduceS,1000);
    };

    var restPomodoro = function(i){
        var taskR = jQuery.extend(true,{},i);
        $scope.pomodoro.leng = taskR.pomodoro.rest;
        $scope.pomodoro.second = '00';
        $scope.pomodoro.number = i.pomodoro.number;
        function reduceM(){$scope.pomodoro.leng = $scope.pomodoro.leng - 1;}
        function reduceS(){
            if($scope.pomodoro.second == 00){
                if($scope.pomodoro.rest == 0){
                    $interval.cancel($scope.restinterval);
                    $scope.restinterval = undefined;
                }else{
                    $scope.pomodoro.second = 59;
                    reduceM();
                }
            }else{
                $scope.pomodoro.second = $scope.pomodoro.second-1;
                if($scope.pomodoro.second < 10){
                    $scope.pomodoro.second = "0" + $scope.pomodoro.second;
                }
            }
        }
            $scope.restinterval = $interval(reduceS,1000);
    };


    $scope.startPomodoro = function(i){
        if($scope.workinterval == undefined){
            workPomodoro(i);
        }
    }
    $scope.startRestPomodoro = function(i){
        if($scope.restinterval == undefined){
            restPomodoro(i);
        }
    }
    $scope.stopPomodoro = function(i){
        $interval.cancel($scope.workinterval);
        $scope.workinterval = undefined;
        $interval.cancel($scope.restinterval);
        $scope.restinterval = undefined;
        var data = i._id;
        $http({
            url:"http://localhost:3000/stoptask",
            method:'put',
            params:{'_id':i._id,'taskbreak':i.breaka+1}
        }).success(function(res){
            if(res.type == true){
                $scope.taskE.breaka = $scope.taskE.breaka+1;
                i.breaka = i.breaka+1;
            }else{
                $scope.addTaskError = res.data;
            }
        }).error(function() {
            $rootScope.error = 'Failed to modifyTask';
        });
    }

    // 完成任务        
    $scope.finishTask = function(i){
        var data = i._id;
        $http({
            url:"http://localhost:3000/finishTask",
            method:'put',
            params:{'_id':i._id}
        }).success(function(res){
            if(res.type == true){
                $scope.taskE.state = "已完成"
            }else{
                $scope.addTaskError = res.data;
            }
        }).error(function() {
            $rootScope.error = 'Failed to modifyTask';
        });
    }


}]);

meModule.controller('projectCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Main', '$http',function($rootScope, $scope, $location, $localStorage, Main,$http){
    $rootScope.tab = 2;

    //弹出框添加项目
    //添加项目
    $scope.addProject = function(){
        var formData = {
                userid : $scope.myDetails.user._id,
                name :$scope.project.name,
                description : $scope.project.description,
                start:$scope.project.start,
                finish:$scope.project.finish,
            }
        angular.extend($scope.project, formData);
            console.log($scope.task);
            console.log(formData);
        $scope.newProject = jQuery.extend(true,{},$scope.project);//复制$scope.task用于添加
        Main.addProject($scope.project, function(res) {
                if(res.type == true){
                    $scope.projectList.push($scope.newProject);
                    $scope.addTaskError = false;
                }else{
                    $scope.addTaskError = res.data;
                }
            }, function() {
                $rootScope.error = 'Failed to addProject';
            })
        };
    //修改项目视图
     $scope.modifyProjectView = function(i){
        $scope.projectC = jQuery.extend(true,{},i);//复制task对象用于中间数据绑定显示
        $scope.projectB = i;//用于修改成功修改视图数据
    };    
    //修改项目
     $scope.modifyProject = function(){
        var formData = {
                userid : $scope.myDetails.user._id,
                name :$scope.projectC.name,
                description : $scope.projectC.description,
                start:$scope.projectC.start,
                finish:$scope.projectC.finish,
            };
        angular.extend($scope.project, formData);
        var newData = {
            project:$scope.project,
            _id:$scope.projectC._id
        };
                console.log(formData);
                console.log(newData);
        Main.modifyProject(newData, function(res) {
                if(res.type == true){
                    console.log("sucees");
                    angular.extend($scope.projectB, formData);
                    $scope.addTaskError = false;
                }else{
                    $scope.addTaskError = res.data;
                }
            }, function() {
                $rootScope.error = 'Failed to modifyTask';
            })
        }
    //删除项目      
    $scope.deleteProject = function(i){
        var data = i._id;
        $http({
            url:"http://localhost:3000/deleteProject",
            method:'delete',
            params:{'_id':i._id}
        }).success(function(res){
            if(res.type == true){
                $scope.projectList.splice(jQuery.inArray(i,$scope.projectList),1);
            }else{
                $scope.addTaskError = res.data;
            }
        }).error(function() {
            $rootScope.error = 'Failed to modifyTask';
        });
    }

}]);


meModule.controller('timelineCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Main', function($rootScope, $scope, $location, $localStorage, Main){
    $scope.showAllTask = function(){
        $scope.select_project = "";
    };
     $rootScope.tab = 5;
}]);
meModule.controller('chartCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Main', function($rootScope, $scope, $location, $localStorage, Main){
     $rootScope.tab = 3;
     //每个项目包含任务个数
     $scope.taskNum = function(){
        var projects = $scope.projectList;
        var tasks = $scope.taskList;
        var taskNum = [];
        var projectN = [];
        for (var i = projects.length - 1; i >= 0; i--) {
            taskNum[i]=0;
            projectN[i]=projects[i].name;
            for (var j = tasks.length - 1; j >= 0; j--) {
                if(projects[i].name == tasks[j].projectName){
                    taskNum[i]++;
                }
            }
        }

        $scope.chart1Config = {
          options: {
              chart: {
                renderTo: 'container',
                type: 'column',
                margin: 75,
                options3d: {
                    enabled: true,
                    alpha: 15,
                    beta: 15,
                    depth: 50,
                    viewDistance: 25
                }
              },
            },
            
            series: [{
               data: taskNum
            }],
            title: {
               text: '项目所含任务数量'
            },
            subtitle: {
              text: '项目所含任务数量'
            },
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            size: {
             width: 1000,
             height: 380
            },
            xAxis: {
              gridLineWidth: 1,
              currentMin: 0,
              title: {text: "项目名"},
              categories:projectN
            },

        };
        
     };
     $scope.taskNum();

    $scope.taskbreak = function(){
    var tasks = $scope.taskList;
    var taskN = [];
    var taskb =[];
    for (var i = tasks.length - 1; i >= 0; i--) {
        taskN[i] = tasks[i].name;
        taskb[i] = tasks[i].breaka;
    }

    $scope.chart2Config = {
      options: {
          chart: {
            type: 'column',
          },
        },
        
        series: [{
           data: taskb
        }],
        title: {
           text: '任务中断数量'
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        size: {
         width: 1000,
         height: 380
        },
        xAxis: {
          gridLineWidth: 1,
          currentMin: 0,
          title: {text: "任务名"},
          categories:taskN
        },
      };
    };
    $scope.taskbreak();
}]);