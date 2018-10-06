var express = require('express');
// Export the express() function
var app = express();

// Route the HTTP GET request
app.get("/",function(req,res){
    res.contentType('text/html');
    res.sendFile('C:/Users/DAMAN/Desktop/Node/getpost/form.html'); 
});

// Listen for connection on given port
app.listen(3000);

console.log("Running at port 3000");