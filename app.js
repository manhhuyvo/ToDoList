const express = require("express");
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

/* Database declaration and connection*/
//const mongooseURL = "mongodb://localhost:27017/todoListDB";
const pass = "test123";
const dbName = "ToDoListDB";
const mongooseURL = "mongodb+srv://manhhuyvo:" + pass + "@cluster0.wg8ywvl.mongodb.net/" + dbName;

mongoose.connect(mongooseURL, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("Database connected successfully...");
    }
});
/* Database declaration and connection*/

/* Schemas and models declaration */
const itemSchema = mongoose.Schema({ // schema
    itemDescription: String,
    itemCategory: String,
})
const itemModel = mongoose.model("items", itemSchema); //model
/* Schemas and models declaration */


/* Display list of items on homepage and work */
// List of normal items
app.get("/", function(req, res){    
    let dayModule = date.getCurrentDate();
    itemModel.find({itemCategory: "Normal"}, function(err, returnedItems){
        if(err){
            console.log(err);
        } else {
            res.render("list", {
                today: dayModule,
                listTitle: "Normal Daily List",
                listLength: returnedItems.length,
                theNewTask: returnedItems
            });
        }
    })
});
// List of work items
app.get("/work", function(req, res){
    let dayModule = date.getCurrentDate();

    itemModel.find({itemCategory: "Work"}, function(err, returnedItems){
        if(err){
            console.log(err);
        } else {
            res.render("list", {
                today: dayModule,
                listTitle: "Work Daily List",
                listLength: returnedItems.length,
                theNewTask: returnedItems
            });
            console.log(returnedItems);
        }
    })
});
/* Display list of items on homepage and work */

/* Display all the items in the database */
app.post("/", function(req, res){

    let newItemDescription = req.body.newTask;
    let newItemCategory = req.body.submitList;

    addNewItems(newItemDescription,newItemCategory);

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

/* CRUD operations */
function addNewItems (description, category){
    let newItem = new itemModel ({ // CREATE OPERATION
        itemDescription: description,
        itemCategory: category
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
/* CRUD operations */

/* Open the server to listen on port 3000... */
app.listen("3000",function(){
    console.log("Server is running on port 3000...");
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

