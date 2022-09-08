module.exports.getCurrentDate = getCurrentDate;

// require date.js in the app.js by using const date = require(__dirname + "/date.js")
// create new object of this module is let dayModule = date(); -> This is the data that was returned in this function
// We can do this to other functions created in this module

function getCurrentDate() {
    let today = new Date();

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }

    let currentDay = today.toLocaleDateString("en-US", options);
    return currentDay;
}