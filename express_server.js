const express = require('express');
const { getUserByEmail } = require('./helper');
//create an express
const app = express();
//Define PORT number
const PORT = 3000;

//Setting ejs as template engine
app.set('view engine','ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Defining cookie session
const cookieSession = require('cookie-session');

//For password hashing
const bcrypt = require('bcrypt');
const saltRounds = 10;


// Encrypted cookies
app.use(cookieSession({
  name: 'session',
  keys: ['f080ac7b-b838-4c5f-a1f4-b0a9fee10130', 'c3fb18be-448b-4f6e-a377-49373e9b7e1a']
}));

// creating a middleware
const currentUser =  (req, res, next) => {
  req.currentUser = users[req.session['user_id']];
  next();
};
app.use(currentUser);

//User which used to store data (alternative for database)
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//Store the URLs
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


//To generate random Id
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

//Authenticate user
const userAuthenticate = function(userId,password) {
  if (userId && bcrypt.compareSync(password, users[userId].password)) {
    return true;
  }
  return false;
};

function urlsForUser(id) {
  let filteredObject = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      filteredObject[item] = urlDatabase[item];
    }
  }
  return filteredObject;
}


//Basic GET routings
app.get('/',(req,res) => {
  res.send("Hello!");
});

app.get('/urls.json',(req,res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = {greeting : "Hello World"};
  res.render("hello_world", templateVars);
});

//Handling POST Request

//Logout user
app.post('/logout', (req,res) => {
  req.session['user_id'] = null;
  res.redirect('/login');
});

////To create a new short URL
app.post('/urls',(req,res) => {
  const userID = req.session['user_id'];
  const newString = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newString] = {longURL,userID};
  res.redirect(`/urls/${newString}`);
});

// To Edit existing URL
app.post('/urls/:id',(req,res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session['user_id'];
  if (userID === urlDatabase[req.params.id].userID) {
    const urlDB = {
      longURL,
      userID
    };
    urlDatabase[shortURL] = urlDB;
    res.redirect('/urls');
  }
});

// Delete exsiting URL
app.post('/urls/:shortURL/delete', (req,res) => {
  const user_ID = req.session['user_id'];
  if (user_ID === urlDatabase[req.params.shortURL].userID) {
    const short = req.params.shortURL;
    delete urlDatabase[short];
    res.redirect('/urls');
  }
});

//Register POST request
app.post('/register', (req,res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // Check if email is there in users object
  if (email && password) {
    if ((!getUserByEmail(email,users))) {
      const user =
      {
        id,
        email,
        password: bcrypt.hashSync(password, saltRounds)
      };
      users[id] = user;
      req.session['user_id'] = id;
      res.redirect('/urls');
    } else {
      res.status(401).send("UserId already exist");
    }
  } else {
    res.status(400).send("UserId and Password required");
  }
});

//Login POST request
app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const findUser = getUserByEmail(email,users);
  const userAuth = userAuthenticate(findUser,password);
  if (findUser) {
    if (userAuth) {
      req.session['user_id'] = users[findUser].id;
      res.redirect('/urls');
    } else {
      res.status(400).send("Password Incorrect");
    }
  } else {
    res.status(400).send("UserId Incorrect");
  }
});

//Handling GET Request

//Display a specific URL content
app.get("/u/:shortURL", (req, res) => {
  const objValue = urlDatabase[req.params.shortURL];
  let longURL = objValue.longURL;
  res.redirect(longURL);
});

//Display the current URLs
app.get('/urls', (req, res) => {
  const user_ID = req.session.user_id;
  let filteredObject = urlsForUser(user_ID);
  if (user_ID) {
    const currentUser = users[user_ID];
    let templateVars = { urls: filteredObject, user: currentUser};
    res.render('urls_index', templateVars);
  } else {
    const templateVars = { user: null };
    res.render('login',templateVars);
  }
  
});

//Create new URL
app.get('/urls/new',(req,res) => {
  const user_Id = req.session['user_id'];
  if (user_Id) {
    const currentUser = users[user_Id];
    const templateVars = { user: currentUser };
    res.render('urls_new',templateVars);
  } else {
    const templateVars = { user: null };
    res.render('login',templateVars);
  } 
});

//Display specific URL
app.get('/urls/:shortURL', (req, res) => {
  const user_Id = req.session['user_id'];
  const currentUser = users[user_Id];
  if (user_Id === urlDatabase[req.params.shortURL].userID) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,user: currentUser };
    res.render('urls_show', templateVars);
  } else {
    res.status(400).send("URL with " + req.params.shortURL + " does not belong to you");
  }
});

//Register GET request
app.get('/register', (req,res) => {
  const templateVars = { user: null };
  res.render('register',templateVars);
});

//Login GET request
app.get('/login', (req,res) => {
  const templateVars = { user: null };
  res.render('login',templateVars);
});

app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
});