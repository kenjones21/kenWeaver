var app = angular.module('MEAN-Template-Angular', ['ui.router']);

// Configure routes for this application
app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider.state('home', {
	url:'/home',
	templateUrl: "/html/partials/home.html",
	controller: 'HomeController'
    }).state('mail', {
	url: "/mail",
	templateUrl: '/html/partials/mail.html',
	controller:'MailController'
    }).state('movie', {
	url: "/movie",
	templateUrl: '/html/partials/movie.html',
	controller:'MovieController'
    }).state('bills',{
	url: "/bills",
	templateUrl: '/html/partials/bills.html',
	controller: 'BillsController'
    }).state('blog', {
	url: "/blog",
	templateUrl: "/html/partials/blog.html",
	controller: "BlogController"
    }).state("blogid", {
	url: "/blog/:blogid",
	templateUrl: function(urlattr) {
	    console.log(urlattr)
	    return '/html/partials/blog' + urlattr.blogid + '.html'
	},
	controllerProvider: function($stateParams) {
	    return "Blog" + $stateParams.blogid + "Controller"
	}
    })
});

// This controll controls the home page!!!
app.controller('HomeController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {
      console.log("Home controller ya'll")
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
      console.log("Loaded BlogController")
      console.log($location.url())
      $scope.goTo = function(blogID) {
	  $location.url($location.url() + "/" + blogID)
      }
      function removeHash() {
	  hash = $location.hash()
	  hashSize = hash.length
	  urlWithoutHash = $location.url().substring(0, $location.url().length - hashSize - 1)
	  return urlWithoutHash
      }
      if ($location.hash() !== "") {
	  baseUrl = removeHash()
	  $location.url(baseUrl + "/" + $location.hash())
      }
  }]);

