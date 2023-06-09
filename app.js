const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Define the items schema and model
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
const Item = mongoose.model("Item", itemsSchema);

// Default items for the homepage
const defaultItems = [
  { name: "Welcome to your todolist!" },
  { name: "Hit the + button to add a new item." },
  { name: "<-- Hit this to delete an item." }
];

// Define the list schema and model
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

// HOMEPAGE
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

// CUSTOM LIST
app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  try {
    const list = await List.findOne({ name: customListName }).exec();
    if (list != null) {
      return res.render("list", { listTitle: list.name, newListItems: list.items });
    }
    const newList = new List({
      name: customListName,
      items: defaultItems
    });
    await newList.save();
    res.redirect('/' + customListName);
  } catch (error) {
    console.error(error);
    res.status(500).send("Oops, something went wrong.");
  }
});

// CREATE A NEW ITEM 
app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });
  if (listName === "Today") {
    await item.save();
    res.redirect('/');
  } else { 
    const list = await List.findOne({ name: listName }).exec();
    list.items.push(item);
    await list.save();
    res.redirect("/" + listName);
  }
});

// DELETE ITEM
app.post('/delete', async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  try {
    if (listName === "Today") {
      await Item.findByIdAndDelete(checkedItemId);
      console.log("Item deleted successfully.");
      res.redirect("/");
    } else {
      await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
      res.redirect("/" + listName);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred while deleting record.");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
