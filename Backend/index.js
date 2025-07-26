const express = require("express");
const app = express();
const session = require("express-session");
const usermodel = require("./models/user.model");
const path = require("path");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(
  session({
    secret: "foodsaver-secret",
    resave: false,
    saveUninitialized: false,
  })
);

const CheckUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "Please Login first");
    return res.redirect("/Login");
  }
  try {
    const decoded = jwt.verify(token, "gupt");
    req.user = decoded;
    next();
  } catch (error) {
    req.flash("error", "Invalid or expired token. Please login again.");
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  let user = null;
  const token = req.cookies.token;
  if (token) {
    try {
      user = jwt.verify(token, "gupt");
    } catch (error) {
      console.log("Invalid token: ", error.message);
    }
  }
  res.render("Index", {
    user,
    error: req.flash("error"),
    success: req.flash("success"),
  });
});

app.get("/Register", (req, res) => {
  res.render("Register", {
    error: req.flash("error"),
    formData: req.flash("formData")[0] || {},
    success: req.flash("success"),
  });
});

app.post("/Register", async (req, res) => {
  try {
    let {
      usertype,
      name,
      businessname,
      businessaddress,
      email,
      password,
      confirmpass,
    } = req.body;
    if (password != confirmpass) {
      req.flash("error", "Password do not match");
      req.flash("formData", req.body);
      return res.redirect("/Register");
    }
    if (usertype === "business" && (!businessname || !businessaddress)) {
      req.flash(
        "error",
        "Business name and address are required for business acconts"
      );
      req.flash("formData", req.body);
      return res.redirect("/Register");
    }
    const existinguser = await usermodel.findOne({ email });
    if (existinguser) {
      req.flash("error", "A user with this email is already registered");
      req.flash("formData", req.body);
      return res.redirect("/Register");
    }
    if (password.length < 6) {
      req.flash("error", "Password must be 6 characters long");
      req.flash("formData", req.body);
      return res.redirect("/Register");
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        await usermodel.create({
          userType: usertype,
          name: name,
          businessName: usertype === "business" ? businessname : undefined,
          businessAddress:
            usertype === "business" ? businessaddress : undefined,
          email: email,
          password: hash,
        });
      });
    });
    req.flash("success", "User Registered succesfully! Please Log in.");
    res.redirect("/Login");
  } catch (error) {
    console.log("Registration error", error);
    req.flash("error", "Server error please try again later");
    req.flash("formData", req.body);
    res.redirect("/Register");
  }
});

app.get("/Login", (req, res) => {
  res.render("Login", {
    error: req.flash("error"),
    success: req.flash("success"),
    formData: req.flash("formData")[0] || {},
  });
});

app.post("/Login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await usermodel.findOne({ email });
    if (!user) {
      req.flash("error", "No such user found");
      req.flash("formData", req.body);
      return res.redirect("/Login");
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        req.flash("error", "Something went wrong");
        req.formData("formData", req.body);
        res.redirect("/Login");
      }
      if (!result) {
        req.flash("error", "Incorrect password");
        req.flash("formData", req.body);
        res.redirect("/Login");
      }

      const token = jwt.sign(
        { id: user._id, name: user.name, email: user.email },
        "gupt",
        { expiresIn: "1h" }
      );
      res.cookie("token", token, { htttpOnly: true, maxAge: 3600000 });
      req.flash("success", "Logged in");
      res.redirect("/");
    });
  } catch (error) {
    req.flash("error", "Something went wrong");
    req.flash("formData", req.body);
    res.redirect("/Login");
  }
});

app.get("/Profile", CheckUser, (req, res) => {
  try {
    const user = req.user;
  
    res.render("Profile", { user });
  } catch (error) {
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
