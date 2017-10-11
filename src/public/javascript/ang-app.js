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
    }).state('emissions', {
      url: '/emissions',
      templateUrl: '/html/partials/emissions.html',
      controller: 'EmissionsController'
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
	  // Returns url string (no base) without hash
	  hash = $location.hash()
	  hashSize = hash.length
	  urlWithoutHash = $location.url().substring(0, $location.url().length - hashSize - 1)
	  return urlWithoutHash
      }
      if ($location.hash() !== "") {
	  // Redirect from old style of links
	  baseUrl = removeHash()
	  $location.url(baseUrl + "/" + $location.hash())
      }
  }]);

app.factory("blogComments", ['$http', function($http) {
  return {
    getComments: function(blogPostId) {
      return $http({
	method: 'GET',
	url: '/api/comments/' + blogPostId
      });
    },
    postComment: function(comment) {
      return $http({
	method: 'POST',
	url: '/api/comment',
	dataType: 'json',
        data: comment,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
      });
    },
    baseComments: function(comments) {
      baseComments = []
      comments.forEach(function(comment) {
	if (!("parent" in comment)) {
	  baseComments.push(comment)
	}
      })
      return baseComments
    },
    modifyComment: function(newComment) {
      return $http({
	method: 'POST',
	url: '/api/modifyComment',
	dataType: 'json',
        data: newComment,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
      });
    },
    findComment: function(id, comments) {
      for (i = 0; i < comments.length; i++) {
	comment = comments[i]
	if (comment._id == id) {
	  return comment
	}
      }
    }
  }
}]);

app.controller('BlogPostController', ['$scope', '$location', '$controller',
					  '$http', '$anchorScroll', 'blogComments',
  function($scope, $location, $controller, $http, $anchorScroll, blogComments) {
    console.log("BlogPostController init!")
    $scope.name = ""
    $scope.replyComment = {text: "", name: $scope.name, blogPostId: blogPostId}
    $scope.comment = {text: "", name: $scope.name, blogPostId: blogPostId}

    var loc = {url: $location.url()}
    var locSuccess = function(response) {}
    var locFailure = function(response) {
      console.log("blogPageView Error")
      console.log(response)
    }
    $http.post('/api/blogPageView', loc).then(locSuccess, locFailure);

    function validateComment(comment) {
      if (comment.name === "") {
	alert("Please enter a name")
	return
      }
      if (comment.text === "") {
	alert("Please enter a comment")
	return
      }
    }
    
    blogComments.getComments(blogPostId)
      .success(function(comments) {
	$scope.comments = comments
	$scope.baseComments = blogComments.baseComments(comments)
      })
    
    $scope.submitComment = function() {
      $scope.comment.name = $scope.name
      validateComment($scope.comment)
      blogComments.postComment($scope.comment)
	.success(function(response) {
	  $scope.comment.text = ""
	  blogComments.getComments(blogPostId)
	    .success(function(comments) {
	      $scope.comments = comments
	      $scope.baseComments = blogComments.baseComments(comments)
	    })
	})
    }
    
    $scope.replyForm = function(parentCommentId) {
      $scope.replyComment.parent = parentCommentId
    }
    
    $scope.submitReply = function() {
      $scope.replyComment.name = $scope.name
      validateComment($scope.replyComment)
      blogComments.postComment($scope.replyComment)
	.success(function(response) {
	  $scope.replyComment.text = ""
	  replyParent = {}
	  // Find parent and add child
	  $scope.baseComments.forEach(function(comment) {
	    if ($scope.replyComment.parent == comment._id) {
	      replyParent = comment
	      replyParent.children.push(response._id)
	    }
	  })
	  blogComments.modifyComment(replyParent)
	    .success(function(modifyResponse) {
	      blogComments.getComments(blogPostId)
		.success(function(comments) {
		  $scope.comments = comments
		})
	    })
	})
    }

    $scope.findComment = function(id) {
      return_comment = blogComments.findComment(id, $scope.comments)
      return return_comment
    }

  }]);

