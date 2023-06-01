const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

var items = ["Buy food", "Cook food", "Eat food"];

app.set('view engine', 'ejs');


app.get("/", function(req, res) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var today = new Date();

    var options = {
        weekday: "long", 
        day: "numeric",
        month: "long"
    };

    var day = today.toLocaleDateString("en-US", options);

    res.render("list", {kindOfDay: day, newListItems: items});

});

app.post("/", function(req, res) {
    var item = req.body.newItem;
    items.push(item);
    res.redirect("/");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});