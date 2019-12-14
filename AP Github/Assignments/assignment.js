//use path module

//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const session = require('express-session');
const app = express();
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
var sess;
process.env.PWD = process.cwd()

// Then
app.use(express.static(process.env.PWD + '/public'));

//Create connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'abcd',
  database: 'crud_db'
});

//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});

//set views file
app.set('views', './views');
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set public folder as static folder for static file
app.use('/assets',express.static(__dirname + '/public'));

//route for homepage




app.get('/index',(req, res) => {
    res.render('index');
});

app.post('/viewproducts',(req, res) => {
  var person= req.body.person;
  if (person=="Saler"){
    res.render('index2');
  }
  else if (person=="Buyer"){
    let sql = "SELECT * FROM product";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      res.render('products',{
        results: results
      });
    });
  }
});


app.post('/signup',(req, res) => {
  sess = req.session;
  sess.fname= req.body.fname;
  sess.lname= req.body.lname;
  sess.password= req.body.password;
  let data = {user_fname: req.body.fname, user_lname: req.body.lname, user_password:req.body.password};
  let sql = "INSERT INTO users SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;

    res.redirect('/');
  });
});



app.post('/login', function(request, response) {
	var fname = request.body.fname;
  var lname = request.body.lname;
	var password = request.body.password;

  sess = request.session;
  sess.fname= fname;
  sess.lname= lname;
  sess.password= password;

	if (fname && lname && password) {
		conn.query('SELECT * FROM users WHERE user_fname = ? AND user_lname = ? AND user_password = ?', [fname, lname, password], function(error, results, fields) {
			if (results.length > 0) {
				response.redirect('/');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	}
});

app.get('/',(req, res) => {
  let sql = "SELECT * FROM product WHERE user_fname = ? AND user_lname = ? AND user_password = ?";
  let query = conn.query(sql,[sess.fname, sess.lname, sess.password], (err, results) => {
    if(err) throw err;
    res.render('product_view',{
      results: results
    });
  });
});

//route for insert data
app.post('/save',(req, res) => {
  let data = {user_fname: sess.fname,user_password: sess.password,user_lname: sess.lname,product_name: req.body.product_name, product_price: req.body.product_price, product_category: req.body.product_category, product_desc: req.body.product_desc, product_reviews: req.body.product_reviews, product_img: req.body.product_img};
  let sql = "INSERT INTO product SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});

//route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE product SET product_name='"+req.body.product_name+"', product_img='"+req.body.product_img+"', product_category='"+req.body.product_category+"', product_desc='"+req.body.product_desc+"', product_price='"+req.body.product_price+"' WHERE product_id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});

app.post('/update2',(req, res) => {
  let sql = "UPDATE product SET product_reviews='"+req.body.product_reviews+"' WHERE product_id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});

//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM product WHERE product_id="+req.body.product_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});
