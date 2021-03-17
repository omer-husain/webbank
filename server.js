// Student name: Omer Husain

// Student: 129146197

// Insturctor: George Tsang

// Assignment3 - Web 322 - Web Bank

// Date: March 15, 2021


//references(course materials)
// reference: Node express routing.js  
//reference:  npm fsreadfile.js
//reference: ES6 JSONparese.js
//reference: npm fsreadfilessyncwritefiles.js
//reference npm pathjoin.js
//reference npm express-handlebars.js
//reference Express reqcookies.js
//reference npm express-session.js


//Other resources
//stackoverflow article on how to reference css jss files correctly using path
//https://stackoverflow.com/questions/45395947/what-is-the-proper-way-of-referencing-css-and-js-files-with-handlebars
//https://flaviocopes.com/express-forms/


const HTTP_PORT = process.env.PORT || 3000;
const express = require("express");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const randomSTR = require("randomstring");


const app = express();
//not using body-parser as it as been replaced within express itself as express 4.16 (body-parser is older)



//line below reference - for post form data - referenced from https://flaviocopes.com/express-forms/
app.use(urlencoded({ extended: true }));   

app.use(express.json());        //parse JSON 

var data = readFileData();    //reads user.json file - key value pairings for username and password

//line below referenced from stackoverflow to properly link CSS and JS files. Also studying in textbook pg. 
app.use(express.static(path.join(__dirname, '/public')));

app.engine(".hbs", exphbs({ 												//	1st parameter: "hbs" is to be the internal engine name for express-handlebars
    extname: ".hbs",                                                        //  2nd parameter: callback that    1. specifies the extension name,
    defaultLayout: false,                                                   //                                  2. override the default template layout of "main",
    layoutsDir: path.join(__dirname, "/views")                              //                                  3. identifies the template directory
}));

app.set("view engine", ".hbs");

app.get("/", (req, res) => {                                           //  Set up viewData route to "render" the handlebars file with data

    res.render('index', {                                                //  Invokes the render method on the response (res) object
        // data: someData
    });

});


app.get("/balance", (req, res) => {                                           //  Set up viewData route to "render" the handlebars file with data

    res.render('balance', {                                                //  Invokes the render method on the response (res) object
        // data: someData
    });

});


app.get("*", (req, res) => {
    res.send(`FAILED! Fix your URL.`);
});


app.post("/", (req, res) => {


    var iUsername = req.body.username;
    var iPassword = req.body.password;


    var someData = {
        user: iUsername
    };

    var messageData = {
        message: errorCheck(iUsername, iPassword),
        visible: true
    };

    if (userValidation(iUsername, iPassword)) {

        res.render('bank', {                                                //  Invokes the render method on the response (res) object
            data: someData
        });

    } else {
        res.render('index', {
            data: messageData
        });
    }

});



app.post('/bankForm', (req, res) => {

    var selectionValue = req.body.select;
    console.log(selectionValue);

});



const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});



//functions
function readFileData() {
    var rawData = fs.readFileSync("./user.json");
    var data = JSON.parse(rawData);
    return data;
}

function writeFileData(data) {
    fs.writeFile("test1.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;

        console.log("File successfully updated.");
    });
}

function displayObjectData(data) {
    console.log("==============================================");
    console.log(data);
    console.log("==============================================");
}


function userValidation(username, password) {
    userCheck = data.hasOwnProperty(username);        //boolean variables
    passCheck = (data[username] === password);   //boolean variables

    if (userCheck && passCheck) {
        console.log(username, " is validated");
        return true;
    }

    else {
        console.log(username, " is not validated!")
        return false;
    }
}


function errorCheck(username, password) {
    if (data.hasOwnProperty(username) === false) {
        return errorMessage(1);
    }

    if (data.hasOwnProperty(username) === true) {
        if (data[username] !== password) {
            return errorMessage(2);
        }
    }
}


function errorMessage(code) {

    switch (code) {
        case 1:
            errorString = "Not a registered username";
            return errorString;
            break;
        case 2:
            errorString = "Invalid password";
            return errorString;
            break;
        default:
            errorString = "Unknown Error";
            return errorString;

    }

}

