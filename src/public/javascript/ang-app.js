var app = angular.module('MEAN-Template-Angular', ['ngRoute']);

// Configure routes for this application
app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
      templateUrl: '/html/partials/home.html',
      controller: 'HomeController'
    }).when('/profile', {
      templateUrl: '/html/partials/profile.html',
      controller:'ProfileController'
    }).when('/chem/genChem', {
      templateUrl: '/html/partials/chem/genChem.html',
      controller:'ChemController'
    }).when('/mail', {
      templateUrl: '/html/partials/mail.html',
      controller:'MailController'
    }).when('/movie', {
      templateUrl: '/html/partials/movie.html',
      controller:'MovieController'
    }).when('/minecraft',{
	templateUrl: '/html/partials/minecraft.html',
	controller: 'MinecraftController'
    }).when('/bills',{
	templateUrl: '/html/partials/bills.html',
	controller: 'BillsController'
    }).when('/blog', {
	templateUrl: '/html/partials/blog.html',
	controller: 'BlogController'
    }).otherwise({
      redirectTo: '/'
    });
}]);

// This controll controls the home page!!!
app.controller('HomeController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

    var host = $location.$$host;
    var port = $location.$$port;
    console.log(port);
    
    var socket = io.connect(host + ':' + port);

    var isBottom = true;

    // Remove listeners so we don't get duplicates.
    socket.removeAllListeners('init');
    socket.removeAllListeners('receiveMessage');
    
    $scope.sendMessage = function() {
      message = {message: $scope.message, name: $scope.name};
      socket.emit('sendMessage', message);
      $scope.message = "";
    };

    socket.emit('requestInit');
    
    socket.on('init', function(messages) {
      console.log('Received init');
      $scope.messages = messages;
      $scope.$apply();
      var div = $("#messages");
      div.scrollTop(div.prop('scrollHeight'));
    });
    
    socket.on('receiveMessage', function(message) {
      var div = $("#messages");
      if(div.scrollTop() + div.height() == div.prop('scrollHeight')) {
        isBottom = true;
      }
      else {
        isBottom = false;
      }
      $scope.messages.push(message);
      $scope.$apply();
      if (isBottom) {
        div.scrollTop(div.prop('scrollHeight'));
      }
    });
  }
]);

app.controller('BlogController', ['$scope', '$location', '$http', '$anchorScroll',
  function($scope, $location, $http, $anchorScroll) {
      $anchorScroll()
      $scope.toBottom = function() {
	  $location.hash('bottom')
      }
  }]);

app.controller('ProfileController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

  }]);

app.controller('ChemController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

  }
				 ]);

app.controller('MinecraftController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

  }
				      ]);

app.controller('MinecraftMapController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

  }
]);

app.controller('MailController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

    console.log('Loaded mail controller');
    $scope.sendMail = function() {
      console.log('Sending Message');
      var host = $location.$$host;
      var port = $location.$$port;
      var postURL = '/api/mailout';
      console.log('POST request to ' + postURL);
      console.log($scope.text);
      console.log($scope.recipient);

      mailObject = {text: $scope.text,
                    recipient: $scope.recipient};
      $http({
        method: 'POST',
        url: postURL,
        dataType: 'json',
        data: mailObject,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
      }).success(function (data) {
        console.log(data);
      }).error(function (data) {
        console.log(data);
      });
    };
  }
]);

