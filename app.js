const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const $ = require("jquery");

const app = express();

app.set("view engine", "ejs"); // Set the use of EJS template

app.use(express.static("public")); // Declare that public folder is static

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret: "Shh, its a secret!",
    cookie:{
        maxAge: 6000
    }
}));

/* Database declaration and connection*/
//const mongooseURL = "mongodb://localhost:27017/todoListDB";
const pass = "test123";
const dbName = "ToDoListDB";
const MongoDBuserName = "manhhuyvo";
const mongooseURL = "mongodb+srv://" + MongoDBuserName + ":" + pass + "@cluster0.wg8ywvl.mongodb.net/" + dbName;
let currentSession = "";
let signUpValidation = "";
let = signInValidation = "";

mongoose.connect(mongooseURL, function(err){
    if(err){
        console.log("Error is:" + err);
    } else {
        console.log("Database connected successfully...");
    }
});
/* Database declaration and connection*/

/* Schemas and models declaration */
const itemSchema = mongoose.Schema({ // schema
    itemDescription: String,
    itemCategory: String,
    user: String
})

const userSchema = mongoose.Schema({
    username: String,
    password: String
})

const itemModel = mongoose.model("items", itemSchema); //model
const userModel = mongoose.model("users", userSchema);
/* Schemas and models declaration */


/* Display list of items on homepage and work */
app.get("/login", function(req, res){
    if(currentSession != "")
    {
        res.redirect("/");
    } else {  
        res.render("login", {
            validationResult: signInValidation
        });
        signInValidation = "";
    }
})

app.get("/signup", function(req, res){
    if(currentSession != "")
    {
        res.redirect("/");
    } else {  
        res.render("signup",{
            validationResult: signUpValidation
        });
        signUpValidation = "";
    }
})

app.get("/logout", function(req, res){
    currentSession = "";
    res.redirect("/");
})
// List of normal items
app.get("/", function(req, res){    
    let dayModule = date.getCurrentDate();
    if(currentSession != "")
    {
        itemModel.find({itemCategory: "Normal", user: currentSession.username}, function(err, returnedItems){
            if(err){
                console.log(err);
            } else {
                res.render("list", {
                    today: dayModule,
                    listTitle: "Normal Daily List",
                    listLength: returnedItems.length,
                    theNewTask: returnedItems,
                    sessionUsername: currentSession.username
                });
            }
        })
    } else{
        res.redirect("/login");
    }
});
// List of work items
app.get("/work", function(req, res){
    let dayModule = date.getCurrentDate();
    if(currentSession.username != "")
    {
        itemModel.find({itemCategory: "Work", user: currentSession.username}, function(err, returnedItems){
            if(err){
                console.log(err);
            } else {
                res.render("list", {
                    today: dayModule,
                    listTitle: "Work Daily List",
                    listLength: returnedItems.length,
                    theNewTask: returnedItems,
                    sessionUsername: currentSession.username
                });
                console.log(returnedItems);
            }
        })
    } else {
        res.render("login");
    }
});
/* Display list of items on homepage and work */

/* Display all the items in the database */
app.post("/", function(req, res){

    let newItemDescription = req.body.newTask;
    let newItemCategory = req.body.submitList;
    //console.log(currentSession.username);

    addNewItems(newItemDescription,newItemCategory, currentSession.username);

    if(newItemCategory == "Work"){
        res.redirect("/work");
    } else {
        res.redirect("/");
    }
});

/* POST request data for CRUD operation */
app.post("/action", function(req, res){ // POST request data for CRUD operation
    let requestContent = req.body.requestContent;
    let action = req.body.actionType;
    let requestCategory = req.body.requestCategory;

    let updateContent = req.body.newEditContent;

    if(action=="Remove"){ // Remove
        deleteItems(requestContent);
        if(requestCategory == "Normal"){
            res.redirect("/");
        } else {
            res.redirect("/Work");
        }
    } else if (action=="Update"){ // Update
        //console.log(action + " " + updateContent);
        updateItems(updateContent, requestContent);
        if(requestCategory == "Normal"){
            res.redirect("/");
        } else {
            res.redirect("/Work");
        }
    }
})

app.post("/signup", function(req, res){
    let username = req.body.registerUsername;
    let password = req.body.registerPassword;
    userModel.find({
        username: username
    }, function(err, returnedUser){
        if(err){
            console.log(err);
        } else {
            if(returnedUser.length > 0)
            {
                signUpValidation = "This username has already existed. Please enter a valid username!";
                res.redirect("/signup");
            } else {
                addNewUser(username, password);
                res.redirect("/login");
            }
        }
    })
})

app.post("/login", function(req, res){
    let loginUsername = req.body.SigninUsername;
    let loginPassword = req.body.SigninPassword;
    
    userModel.find({
        username: loginUsername,
        password: loginPassword
    }, function(err, returnedUser){
        if(err){
            console.log(err);
        } else {
            if(returnedUser.length > 0)
            {
                currentSession = req.session;
                currentSession.username = loginUsername;
                res.redirect("/");
                //console.log(currentSession.username);
            } else {
                signInValidation = "Your details doesn't match with our records. Please try again!";
                res.redirect("/login");
            }
        }
    })
})

/* CRUD operations */
function addNewItems (description, category, userName){
    let newItem = new itemModel ({ // CREATE OPERATION
        itemDescription: description,
        itemCategory: category,
        user: userName
    })
    newItem.save(function(err)
    {
        if (err){
            console.log(err);
        } else {
            console.log("Added successfully");
        }
    });
}

function deleteItems(description){
    itemModel.deleteOne({itemDescription: description},function(err){ // DELETE OPERATION
        if(err){
            console.log(err);
        } else {
            console.log("Deleted successfully");
        }
    })
}

function updateItems(newContent, description){ // UPDATE
    itemModel.updateOne({itemDescription:description},{itemDescription:newContent},function(err){
        if(err){
            console.log(err);
        } else {
            console.log("Updated successfully");
        }
    })
}

function addNewUser(un, pw){
    let newUser = new userModel({
        username: un,
        password: pw
    })
    newUser.save(function(err){
        if(err){
            console.log(err);
        } else {
            console.log("User added successfully");
        }
    })
}
/* CRUD operations */

/* Open the server to listen on port with Heroku or localhost 3000... */
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server has started successfully...");
});
/* Open the server to listen on port 3000... */

// This part should be commented
/*app.post("/work", function(req, res){
    let newWorkTask = req.body.newTask;
    workTaskArray.push(newWorkTask);
    res.redirect("/work"); 
})*/



/*

let newTaskArray = [];
let workTaskArray = [];

app.get("/", function(req, res){    
    let dayModule = date.getCurrentDate();
    res.render("list", {
        listTitle: dayModule,
        listLength: newTaskArray.length,
        theNewTask: newTaskArray        
    });
});

app.get("/work", function(req, res){
    res.render("list", {
        listTitle: "Work List",
        listLength: workTaskArray.length,
        theNewTask: workTaskArray  
    });
});

// This part should be commented
app.post("/work", function(req, res){
    let newWorkTask = req.body.newTask;
    workTaskArray.push(newWorkTask);
    res.redirect("/work"); 
})

app.post("/", function(req, res){

    let newTask = req.body.newTask;

    if(req.body.submitList == "Work"){
        workTaskArray.push(newTask);
        res.redirect("/work");
    } else {
        newTaskArray.push(newTask);
        res.redirect("/");
    }
});*/

