const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const saltRounds = 10;
//const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

//PORT
const PORT = 8080; // default port 8080

// MiddleWare
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(express.urlencoded({extended: true}));
// app.use(cookieParser());
app.set("view engine", "ejs");
app.use(morgan('dev'));

// functions
const generateRandomString = () => { // returns a string of 6 alphanumeric random characters
  return Math.random().toString(36).substring(2,8);
};

function lookUpEmail(email) {
  console.log("email: ", email);
  for (let id in users) {
    console.log("id.email: ", id.email);
    if (users[id].email === email) {
      return id;
    }
  }
  return null;
}

// Database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "jmb0jt"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "mtlswd"},
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.sky.net",userID: "aJ48lW"}
};

const users = {
  "jmb0jt": {
    id: "jmb0jt",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  },
  "mtlswd": {
    id: "mtlswd",
    email: "user3@example.com",
    password: bcrypt.hashSync("blue-water", saltRounds)
  }
};

//redirects to the actual page when user clicks on short url link
app.get("/u/:id", (req, res) => {
  // console.log("req.params.shortURL", req.params.shortURL);
  // console.log("urlDatabase: ", urlDatabase);
  const urlID = urlDatabase[req.params.id];
  // console.log("longUrl: ", longURL);
  if (urlID === undefined) {
    res.statusCode = 404;
    return res.send("<html><h1>Error: shortURL does not exist</h1><html>");
  } else {
    res.redirect(urlID.longURL);
  }
});

//get and post together
//renders new URL page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", { user: users[req.session.user_id] });
  }
  return res.redirect('/login');
});

//updates an existing url in the database, and redirects back to URLs page
app.post("/urls/:id", (req, res) => {
  //TO DO
  // console.log();
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});

// removes a URL resource and redirects back to URLs page
app.post("/urls/:id/delete", (req, res) => {
  console.log('req.session', req.session);
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
  return res.send("<html><h1> Error: you don't have permission to delete the URL. </h1></html>");
});

//renders individual page for a URL
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send('<html> <h1> Error: this URL do not exist</h1></html>');
  } else if (!req.session.user_id){
    return res.send('<html><h1>Error: please login to view the page </h1></html>');
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send('<html><h1>Error: you do not have permission to view this URL</h1></html>');
  }
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
});

//renders URLs page with list of all the URLs currently in the database
app.get("/urls", (req, res) => {
  // console.log(req.cookies);
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//generates a new shortURL, adds it to the database, and redirects to the "show" page
app.post("/urls", (req, res) => {
  // console.log("Line 59 req.body: ", req.body);  // Log the POST request body to the console
  let tempString = generateRandomString();
  urlDatabase[tempString] = req.body.longURL;
  res.redirect(`/urls/${tempString}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)

});

// account information together
// render login page info
app.get("/login", (req, res) => {
  // console.log("req.body: ", req.body);
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  // console.log("req.body: ", req.body);
  const userId = lookUpEmail(req.body.email, users);
  // console.log("user_id: ", user_id);
  if (!userId) {
    res.statusCode = 403;
    res.send("<html><h1>Error: User does not exist</h1></html>");
  } else if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
    res.statusCode = 403;
    return res.send("<html><h1>Error: incorrect password</h1></html>");
  } else {
    // console.log(users);
    res.session["user_id"] = userId;
    res.redirect("/urls");
  }
});

//renders register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id] };
  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    return res.send("<html><h1>Please enter an email and password</h1></html>");
  } else if (users[lookUpEmail(req.body.email, users)]) {
    res.statusCode = 400;
    res.send("<html><h1>Email already exists</h1></html>");
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
    res.session["user_id"] = id;
    // console.log("users: ", users);
    return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


// LISTENER
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
