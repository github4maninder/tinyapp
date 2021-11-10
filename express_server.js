const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs"); //sets the template engine we are using as ejs

const generateRandomString = () => { // returns a string of 6 alphanumeric random characters
  return Math.random().toString(36).substring(2,8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// redirect to urls page
app.get("/", (req, res) => {
  res.redirect(`/urls`);
});

//READ for all urls
app.get("/urls", (req, res) => {
  console.log('req.param', req.params);
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//READ a form to submit a new URL
app.get("/urls/new", (req, res) => {
  console.log('req.param', req.params);
  res.render("urls_new");
});

//EDIT create a new shortURL after form submission, saves to urlDataBase and redirect
app.post("/urls", (req,res) => {
  console.log('req.body',req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; //shortURL-longURL key-value pair saved to urlDatabase
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//READ a new shortURL link after form submission
app.get("/urls/:shortURL", (req, res) => {
  console.log('req.param', req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// redirect after submit 
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
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