app.controller('BillsController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

      $scope.isMouseDown = false;
      var loadBills = function() {
	  $scope.bills = []
	  $scope.selected = [] // Background colors for each bill
	  $http({
	      method: 'GET',
              url: '/api/bills',
              dataType: 'json'
	  }).success(function (data) {
	      data.forEach(function(datum) {
		  console.log(datum)
		  $scope.bills.push(datum)
		  $scope.selected.push(false)
	      });
	  }).error(function (data) {
	      console.log("Bill Error")
              console.log(data);
	  });
      }

      $scope.dateFormat = function(date) {
	  // Takes default date string and reformats
	  var date_obj = new Date(date)
	  var month = (date_obj.getMonth() + 1).toString()
	  var day = date_obj.getDate().toString()
	  var year = date_obj.getFullYear().toString()
	  return month + "-" + day + ", " + year
      }

      $scope.highlightIfDown = function(index) {
	  if ($scope.isMouseDown) {
	      $scope.selected[index] = '29BDC1'
	  }
      }

      $scope.highlight = function(index) {
	  $scope.selected[index] = true
      }

      $scope.clearSelected = function() {
	  for (i = 0; i < $scope.selected.length; i++) {
	      $scope.selected[i] = false
	  }
      }

      $scope.getColor = function(index) {
	  if ($scope.selected[index]) {
	      return '29BDC1'
	  }
	  else {
	      return 'FFFFFF'
	  }
      }

      $scope.sumBills = function() {
	  sum = 0
	  for (i = 0; i < $scope.bills.length; i++) {
	      if ($scope.selected[i]) {
		  sum += $scope.bills[i].total
	      }
	  }
	  alert("Sum is " + sum.toString())
      }
      
      loadBills()
      console.log('Loaded bills controller');
      $scope.submitForm = function() {
	  if ($scope.billTotal[0] == "$") {
	      $scope.billTotal = $scope.billTotal.substring(1)
	  }
	  billObject = {name: $scope.billLabel,
			total: $scope.billTotal,
			payed: $scope.billPayer,
			category: $scope.billCategory}
	  $http({
              method: 'POST',
              url: '/api/billout',
              dataType: 'json',
              data: billObject,
              headers: { 'Content-Type': 'application/json; charset=UTF-8' }
	  }).success(function (data) {
              console.log(data);
	      loadBills()
	  }).error(function (data) {
	      console.log("Bill Error")
              console.log(data);
	  });
	  console.log(billObject.name)
      }
      
      $scope.billDel = function(bill) {
	  console.log("Deleting " + bill.name)
	  $http({
              method: 'POST',
              url: '/api/billdel',
              dataType: 'json',
              data: bill,
              headers: { 'Content-Type': 'application/json; charset=UTF-8' }
	  }).success(function (data) {
              console.log(data);
	      loadBills()
	  }).error(function (data) {
	      console.log("Bill Error")
              console.log(data);
	  });
      }
  }
]);

app.controller('MovieController', ['$scope', '$location', '$http', '$sce',
  function($scope, $location, $http, $sce) {
    console.log('Loaded movie controller');

    $scope.haveVideo = false;
    var vidTime = 0;

    $scope.fileChange = function(el) {
      console.log('File Changed');
      movie = el.files[0];
      var vidURL = URL.createObjectURL(movie);
      console.log(vidURL);
      $scope.vidURL = $sce.trustAsResourceUrl(vidURL);
      $scope.$apply();
      $scope.haveVideo = true;
    };

    // Socket stuff

    var host = $location.$$host;
    var port = $location.$$port;
    console.log(port);
    
    var socket = io.connect(host + ':' + port);

    // Remove listeners so we don't get duplicates.
    // socket.removeAllListeners('init');

    // Function called when someone plays a video
    var playVid = function(currentTime) {
      socket.emit('sendPlay', currentTime);
    };

    // Function called when someone pauses a video
    var pauseVid = function(currentTime) {
      socket.emit('sendPause', currentTime);
    };

    socket.on('recPlay', function(time) {
      console.log('Received play, time = ' + time);
      $('#video').get(0).play();
    });

    socket.on('recPause', function(time) {
      console.log('Reveived pause, time = ' + time);
      $('#video').get(0).pause();
      $('#video').get(0).currentTime = time;
      
    });
    
    socket.emit('movieInit');

    // Video events
    $("#video").on(
      'timeupdate',
      function(event) {
        console.log(this.currentTime);
        vidTime = this.currentTime;
      });
    
    $("#video").on(
      'pause',
      function(event) {
        console.log('Paused');
        console.log(this.currentTime);
        pauseVid(this.currentTime);
      });
    
    $("#video").on(
      'play',
      function(event) {
        console.log('Played');
        console.log(this.currentTime);
        playVid(this.currentTime);
      });
  }
]);

// Simple logging to make sure everything loaded correctly
console.log('Angular has been loaded!');
