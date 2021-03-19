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
//reference npm client-sessions.js
//https://www.npmjs.com/package/express-session


//Other resources
//stackoverflow article on how to reference css jss files correctly using path
//https://stackoverflow.com/questions/45395947/what-is-the-proper-way-of-referencing-css-and-js-files-with-handlebars
//https://flaviocopes.com/express-forms/


const HTTP_PORT = process.env.PORT || 3000;
const express = require("express");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const session = require("client-sessions");
const bodyParser = require("body-parser");
const randomStr = require("randomstring");
const e = require("express");
const { timeStamp } = require("console");
const { parse } = require("path");
const userPath = "./user.json";
const accountsPath = "./accounts.json";
var myAccountSelection;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());        //parse JSON 

var userData = readFileData(userPath);    //reads user.json file
var accountsData = readFileData(accountsPath);   //reads accounts.json file

//line below referenced from stackoverflow to properly link CSS and JS files. Also studying in textbook pg. 
app.use(express.static(path.join(__dirname, '/public')));

app.engine(".hbs", exphbs({ 												//	1st parameter: "hbs" is to be the internal engine name for express-handlebars
    extname: ".hbs",                                                        //  2nd parameter: callback that    1. specifies the extension name,
    defaultLayout: false,                                                   //                                  2. override the default template layout of "main",
    layoutsDir: path.join(__dirname, "/views")                              //                                  3. identifies the template directory
}));

app.set("view engine", ".hbs");

var strRandom = randomStr.generate();

//reference from course materials - npm client-sessions.js
app.use(session({															//	add session handler middleware

    cookieName: "MySession",
    secret: strRandom,      												//	random string
    duration: 5 * 60 * 1000,												//	5 minutes
    activeDuration: 1 * 60 * 1000,											//	1 minutes
    httpOnly: true,                                                         //  prevents browser JavaScript from accessing cookies
    secure: true,                                                           //  ensures cookies are only used over https
    ephemeral: true                                                         //  deletes the cookie when the browser is closed

}));


//app.gets 

app.get("/", (req, res) => {

    req.MySession.user = "Unknown";
    res.render('index', {                                                //  Invokes the render method on the response (res) object
    });

});

app.get("*", (req, res) => {
    res.send(`FAILED! Fix your URL.`);
});


//app.posts
app.post("/", (req, res) => {
    var iUsername = req.body.username;
    var iPassword = req.body.password;

    var messageData = {
        message: errorCheck(iUsername, iPassword),
        visible: true
    };

    if (userValidation(iUsername, iPassword)) {

        req.MySession.user = req.body.username;

        var someData = {
            user: req.MySession.user
        };


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
    var accountNum = req.body.accountNumber;


    console.log(selectionValue);

    var messageData = {
        message: statusMessage(3),
        visible: true,
        user: req.MySession.user
    };

    if (selectionValue == "openAccount" && accountNum == "") {
        res.render('accountopen', {
        });
        return;   //exits POST function
    }

    if (checkValidAccount(accountNum) && selectionValue !== "openAccount" && selectionValue !== "") {
        myAccount = formatAccNumber(accountNum);
        console.log(myAccount);
        selectionRender(selectionValue, res, myAccount);    //invokes function to render appropriate page based on user selection
        myAccountSelection = myAccount;
    }
    else {
        res.render('bank', {
            data: messageData
        });

    }


});

app.post("/returnBank", (req, res) => {

    var someData = {
        user: req.MySession.user
    };

    res.render('bank', {
        data: someData
    });

});

app.post('/accountOpen', (req, res) => {
    console.log("account open");
    var type = req.body.accountSelection;
    var acctNum = createAcctNum();
    console.log("This data is being fed into createAccount:  " + acctNum);
    createAccount(acctNum, type, req, res);

});

app.post('/depositForm', (req, res) => {

    var amount = req.body.depositAmount;
    console.log(amount);

    tempObj = readFileData(accountsPath);

    if (myAccountSelection == "") {
        console.log("Account not correctly selected")
    }
    else {
        depositAccount(myAccountSelection, amount)
        var someData = {
            user: req.MySession.user
        };

        res.render('bank', {
            data: someData
        });
    }



});

app.post('/withdrawalForm', (req, res) => {

    var amount = req.body.withdrawAmount;
    console.log(amount);

    if (myAccountSelection == "") {
        console.log("Account not correctly selected")
    }
    else {
        withdrawAccount(myAccountSelection, amount, req, res)
    }


});


app.post("/reset", (req, res) => {

    req.MySession.reset();

    res.render('index', {
    });

});

const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});



//functions
function readFileData(path) {
    var rawData = fs.readFileSync(path);
    var data = JSON.parse(rawData);
    return data;
}