app.controller('Blog20170722Controller', ['$scope', '$location', '$http', '$anchorScroll',
  function($scope, $location, $http, $anchorScroll) {
      console.log("Blog20170722Controller")
      function toNum(d) {
	  // Assume all values can be converted
	  for (var key in d) {
	      d[key] = +d[key]
	  }
	  return d
      }
      var fixCSV = function(data) {
	  return_data = []
	  for(i = 1; i < data.length; i++) {
	      return_data.push(toNum(data[i]))
	  }
	  return return_data
      }

      function ticks(start, step, end) {
	  arr = []
	  for (i = start; i <= end; i += step) {
	      arr.push(i)
	  }
	  return arr
      }

      function futureEmissions(actYear, emissionsNow, yearNow, increaseRate, budget) {
	  // Returns future emissions given fixed budget and assumed exponential
	  // reduction path. 
	  return_arr = []
	  currentEmissions = emissionsNow
	  var i = -1
	  for (i = yearNow + 1; i < actYear; i++) {
	      currentEmissions += increaseRate*currentEmissions
	      year = {"Year": i, "Total": currentEmissions}
	      return_arr.push(year)
	      budget -= currentEmissions
	      if (budget < 0) {
		  console.log("Outa budget, sucks to suck")
		  return false
	      }
	  }
	  var e = 2.71828
	  decreaseRate = 1 - Math.pow(e,-currentEmissions/budget)
	  // From integral for exponential decline from now to infinity, consrained by budget
	  for (; i <= 2050; i++) {
	      currentEmissions -= decreaseRate * currentEmissions
	      year = {"Year": i, "Total": currentEmissions}
	      return_arr.push(year)
	      budget -= currentEmissions
	  }
	  // console.log("Final budget was: " + budget)
	  return return_arr
      }

      $scope.budget = 800 * 1000 * 12/44 // Convert from Gt CO2 to Mt C
      $scope.emissionsData = []
      $scope.futureData = []
      $scope.delayDate = 2017
      $scope.endYear = {Total: -1}
      var x = function() {console.log("x not set yet")}
      var y = function() {console.log("y not set yet")}
      var height = -1
      var width = -1
      var widthTickLimit = 500 // Smaller than this, and we remove x axis ticks

      var emissionsTicks = ticks(1960, 5, 2050)

      function makeChart() {
	  // Makes chart, assuming data is read in
	  // future_emissions = futureEmissions(2020, 36, 2015, 0.01, 800)
	  // future_emissions.map(function(d) {console.log(d.Total)})
	  var ratio = 2.0
	  var margin = {top: 30, bottom: 30, left: 50, right: 30}

	  d3.selectAll(".chart > *").remove()

	  width = d3.select("#post-20170722").style("width")
	  width = +(width.substr(0, width.length-2))
	  height = width/ratio // Should be related to width?
	  width = width - margin.left - margin.right
	  height = height - margin.top - margin.bottom

	  console.log("Width is " + width)
	  console.log("Height is " + height)

	  x = d3.scaleBand()
	      .range([0, width])
	      .padding(0.05)
	      .round(true)

	  y = d3.scaleLinear()
	      .range([height, 0]);

	  var chart = d3.select(".chart")
	      .attr("width", width + margin.left + margin.right)
	      .attr("height", height + margin.top + margin.bottom)
	      .append("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  data = $scope.emissionsData.concat($scope.futureData)
	  dataYears = data.map(function(d) {return +d.Year})
	  
	  x.domain(dataYears)
	  y.domain([0, d3.max(data, function(d) { return d.Total; })]);

	  var xAxis = d3.axisBottom(x)
	  if (width > widthTickLimit) {
	      xAxis.tickValues(emissionsTicks)
	  }
	  else {
	      xAxis.tickValues([])
	  }

	  var yAxis = d3.axisLeft(y)
	      .tickPadding(15)

	  //chart.attr("height", barHeight * data.length);

	  var bar2 = chart.selectAll("g")
	      .data(data)
	      .enter().append("g")
	      .attr("transform", function(d, i) {return "translate(" + x(d.Year) + ",0)";})
	      .attr("class", "barg")

	  bar2.append("rect")
	      .attr("class", function(d) {
		  if (d.Year <= $scope.endYear.Year) return "bar past"
		  else if (d.Year < $scope.delayDate) return "bar delay"
		  else return "bar future"
	      })
	      .attr("y", function(d) {return y(d.Total);})
	      .attr("height", function(d) {return height - y(d.Total); })
	      .attr("width", x.bandwidth());

	  chart.append("g")
	      .attr("class", "x_axis axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	      .append("text")
	      .attr("x", width/2)
	      .attr("y", margin.bottom + "px")
	      .style("text-anchor", "end")
	      .text("Year")

	  chart.append("g")
	      .attr("class", "y_axis axis")
	      .call(yAxis)
	      .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("MtC/yr")

	  var delayInput = d3.select("#delayRange")
	      .attr("type", "range")
	      .attr("min", $scope.endYear.Year + 1)
	      .attr("max", 2035)
	      .attr("ng-model", "delayDate")
	  console.log("Width before delayInput check is " + width)
	  if (width > widthTickLimit) {
	      delayInput.style("width", x(2035) - x($scope.endYear.Year + 1) + "px")
		  .style("position", "relative")
		  .style("left", x($scope.endYear.Year + 1) + margin.left + "px")
	  }
	  else {
	      delayInput.style("width", x(2050) - x(1960) + "px")
		  .style("position", "relative")
		  .style("left", x(1960) + margin.left + "px")
	  }
	      

	  chart.append("text")
	      .attr("x", width/4)
	      .attr("y", height/4)
	      .text("Delayed until: " + $scope.delayDate)
	      .attr("class", "delayDateText")
	      .style("font-size", x.bandwidth() * 3 + "px")
      }

      function getData() {
	  d3.csv("/api/emissions_csv", toNum, function(error, data) {
	      $scope.emissionsData = data
	      $scope.endYear = data[data.length - 1]
	      endYearEmissions = $scope.endYear.Total
	      endYear = $scope.endYear.Year // This is silly phrasing
	      $scope.futureData = futureEmissions($scope.delayDate, endYearEmissions,
						  endYear, 0, $scope.budget)
	      makeChart()
	  })
      }

      $scope.updateFuture = function() {
	  $scope.futureData = futureEmissions($scope.delayDate, $scope.endYear.Total,
					      $scope.endYear.Year, 0, $scope.budget)
	  data = $scope.emissionsData.concat($scope.futureData)
	  var barg = d3.selectAll(".barg").data(data) // Update data?
	      .select("rect")
	      .attr("y", function(d) {return y(d.Total);})
	      .attr("height", function(d) {return height - y(d.Total); })
	  d3.select(".delayDateText")
	      .text("Delayed until: " + $scope.delayDate)
	      .style("font-size", x.bandwidth() * 3 + "px")
	  //makeChart()
      }
      getData()
      $(window).resize(function() {
	  console.log("Resize")
	  makeChart()
      });
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
