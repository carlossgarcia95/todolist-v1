const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemsSchema);

const defaultItems = [
  { name: "Welcome to your todolist!" },
  { name: "Hit the + button to add a new item." },
  { name: "<-- Hit this to delete an item." }
];

app.set("view engine", "ejs");

app.get("/", async (req, res) =>  {
  try {
    const count = await Item.countDocuments();
    if (count === 0) {
      await Item.insertMany(defaultItems);
      console.log("Successfully saved default items to DB.");
    }
    const items = await Item.find({});
    res.render("list", { listTitle: "Today", newListItems: items });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred while populating the database.");
  }
});

// app.get("/", async function (req, res) {
//     try {
//       let count = await Item.countDocuments();
//       if (count === 0) {
//         await insertDefaultItems();
//       }
  
//       const items = await Item.find({});
//       res.render("list", { listTitle: "Today", newListItems: items });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send("Error occurred while populating the database.");
//     }
//   });
  

// app.post("/", function(req, res) {

//     console.log(req.body);
//     const item = req.body.newItem;

//     if (req.body.list === "Work") {
//         workItems.push(item);
//         res.redirect("/work");
//     } else {
//         items.push(item);
//         res.redirect("/");
//     }
// });

// app.get("/work", function(req, res) {
//     res.render("list", {listTitle: "Work", newListItems: workItems});
// })

// app.get("/about", function(req, res) {
//     res.render("about");
// })

app.listen(3000, function() {
    console.log("Server started on port 3000");
});