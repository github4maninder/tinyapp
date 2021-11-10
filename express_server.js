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

// register page
app.get('/register', (req, res) => {
  const { user_id } = req.session;
  const user = usersDb[user_id];
  let templateVars = {user};
  res.render('urls_form', templateVars);
});

// login page
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userFound = getUserByEmail(email, usersDb);
  const error = 'Error 403: Please check your email and password and try again';
  if (userFound && checkPasswords(password, userFound)) {
    req.session.user_id = userFound.id;
    res.redirect('/urls');
  } else {
    res.send(error);
  }
});

//DELETE a single URL
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURLToDel = req.params.shortURL;
  delete urlDatabase[shortURLToDel]; // delete the property in urlDatabase obj
  res.redirect('/urls');
})

// Logout page
app.post('/logout',(req, res) =>{
  req.session.user_id = '';
  res.redirect('/urls');
})

// register page
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, usersDb);
  const validRegistration = validateRegistration(email, password, user);
  if (validRegistration) {
    usersDb[id] = {id, email, hashedPassword};
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.send('Error 400: Please check the details you entered and try again!');
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
