const express = require('express');
const app = express();
const PORT = 3000;

app.set('view engine','ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  //console.log("random", r);
  return r;
}
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Basic routing 
app.get('/',(req,res) => {
  res.send("Hello!");
})

app.get('/urls.json',(req,res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = {greeting : "Hello World"}
  res.render("hello_world", templateVars);
  //res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls/new',(req,res) => {
  res.render('urls_new');
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

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

// Delete exsiting URL
app.post('/urls/:shortURL/delete', (req,res) => {
  const short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect('/urls');
})


app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
})