//./accounts.json
function writeFileData(data, path) {
    fs.writeFile(path, JSON.stringify(data, null, 4), function (err) {
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
    userCheck = userData.hasOwnProperty(username);        //boolean variables
    passCheck = (userData[username] === password);   //boolean variables

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
    if (userData.hasOwnProperty(username) === false) {
        return statusMessage(1);
    }

    if (userData.hasOwnProperty(username) === true) {
        if (userData[username] !== password) {
            return statusMessage(2);
        }
    }
}


function statusMessage(code) {

    switch (code) {
        case 1:
            string = "Not a registered username";
            return string;
            break;
        case 2:
            string = "Invalid password";
            return string;
            break;
        case 3:
            string = "Invalid Account Number";
            return string;
            break;
        case 4:
            string = "Insufficient Funds";
            return string;
            break;

        default:
            string = "Unknown Error";
            return string;

    }

}

function selectionRender(selection, res, myAccount) {

    tempObj = readFileData(accountsPath);

    var accountID = { accountID: myAccount };
    accountData = tempObj[myAccount];

    console.log(accountData);

    switch (selection) {
        case "balance":
            res.render('balance', {
                data: accountData,
                data1: accountID
            });
            console.log(accountsData);
            break;
        case "deposit":
            res.render('deposit', {
                data: accountData,
                data1: accountID
            });
            break;

        case "withdrawal":
            res.render('withdrawal', {
                data: accountData,
                data1: accountID
            });
            break;
        default:
            res.render('bank', {
            });
    }
}

function checkValidAccount(accountNum) {   // checks if account is in accountsData javascript object

    if (accountsData.hasOwnProperty(formatAccNumber(accountNum))) {
        //create an myAccount object with all necessary data needed to render
        return true;
    }
    else {
        console.log("not valid account number");
        myAccount = null;
        return false;
    }

}


function formatAccNumber(number, size = 7) {   //Function to add leading zero(s)   default value is of size is 7 to match account data

    formatNumber = number.padStart(size, '0');
    return formatNumber;

}


function depositAccount(acctNum, amount) {


    var balance = tempObj[acctNum].accountBalance;

    console.log("balance before: " + balance);

    balance = parseFloat(balance, 10);
    amount = parseFloat(amount, 10);

    console.log("balance float: " + balance);

    balance = balance + amount;

    console.log("after addition balance: " + balance);

    tempObj[acctNum] = { "accountType": tempObj[acctNum].accountType, "accountBalance": balance };

    console.log(tempObj);

    writeFileData(tempObj, accountsPath);


}

function withdrawAccount(acctNum, amount, req, res) {
    var balance = tempObj[acctNum].accountBalance;

    var messageData = {
        message: statusMessage(4),
        visible: true,
        user: req.MySession.user
    };

    var userData = {
        user: req.MySession.user
    }


    console.log("balance before: " + balance);

    balance = parseFloat(balance, 10);
    amount = parseFloat(amount, 10);

    console.log("balance float: " + balance);

    if (amount > balance) {
        console.log("Cannot Withdrawal more than Account Balance");

        res.render('bank', {
            data: messageData
        });

    }

    else {
        balance = balance - amount;

        console.log("after subtraction balance: " + balance);

        tempObj[acctNum] = { "accountType": tempObj[acctNum].accountType, "accountBalance": balance };

        console.log(tempObj);

        writeFileData(tempObj, accountsPath);

        res.render('bank', {
            data: userData
        });

    }




}

function createAccount(acctNum, type, req, res) {

    var change = false;
    tempObj = readFileData(accountsPath);

    if (tempObj.hasOwnProperty("acctNum"))
        change = false;
    else {
        (tempObj[acctNum] = { "accountType": type, "accountBalance": 0.0 });
        change = true;
    }

    if (change) {
        tempObj["lastID"] = acctNum;
        writeFileData(tempObj, accountsPath);

        var someData = {
            user: req.MySession.user
        }

        var messageData = {
            accountID: acctNum,
            accountType: type,
            visible: true
        };

        res.render('bank', {
            data: someData,
            data1: messageData
        });

    }


    console.log(tempObj);
}

function checkLastID() {
    tempObj = readFileData(accountsPath);
    lastID = tempObj["lastID"];
    console.log("Last ID is: " + lastID);
    return lastID;
}

function createAcctNum() {
    tempObj = readFileData(accountsPath);
    lastID = checkLastID();
    var tempNum;
    var acctNumber;
    tempNum = parseInt(lastID, 10);
    tempNum++;
    acctNumber = tempNum.toString();

    acctNumber = formatAccNumber(acctNumber);

    while (tempObj.hasOwnProperty(acctNumber)) {
        console.log("Account number already exists: " + tempObj.hasOwnProperty(acctNumber));
        tempNum++;
        acctNumber = tempNum.toString();
    }

    acctNumber = formatAccNumber(acctNumber);
    console.log(acctNumber);
    return acctNumber;
}



