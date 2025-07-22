const express = require("express");
const app = express();
const path = require("path");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get("/", (req, res) => {
  res.render("Register");
});

app.post("/Register",(req,res)=>{
  const {name,email,password} = req.body
  console.log(name,email,password)
})

app.listen(3000);
