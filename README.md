# MEAN Template
This is a sample MEAN template for a generic web application that wants a robust
frontend and an even more robust backend. This is an ongoing repository that will
be routinely updated as new technologies arise and as I learn better practices.

### Technologies
The tech and instruments used in this project are as follows:

* [mongodb](https://www.mongodb.org/)
* [expressjs](http://expressjs.com/)
* [angularjs](https://angularjs.org/)
* [nodejs](https://nodejs.org/)
* [grunt](http://gruntjs.com/) 
* [sass](http://sass-lang.com/)
* and a variety of relavent plugins which can all be found in package.json

### Installation
Clone this repo and then navigate to the correct directory and run `npm install`.
After this has completed run `grunt` to make all production files, just in case.
You will need to add a config folder and add both a *db.js* and *auth.js* file that
exports JSON objects containing the db url and auth url and secrets, respectively.
