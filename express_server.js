const express = require('express');
const app = express();
const PORT = 3000;

app.set('view engine','ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

//To generate random Id
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

//To find whether the user exist or not
function findUserByEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email)
      return users[userId];
  }
  return false;
}

//Authenticate user
function userAuthenticate(email,password) {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    console.log(password);
    console.log(user.id);
    return user.id;
  }
  return false;
}

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

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Basic routings
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
  res.clearCookie('user_id');
  res.redirect('/login');
});

////To create a new short URL
app.post('/urls',(req,res) => {
  console.log(req.body.longURL);
  const newString = generateRandomString();
  urlDatabase[newString] = req.body.longURL;
  res.redirect(`/urls/${newString}`);
});

// To Edit existing URL

app.post('/urls/:id',(req,res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls'); 
});

// Delete exsiting URL
app.post('/urls/:shortURL/delete', (req,res) => {
  const short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect('/urls');
});

//Register POST request
app.post('/register', (req,res) => {
  console.log("REGISTER");
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // Check if email is there in users object
  
  if (email && password) {
    if ((!findUserByEmail(email))) {
      const user = 
      {
        id,
        email,
        password
      };
     users[id] = user;
     res.cookie('user_id',id);
     res.redirect('/urls');  
    } else {
      res.status(401).send("UserId already exist");
    }
} else {
    res.status(400).send("UserId and Password required");
} 
})

//Login POST request
app.post('/login', (req,res) => {
  console.log("LOGIN");
  const email = req.body.email;
  const password = req.body.password;
  const findUser = findUserByEmail(email);
  const userAuth = userAuthenticate(email,password);
  if (findUser) {
    if (userAuth) {
        res.cookie('user_id',userAuth);
        res.redirect('/urls');
    } else {
        res.status(400).send("Password Incorrect");
      }
  } else {
    res.status(400).send("UserId Incorrect");
  }
});

//Handling GET Request

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  console.log(users);
  const currentUser = users[user_id];
  let templateVars = { urls: urlDatabase, user: currentUser}; 
  res.render('urls_index', templateVars);
});
//create new URL
app.get('/urls/new',(req,res) => {
  const user_Id = req.cookies['user_id'];
  const currentUser = users[user_Id];
  const templateVars = { user: currentUser };
  res.render('urls_new',templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user_Id = req.cookies['user_id'];
  const currentUser = users[user_Id];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],user: currentUser };
  res.render('urls_show', templateVars);
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