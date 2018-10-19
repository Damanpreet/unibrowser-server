//import Modules
var fs = require('fs'),
	mongoose = require('mongoose');
var assert = require('assert');
var data = fs.readFileSync('config.json', 'utf8');
var config = JSON.parse(data);
const Professor = require(config.rootDir+'/models/Professor.js');
const request = require('supertest');
var app = require('../src/index');
// console.log(app._router.stack);

// Getting the database up and running
var dbString = "mongodb://" +
    config.dbUsername + ':' +
    config.dbPassword + '@' +
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

// Describe tests
describe("Saving records", function() {

	// Create tests
	it("Save a record to the database", function(done) {
		
		var Prof = new Professor({
			Heading : "String",
			Content : "String",
			URL : "String",
			Tags : ["Array"],
			Rank : 1
		});
		
		Prof.save(err => {
			if (err) console.log("error occured", err);
			else {
				console.log("saved test prof");
			}
		}).then(function() {			
			assert.equal(Prof.isNew, false); //returns False if it has been saved to the DB
			done();	
		});

	});
});


describe('/GET route', () => {
     it('Check using the name of the professor', (done) => {
		request(app)
			.get('/submit?name=Arwig')
			.expect('content-type', 'application/json; charset=utf-8')
			.expect(200)
			.end((err, res) => {
				if (err) {
					console.log(err);
					throw err;
				}
			
				//var arr = res.text;
				// console.log(res.body);
				
				res.body.forEach((element) => {
					console.log(element);
					assert.ok(element.name.contains("Martin"));
				});

			});
		done();
	 });
});