app.controller('Blog20170722Controller', ['$scope', '$location', '$controller',
					  '$http', '$anchorScroll', 'blogComments',
  function($scope, $location, $controller, $http, $anchorScroll, blogComments) {
    blogPostId = "20170722"
    $scope.blogPostId= blogPostId
    $controller('BlogPostController', {$scope: $scope});
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
      console.log("Decrease rate is " + decreaseRate)
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

app.controller('Blog20170808Controller', ['$scope', '$window', '$location', '$controller',
					  '$http', '$anchorScroll', 'blogComments',
  function($scope, $window, $location, $controller, $http, $anchorScroll, blogComments) {
    blogPostId = "20170808"
    $scope.blogPostId= blogPostId
    $controller('BlogPostController', {$scope: $scope});
    $window.document.title = "Philadelphia's Emissions Targets"

    function futureData(start, startTotal, decreaseRate, end) {
      arr = []
      em = startTotal
      for (year = start; year <= end; year++) {
	arr.push({"Year": year, "Total": em})
	em = em * (1-decreaseRate)
      }
      return arr
    }

    function interpolate(year, year_0, year_1) {
      dy = +year_1.Total - +year_0.Total
      dx = +year_1.Year - +year_0.Year
      return year_0.Total + (dy/dx * (year - year_0.Year))
    }

    function scenarioComp(year_0, scenarios, comp_year) {
      // Outputs array of text comparing each scenario for given year. If given
      // year is not available, provides a linear interpolation between two years
      arr = []
      scenarios.forEach(function(scenario) {
	prev_year = scenario[0]
	for (i = 0; i < scenario.length; ++i) {
	  scenario_year = scenario[i]
	  year_i = scenario_year.Year
	  if (year_i == year_0) {
	    arr.push(scenario_year.Total)
	    break
	  }
	  else if (year_i > year_0) {
	    arr.push(interpolate(year_0, prev_year, scenario_year))
	    break
	  }
	  prev_year = scenario_year
	}
      })
      for (i = 0; i < arr.length; i++) {
	arr[i] = arr[i]/comp_year.Total
      }
      return arr
    }

    function makeChart() {
      var ratio = 2.0
      var margin = {top: 30, bottom: 30, left: 50, right: 30}

      width = d3.select("#post-20170808").style("width")
      width = +(width.substr(0, width.length-2))
      height = width/ratio 
      width = width - margin.left - margin.right
      height = height - margin.top - margin.bottom

      var legendTextSize = height * 0.06
      var colors = ["#1A237E", "#42B3D5", "#BDC9A9"]
      var legendFormat = d3.format(".2%")

      var pathStrokeWidth = 3

      x = d3.scaleLinear()
	.range([0, width])

      y = d3.scaleLinear()
	.range([height, 0]);

      var chart = d3.select(".chart")
	  .attr("width", width + margin.left + margin.right)
	  .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // This should be a csv I guess
      data = [
	{"Year": 1990, "Total": 21.07},
	{"Year": 2006, "Total": 22.86},
	{"Year": 2010, "Total": 21.57},
	{"Year": 2012, "Total": 20.90}
      ]
      maxData = d3.max(data, function(d) {return d.Total})
      target_2025 = {"Year": 2025, "Total": (1-0.26) * maxData}
      target_2050 = {"Year": 2050, "Total": (1-0.80) * maxData}
      data.push(target_2025)
      data.push(target_2050)
      var comp_year = 1 // 2006 is the comparison year
      lastYear = data[data.length-1]
      em_2017_est = interpolate(2017, data[3], target_2025)
      future = futureData(2017, em_2017_est, 0.045, 2050)
      equitable_future = futureData(2017, em_2017_est, 0.07, 2050)
      // Assume maximum is from when emissions are measured because
      // everyone manipulates statistics like that
      x.domain([1987, 2051])
      y.domain([0, maxData])

      var xAxis = d3.axisBottom(x),
	  yAxis = d3.axisLeft(y)

      xAxis.tickFormat(d3.format("d"))
      yAxis.tickPadding(15)
      
      /*
      chart.selectAll(".future_data")
	.data(future)
	.enter().append("circle")
	.attr("class", "future_data")
	.attr("cy", function(d) {return y(d.Total)})
	.attr("cx", function(d) {return x(d.Year)})
	.attr("r", 3)
	.attr("fill", "red")
      */
      // or
      var line = d3.line()
	  .x(function(d) { return x(d.Year); })
	  .y(function(d) { return y(d.Total); })
      line.curve(d3.curveLinear)

      /*
      var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
	    return "Hi";
	  })
      */
      count = 0
      
      chart.append("path")
	.datum(future)
	.attr("fill", "none")
	.attr("stroke", "#42B3D5")
	//.attr("stroke-linejoin", "round")
	//.attr("stroke-linecap", "round")
	.attr("stroke-width", pathStrokeWidth)
	.style("stroke-dasharray", ("5, 2"))
	.attr("d", line)
	.on("mouseover", function(d) {
	  mouseover = chart.selectAll(".mouseover")
	    .data([count])
	  mouseover.enter().append("text")
	    .attr("class", "mouseover")
	    .merge(mouseover)
	    .attr("transform", "translate(" + width/4 + "," + 3 * height / 4 + ")")
	  count += 1
	})

      chart.append("path")
	.datum(equitable_future)
	.attr("fill", "none")
	.attr("stroke", "#BDC9A9")
	//.attr("stroke-linejoin", "round")
	//.attr("stroke-linecap", "round")
	.attr("stroke-width", pathStrokeWidth)
	.style("stroke-dasharray", ("5, 2"))
	.attr("d", line)

      chart.append("g")
	.attr("class", "x_axis axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)

      chart.append("g")
	.attr("class", "y_axis axis")
	.call(yAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("Mt CO2e/yr")

      chart.append("path")
	.datum(data)
	.attr("fill", "none")
	.attr("stroke", "#1A237E")
	.attr("stroke-linejoin", "round")
	.attr("stroke-linecap", "round")
	.attr("stroke-width", pathStrokeWidth)
	.attr("d", line);

      var bar = chart.selectAll("circle")
	  .data(data)
	  .enter().append("circle")
      	  .attr("class", "circle")
	  .attr("cy", function(d) {return y(d.Total)})
	  .attr("cx", function(d) {return x(d.Year)})
	  .attr("r", 3)
	  .attr("fill", "#1A237E")

      line = chart.append("line")
	.attr("display", "none")
      
      chart.append("rect")
	.attr("class", "overlay")
	.attr("width", width)
	.attr("height", height)
	.attr("fill", "transparent")
	//.attr("fill", "none")
	.on("mouseover", function() {
	  line.style("display", null);
	})
	//.on("mouseout", function() {
	//  line.style("display", "none");
	//  makeLegend([], [NaN, NaN, NaN])
	//})
	.on("mousemove", mousemove);

      function makeLegend(prefix, text) {
	var legend = chart.selectAll(".legend")
	legend.data(text)
	  .enter().append("text")
	  .attr("class", "legend")
	  .merge(legend)
	  .attr("transform", function(d, i) {
	    transx = width/4
	    transy = height * 3/4 - (i * legendTextSize)
	    return "translate(" + width/4 + "," + ((height * 3 / 4) + (i * legendTextSize)) + ")"
	  })
	  .text(function(d, i) {
	    if (d) {
	      return prefix[i] + legendFormat(d)
	    }
	    else {
	      return " - "
	    }
	  })
	  .style("font-size", legendTextSize + "px")
	  .style("fill", function(d, i) {return colors[i]})
	  .style("font-weight", "bold")
      }

      function mousemove() {
	var x0 = d3.mouse(this)[0]
	var year = parseInt(x.invert(x0))
	x0 = x(year)
	var prefix = []
	if (year < 2017 && year >= 1990) {
	  prefix = ["Estimate: ", "", ""]
	}
	else if (year > 2016) {
	  prefix = ["Target: ", "Minimum 2C: ", "Equitable 2C: "]
	}
	scenarios = scenarioComp(year, [data, future, equitable_future], data[comp_year])
	makeLegend(prefix, scenarios)
	
	line.attr("display", null)
	  .style("stroke", "black")  // colour the line
	  .attr("x1", x0)     // x position of the first end of the line
	  .attr("y1", 0)      // y position of the first end of the line
	  .attr("x2", x0)     // x position of the second end of the line
	  .attr("y2", height);
      }
    }
    makeChart()
  }]);

app.controller('Blog20170830Controller', ['$scope', '$window', '$location', '$controller',
					  '$http', '$anchorScroll', 'blogComments',
  function($scope, $window, $location, $controller, $http, $anchorScroll, blogComments) {
    blogPostId = "20170830"
    $scope.blogPostId= blogPostId
    $controller('BlogPostController', {$scope: $scope});
    $window.document.title = "Harvey and Our Future"
  }]);

app.controller('Blog20170913Controller', ['$scope', '$window', '$location', '$controller',
					  '$http', '$anchorScroll', 'blogComments',
  function($scope, $window, $location, $controller, $http, $anchorScroll, blogComments) {
    blogPostId = "20170913"
    $scope.blogPostId= blogPostId
    $controller('BlogPostController', {$scope: $scope});
    $window.document.title = "Bike Lanes"

    /*
    width = d3.select("#post-20170913").style("width")
    width = +width.substring(0, width.length - 2)
    height = width * 0.65
    console.log(width, height)

    var projection = d3.geoMercator()
	.center([-75.12, 39.995])
	.scale(width * 100)
	.translate([width / 2, height / 2]);

    var svg = d3.select("svg")
	.attr("width", width)
	.attr("height", height);

    var streets;
    var bikelanes;

    d3.json("api/maps/philastreets.json", function(err, city) {
      if (err) return console.error(err);
      console.log(city)

      var subunits = topojson.feature(us, uk.objects.subunits);
      var testing = topojson.feature(uk, uk.objects.places)
      console.log(testing)


      streets = topojson.feature(city, city.objects.streets).features
      bikelanes = topojson.feature(city, city.objects.bikelanes).features
      console.log(bikelanes)
      svg.selectAll(".street")
	.data(streets)
	.enter().append("path")
	.attr("class", "street")
	.attr("d", d3.geoPath().projection(projection))
	.style("fill", "none")
	.style("stroke", "#C5C2FF")

      svg.selectAll(".bikelane")
      	.data(bikelanes)
	.enter().append("path")
	.attr("class", "street")
	.attr("d", d3.geoPath().projection(projection))
	.style("fill", "none")
	.style("stroke", "blue")
    })

    var updateChart = function() {
      width = d3.select("#post-20170913").style("width")
      width = +width.substring(0, width.length-2)
      height = width * 0.65

      var svg = d3.select("svg")
	  .attr("width", width)
	  .attr("height", height);

      projection = d3.geoMercator()
	  .center([-75.12, 39.995])
	  .scale(width * 100)
	.translate([width / 2, height / 2]);

      svg.selectAll(".street")
	.attr("d", d3.geoPath().projection(projection))
    }
    
    $(window).resize(function() {
      console.log("Resize")
      updateChart()
    });

      
      var path = d3.geoPath()
	  .projection(projection)
      svg.selectAll(".subunit")
	.data(subunits.features)
	.enter().append("path")
	.attr("class", function(d) {
	  console.log(d.properties.SU_A3)
	  return "subunit " + d.properties.SU_A3; })
	.attr("d", path);
      */
  }]);

app.controller('EmissionsController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {
    // Controller for emissions sliders

    var toPeak = function(lastYear, ePrimeLastYear, peakYear, year0) {
      toPeakYears = []
      toPeakYears.push(lastYear)
      if (lastYear.em > peakYear.em) {
	console.log("Dragged it too low dipshit")
	return []
      }
      var peak_year = Math.floor(peakYear.year)
      var x_half = (peakYear.year - lastYear.year) * 0.5
      var delta_em = peakYear.em - lastYear.em
      var edge = 1/2 * x_half * ePrimeLastYear

      var y = -1
      var em_y = -1
      if (delta_em < edge) {
	yearFlat = 2 * delta_em / ePrimeLastYear + 2016
	m = -ePrimeLastYear / (yearFlat - 2016) // m
	var C = lastYear.em - ePrimeLastYear * lastYear.year + (m * lastYear.year * lastYear.year)/2
	// f((y) = E(2016) +  E'y + my^2/2 - 2016my
	var f = function(y) {
	  return C + ePrimeLastYear * y + m*y*y/2 - 2016 * m * y
	}
	em_y = f(lastYear.year)
	for (y = lastYear.year + 1; y <= yearFlat; ++y) {
	  em_y = f(y)
	  year_i = {
	    year: y,
	    em: em_y
	  }
	  toPeakYears.push(year_i)
	}
	for (; y <= peak_year; ++y) {
	  year_i = {
	    year: y,
	    em: em_y
	  }
	  toPeakYears.push(year_i)
	}
	return toPeakYears
      }
      
      else {
	var h = delta_em/x_half - 0.5 * ePrimeLastYear
	var m1 = (h - ePrimeLastYear) / x_half
	var C1 = lastYear.em - ePrimeLastYear * lastYear.year +
	    m1 / 2 * lastYear.year * lastYear.year

	var f1 = function(y) {
	  return C1 + ePrimeLastYear * y + m1*y*y/2 - lastYear.year * m1 * y
	}
	
	for (y = lastYear.year + 1; y <= lastYear.year + x_half; ++y) {
	  em_y = f1(y)
	  year_i = {
	    year: y,
	    em: em_y
	  }
	  toPeakYears.push(year_i)
	}

	var m2 = h / x_half
	var f1ph = ePrimeLastYear + m1 * (x_half)
	var C2 = peakYear.em + m2 * peakYear.year * peakYear.year / 2 - f1ph * peakYear.year -
	    m2 * (x_half + lastYear.year) * peakYear.year

	var f2 = function(y) {
	  return C2 + f1ph * y - m2 * y * y / 2 + m2 * y * (lastYear.year + x_half)
	}

	for (; y <= peak_year; ++y) {
	  em_y = f2(y)
	  year_i = {
	    year: y,
	    em: em_y
	  }
	  toPeakYears.push(year_i)
	}
	
	return toPeakYears
      }
    }

    var peakTo0 = function(peakYear, year0) {
      var pad = 0.01
      var emPad = pad * peakYear.em
      var years = []
      peak_year = Math.floor(peakYear.year)

      var f = function(y) {
	// return A * exp(-y^2/(2 * c))
	var A = peakYear.em
	var c = -1 * Math.pow((year0.year - peakYear.year), 2) / (2 * Math.log(pad))
	return A * Math.exp(-1 * Math.pow((y - peakYear.year), 2) / (2 * c))
      }
      for (var y = peak_year + 1; y < year0.year; ++y) {
	year = {
	  year: y,
	  em: f(y)
	}
	years.push(year)
      }
      return years
    }

    var futureData = function(hist, peak, em0) {
      var finalYear = 2100
      var histToPeak = toPeak(hist[hist.length - 1], 0.5, peak, em0)
      var peakToZero = peakTo0(peak, em0)
      var zeroToEnd = []
      for (var y = Math.floor(em0.year); y < finalYear; ++y) {
	zeroToEnd.push({year: y, em: 0})
      }
      return histToPeak.concat(peakToZero).concat(zeroToEnd)
    }

    var sumEm = function(years) {
      sum = 0
      years.forEach(function(year) {
	sum += year.em
      })
      return sum
    }

    var divideEmissions = function(futureData, budgetThresholds) {
      // Divides emissions into n+1 parts, where n is length of budgetThresholds
      var sum = 0
      var i = 0
      var threshold = budgetThresholds[0]
      var retarr = [[]]
      futureData.forEach(function(y) {
	sum += y.em
	if (sum > threshold) {
	  retarr[i].push(y) // Need duplicates for fill to work
	  retarr.push([])
	  i += 1
	  if (i < budgetThresholds.length) {
	    threshold = budgetThresholds[i]
	  }
	  else {
	    threshold = Number.MAX_VALUE
	  }
	}
	retarr[i].push(y)
      })
      while (retarr.length < budgetThresholds.length + 1) {
	retarr.push([])
      }
      return retarr
    }

    var toNum = function(d) {
      d.year = +d.Year
      d.em = (+d.Total) * (44/12000)
      return d
    }
    
    var margin = {top: 10, right: 20, bottom: 30, left: 40}
    var thresholds2011 = [400, 1000, 2400]
    var thresholss2017 = []
    var default_peak = {year: 2050, em: 60}
    var paris_peak = {year: 2030, em: 38.5}
    var committed_peak = {year: 2017, em: 36.51}
    var committed_em0 = {year: 2064.5, em: 0}
    var peak = Object.assign({}, default_peak)
    var em0 = {year: 2080, em: 1}
    var histData = []

    $scope.paris = function() {
      peak = Object.assign({}, paris_peak)
      var future = futureData(histData, peak, em0)
      var futureArr = divideEmissions(future, thresholds2017)
      updateFuture(futureArr)
      updatePeak(peak)
      updateLegend(futureArr)
    }

    $scope.committed = function() {
      peak = Object.assign({}, committed_peak)
      em0 = Object.assign({}, committed_em0)
      var future = futureData(histData, peak, em0)
      var futureArr = divideEmissions(future, thresholds2017)
      updateFuture(futureArr)
      updatePeak(peak)
      updateEm0(em0)
      updateLegend(futureArr)
    }

    var thresholdsTranslate = function(y1, y2, y1Thresholds, years) {
      var thresholds = y1Thresholds.slice() // Copy y1Thresholds
      for (i = 0; i < years.length; i++) {
	yearObj = years[i]
	year = yearObj.year
	if (year >= y1 && year < y2) {
	  em = yearObj.em
	  for (j = 0; j < thresholds.length; ++j) {
	    thresholds[j] -= em
	  }
	}
      }
      return thresholds
    }
    
    d3.csv("/api/emissions_csv", toNum, function(error, data) {
      histData = data
      var future = futureData(histData, peak, em0)
      thresholds2017 = thresholdsTranslate(2011, 2017, thresholds2011, data)
      var futureArr = divideEmissions(future, thresholds2017)
      makeChart(histData, futureArr)
    })

    width = 1000 - margin.left - margin.right
    height = 600 - margin.bottom - margin.top
    var chart = d3.select(".chartDiv")
	.append("svg")
	.attr("class", "emissionsChart")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom + margin.top)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleLinear()
      .domain([1955, 2100])
      .range([0, width])
    
    y = d3.scaleLinear()
      .domain([0, 60])
      .range([height, 0])

    var area = d3.area()
	.x(function(d) {return x(d.year)})
	.y0(height)
	.y1(function(d) {return y(d.em)})

    var colors = ["#fef0d9", "#fdcc8a", "#fc8d59", "#d7301f"]

    function drawHist(hist) {
      // Draws hist on graph. Does not update or delete old hists
      chart.append("path")
	.datum(hist)
	.attr("d", area)
	.attr("class", "hist")
	.style("fill", "grey")
    }

    function drawFuture(futureArr) {
      chart.selectAll(".future")
	.data(futureArr, function(d, i) {return i})
	.enter().append("path")
      	.attr("d", area)
	.attr("class", "future")
	.style("fill", function(d, i) {
	  return colors[i]
	})
    }

    function drawLegend(futureArr) {
      var future = [].concat.apply([], futureArr); // Flatten array
      var sum = sumEm(future)

      chart.append("text")
	.datum(sum)
	.attr("class", "legend")
	.attr("transform", function(d, i) {
	  transx = width/4
	  transy = height * 3/4
	  return "translate(" + width*3/4 + "," + ((height * 1 / 4)) + ")"
	})
	.text(function(d) {return d})
	.style("fill", "blue")
	.style("font-size", "20px")
    }

    function updateLegend(futureArr) {
      var future = [].concat.apply([], futureArr); // Flatten array
      var sum = sumEm(future)
      chart.select(".legend")
	.datum(sum)
	.text(function(d) {return d})
    }

    function updateFuture(futureArr) {
      chart.selectAll(".future")
	.data(futureArr)
	.attr("d", area)
	.style("fill", function(d, i) {return colors[i]})
    }

    function drawNodes(defaultPeak, default0, histData) {
      
      function dragged_peak(d) {
	d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
	peak.year = x.invert(d3.event.x)
	peak.em = y.invert(d3.event.y)
	future = futureData(histData, peak, em0)
	futureArr = divideEmissions(future, thresholds2017)
	updateFuture(futureArr)
	updateLegend(futureArr)
	updateBarWidth(futureArr)
      }

      function dragged_0(d) {
	d3.select(this).attr("cx", d3.event.x);
	em0.year = x.invert(d3.event.x)
	future = futureData(histData, peak, em0)
	futureArr = divideEmissions(future, thresholds2017)
	updateFuture(futureArr)
	updateLegend(futureArr)
      }

      var r = 15
      chart.append("circle")
	.datum(peak)
	.attr("cx", function(d) {return x(d.year)})
	.attr("cy", function(d) {return y(d.em)})
	.attr("r", r)
	.attr("class", "peak")
	.style("fill", "white")
	.style("stroke", "grey")
	.call(d3.drag().on("drag", dragged_peak))

      chart.append("circle")
	.datum(em0)
	.attr("cx", function(d) {return x(d.year)})
	.attr("cy", y(0) - r)
	.attr("r", r)
	.attr("class", "em0")
	.style("fill", "white")
	.style("stroke", "grey")
	.call(d3.drag().on("drag", dragged_0))
    }

    function updatePeak(peak) {
      d3.select(".peak")
	.datum(peak)
	.attr("cx", function(d) {return x(d.year)})
	.attr("cy", function(d) {return y(d.em)})
    }

    function updateEm0(em0) {
      d3.select(".em0")
	.datum(em0)
	.attr("cx", function(d) {return x(d.year)})
	.attr("cy", function(d) {return y(d.em)})
    }

    function drawAxes() {
      var xAxis = d3.axisBottom(x),
	  yAxis = d3.axisLeft(y)

      xAxis.tickFormat(d3.format("d"))
      yAxis.tickPadding(15)
      
      chart.append("g")
	.attr("class", "x_axis axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)

      chart.append("g")
	.attr("class", "y_axis axis")
	.call(yAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("Mt CO2/yr")
    }

    function makeChart(histData, futureArr) {
      drawHist(histData)
      drawFuture(futureArr)
      drawLegend(futureArr)
      drawNodes(peak, em0, histData)
      drawAxes()
      makeBarChart(sumEm(futureArr))
    }

    function find(exceedanceData, emissions) {
      prevDatum = exceedanceData[0]
      if (emissions < prevDatum.smooth) {
	return -1 // -1 if emissions are too small for dataset
      }
      for (i = 0; i < exceedanceData.length; ++i) {
	datum = exceedanceData[i]
	if (emissions < datum.em && emissions > prevDatum.em) {
	  return i
	}
      }
      return exceedanceData.length // If it's beyond dataset, return length of dataset
    }

    function estimateExceedanceProbability(exceedanceData, emissions){
      console.log(exceedanceData)
      index = find(exceedanceData, emissions)
      console.log(exceedanceData.length)
      console.log(index)
      ret = exceedanceData[find(exceedanceData, emissions)]
      console.log(ret)
      return ret.Smooth
    }

    function makeBarChart(emissionsSum) {
      console.log(emissionsSum)
      var barGraphWidth = 400
      var barGraphHeight = 800
      var barChart = d3.select(".chartDiv")
	  .append("svg")
	  .attr("class", "barChart")

      var barX = d3.scaleLinear()
	  .range([0, barGraphWidth])
	  .domain([0, 1])

      var tempDict = {}

      function num(d) {
	d.em = +d.Emissions
	return d
      }

      d3.csv("/api/budget_prob/two.csv", num, function(error, data) {
	tempDict.two = data
	barChart.append("rect")
	  .datum(estimateExceedanceProbability(tempDict.two, emissionsSum))
	  .attr("class", "bar")
	  .attr("height", 100)
	  .attr("width", function(d) {return barX(d)})
      })
    }

    function updateBarWidth(futureArr) {
      var sum = sumEm(future)
      barChart.select(".bar")
	.datum(estimateExceedanceProbability(tempDict.two, emissionsSum))
	.attr("width", function(d) {return barX(d)})
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
