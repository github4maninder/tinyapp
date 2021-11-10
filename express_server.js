const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// MiddleWare
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
// View Engine
app.set("view engine", "ejs"); //sets the template engine we are using as ejs

// functions
const generateRandomString = () => { // returns a string of 6 alphanumeric random characters
  return Math.random().toString(36).substring(2,8);
};

// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Routes for rendering Pages
// redirect to urls page
app.get("/", (req, res) => {
  res.redirect(`/urls`);
});

//READ for all urls
app.get("/urls", (req, res) => {
  console.log('req.param', req.params);
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//READ a form to submit a new URL
app.get("/urls/new", (req, res) => {
  console.log('req.param', req.params);
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//READ a new shortURL link after form submission
app.get("/urls/:shortURL", (req, res) => {
  console.log('req.param', req.params);
  const templateVars = { 
    username: req.cookies['username'],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  res.redirect("/urls");
});

//EDIT create a new shortURL after form submission, saves to urlDataBase and redirect
app.post("/urls", (req,res) => {
  console.log('req.body',req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; //shortURL-longURL key-value pair saved to urlDatabase
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});



// EDIT login page
app.post('/login', (req, res) => {
  const username = req.body.username;
  console.log("username", username);
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// redirect after submit 
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(shortURL);
})

// u/undefined
app.get("/u/:shortURL", (req, res) => {
  console.log('req.param', req.params);
  const longURL = urlDatabase[req.params.shortURL];
  console.log('longURL: ', longURL);
  res.redirect(longURL);
});

//DELETE a single URL
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURLToDel = req.params.shortURL;
  delete urlDatabase[shortURLToDel]; // delete the property in urlDatabase obj
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
