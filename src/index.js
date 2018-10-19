// include modules
var express = require('express'),
    // Instantiating express module
    app = express(),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    logger = require('js-logger'),
    less = require('less-middleware'),
    db,
    mongodb = require('mongodb'),  
    MongoClient = mongodb.MongoClient;    

// Compile and serve CSS
app.use(less(path.join(__dirname,'source','less'),{
    dest: path.join(__dirname, 'public'),
    options: {
        compiler: {
            compress: false,
        },
    },
    preprocess: {
        path: function(pathname, req) {
            return pathname.replace('/css/','/');
        },
    },
    force: true,
}));

// Serve static content
app.use(express.static(path.join(__dirname, 'public')));

var data = fs.readFileSync('config.json', 'utf8');
var config = JSON.parse(data);

// Getting the database up and running
var dbString = "mongodb://" +
    config.dbUsername + ':' +
    config.dbPassword + '@' +
    config.dbUrl + ":" +
    config.dbPort + "/" +
    config.dbName;

var url = "mongodb://" +
    config.dbUrl + ":" +
    config.dbPort + "/" +
    config.dbName;

mongoose.connect(dbString, function(error) {
  if (!error) {
    logger.info('local mongodb connected');
  } else {
      logger.error(dbString + ' mongodb not connected ' + error);
    }
});

const Professor = require(config.rootDir+'/models/Professor.js');

// Route the HTTP GET request
app.get("/",function(req,res){
    res.contentType('text/html');
    res.sendFile(config.rootDir + '/SearchPage.html');
});

console.log(dbString);

MongoClient.connect(url, function (err, database) {
    if (err) {
    throw err;
    }
    else {
        db = database;
        console.log("connected to DB");
    }
});


/*
* Get method 
*/
app.get("/submit", function(req,res){
    /*
    * storing the user passed string in a variable
    */
    var queryString=req.query['name'];

    /*
    * define the criteria to sort the results.
    */
    var mysort = { name: 1 };

    /*
    * Excluding the ID field while displaying results.
    */
    db.collection('professor').find({"name": {$regex:queryString}}, { _id: 0 }).sort(mysort).toArray(function(err,result){
        if(err) throw err;

        /*
        * If the string searched is a professor name, result will return an array.
        * check array contains information.
        */
        if (result.length!=0){
            console.log("Found name.");
            // console.log(result);
            res.send(result);
            db.close();
        }

        /*
        * If the string searched is not a professor name or no matching results in the name field, result will be null.
        */
        else{
            console.log("Could not find name.");

            /*
            * check if the string is a research area of a professor
            */
            db.collection('professor').find({"research": {$regex:queryString}}, { _id: 0 }).sort(mysort).toArray(function(err,result){
                if(err) throw err;
        
                /*
                * if the string looked for is a research area of a professor, return all the professors with the given research interest.
                */
                if (result.length!=0){
                    console.log("Found professors with similar research.");                    
                    res.send(result);
                    db.close();
                }
                
                else{
                    console.log("Could not find professors with similar research.");

                    /*
                    * check if the string is contact information for a professor
                    */
                    db.collection('professor').find({"contact": {$regex:queryString}}, { _id: 0 }).sort(mysort).toArray(function(err,result){
                        if(err) throw err;
                        
                        if (result.length!=0){
                            console.log("found professors.");                            
                            res.send(result);
                            db.close();
                        }
                        
                        else{
                            console.log("Could not find professors.");
                            res.send(404)
                        }
                    });
                }
            });
        }
    });
});

// setup server
var server = app.listen(1337);
// console.log(app._router.stack);

module.exports = app;