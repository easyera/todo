import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://eni:02794@cluster0.h634xvc.mongodb.net/todolistDB");

const todoShema = new mongoose.Schema({
  content: String,
});
const listShema = new mongoose.Schema({
  name: String,
  items: [todoShema],
});

const todo = mongoose.model("todo", todoShema);
const list = mongoose.model("lists", listShema);

const todo1 = new todo({
  content: "welcome to todo",
});
const todo2 = new todo({
  content: "hit plus to add",
});
const todo3 = new todo({
  content: "<-- hit it to delete",
});

const itemsd = [todo1, todo2, todo3];

app.get("/", function (req, res) {
  todo.find({}, function (err, founditems) {
    if (founditems.length == 0) {
      todo.insertMany(itemsd, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "today", newListItems: founditems });
    }
  });
});

app.post("/", function (req, res) {
  
  const listName = req.body.list;
  const todos = new todo({
    content: req.body.newItem,
  });
  if(listName == "today"){
    if (req.body.newItem == " ") {
      console.log("no new item");
    } else {
      todos.save();
      res.redirect("/");
    }
  }else{
    list.findOne({name: listName}, function (err,founditems) {
      founditems.items.push(todos);
      founditems.save();
    });
    res.redirect("/" +listName);
  }
});

app.post("/delete", function (req, res) {
  console.log(req.body.checkbox);
  const listv = req.body.custId;
  console.log(listv);
  if(listv == "today"){
    todo.findByIdAndRemove({_id: req.body.checkbox}, function (err) {
      if (err) {
        console.log(err);
      } else {
       console.log("success");
      }
    });
    res.redirect("/");
  }else{
    list.findOneAndUpdate({ name: listv }, { $pull: { items: { _id: req.body.checkbox}}},function(err, founditems) {
      if (!err) {
        res.redirect("/"+listv);
      }
    });
  }
});

app.get("/:work", function (req, res) {
  const a = String(req.params.work);
  list.findOne({ name: a }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        const newlis = new list({
          name: a,
          items: itemsd,
        });
        newlis.save();
        res.redirect("/"+a);
      } else {
        list.deleteMany({name:'favicon.ico'}, function (err){
          if (err) {
            console.log(err);
          }else {
            console.log('success');
          }
        });
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port || 3000, () => console.log("Server listening on Port", port));
