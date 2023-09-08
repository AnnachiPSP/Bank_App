
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mysql = require('mysql');
const customer_connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'customer',
  password : 'customer',
  database : 'bank'
});

const employee_connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'employee',
  password : 'employee',
  database : 'bank'
});

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Krishna_me**',
  database : 'bank'
});

var faultymsg = false;
var faulter1 = false;

customer_connection.connect();
employee_connection.connect();
connection.connect();

const homeStarter = "Welcome to GRAMIN BANK!! Here, Customers can perform financial transactions like transfer funds" +
"online, pay bills, apply for loans and open a savings account among various other debit card transactions" +
"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores re";

app.get('/', function (req, res){
  res.render("home",{homeStarter: homeStarter});
});

var finding = false;
var value = [];

app.get('/branchfind',function(req, res){
  if (finding==false) {
    value = [];
  }
  res.render("branchfind",{value: value,finding: finding});
  finding = false;
});

app.post('/branchfind',function(req,res){
  connection.query('SELECT * FROM branch WHERE Pincode = ?',[req.body.pincode],(err,results)=>{
    if (err){
      console.log(err);
    }
    results = JSON.parse(JSON.stringify(results));
    value.push(results[0]);
    connection.query('SELECT * FROM branch_contact WHERE Branch_ID = ?',[results[0].Branch_ID],(err,res)=>{
      if(err){
        console.log(err);
      }
      res = JSON.parse(JSON.stringify(res));
      value.push(res[0]);
      console.log(res);
    });
  });
  finding = true;
  // console.log(value);
  res.redirect("/branchfind");
});

app.get('/logincust', function (req, res){
  res.render("logincust",{faulter1: faulter1});
});

app.post('/forgotpass',function(req, res){
  connection.query('SELECT * FROM `customer`', function (error, results, fields) {
    var custcred=JSON.parse(JSON.stringify(results));
    var temp = 0;
    for(var i = 0; i< custcred.length; i++){
      if(req.body.userid == custcred[i].User_ID && req.body.lastname == custcred[i].Last_Name){
        current_cust = custcred[i].First_Name;
        current_cust_id = custcred[i].CustomerID;
        res.redirect("/homecust");
        temp = 1;
        break;
      }
    }
    if(temp == 0){
      res.redirect('/logincust');
    }
  });
});

var current_cust = '';
var current_cust_id = '';

app.post('/logincust',function(req, res){
  connection.query('SELECT * FROM `customer`', function (error, results, fields) {
    var custcred=JSON.parse(JSON.stringify(results));
    var temp = 0;
    for(var i = 0; i< custcred.length; i++){
      if(req.body.userid == custcred[i].User_ID && req.body.password == custcred[i].Password){
        current_cust = custcred[i].First_Name;
        current_cust_id = custcred[i].CustomerID;
        res.redirect("/homecust");
        temp = 1;
        faulter1 = false;
        break;
      }
    }
    if(temp == 0){
      faulter1 = true;
      res.redirect('/logincust');
    }
  });
});

app.get('/homeemp',function(req, res){
  res.render("homeemp",{current_emp: current_emp});
});

app.get('/homecust',function(req, res){
  res.render("homecust",{current_cust: current_cust});
});

app.get('/loginemp', function (req, res){
  res.render("loginemp",{faultymsg: faultymsg});
});

var current_emp = '';

app.post('/loginemp',function(req, res){
  connection.query('SELECT * FROM `employee`', function (error, results, fields) {
    var custcred=JSON.parse(JSON.stringify(results));
    var temp = 0;
    for(var i = 0; i< custcred.length; i++){
      if(req.body.userid == custcred[i].User_ID && req.body.password == custcred[i].Password){
        current_emp = custcred[i].Emp_Name;
        res.redirect("/homeemp");
        temp = 1;
        faultymsg = false;
        break;
      }
    }
    if(temp == 0){
      faultymsg = true;
      res.redirect('/loginemp');
    }
  });
});

app.get("/updation",function(req, res){
  res.render("updation");
});

app.post("/updation",function(req, res){
  if(req.body.firstname != ""){
    customer_connection.query('UPDATE `customer` SET `First_Name` = ? WHERE `CustomerID` = ?',[req.body.firstname,current_cust_id],(err,res)=>{console.log(res);});
  }
  if(req.body.secondname != ""){
    customer_connection.query('UPDATE `customer` SET `Last_Name` = ? WHERE `CustomerID` = ?',[req.body.secondname,current_cust_id],(err,res)=>{console.log(res);});
  }
  if(req.body.street != ""){
    customer_connection.query('UPDATE `customer` SET `Street` = ? WHERE `CustomerID` = ?',[req.body.street,current_cust_id],(err,res)=>{console.log(res);});
  }
  if(req.body.city != ""){
    customer_connection.query('UPDATE `customer` SET `City` = ? WHERE `CustomerID` = ?',[req.body.city,current_cust_id],(err,res)=>{console.log(res);});
  }
  if(req.body.state != ""){
    customer_connection.query('UPDATE `customer` SET `State` = ? WHERE `CustomerID` = ?',[req.body.state,current_cust_id],(err,res)=>{console.log(res);});
  }
  if(req.body.pincode != ""){
    customer_connection.query('UPDATE `customer` SET `Pincode` = ? WHERE `CustomerID` = ?',[req.body.pincode,current_cust_id],(err,res)=>{console.log(res);});
  }
  if(req.body.dob != ""){
    customer_connection.query('UPDATE `customer` SET `DOB` = ? WHERE `CustomerID` = ?',[req.body.dob,current_cust_id],(err,res)=>{console.log(res);});
  }
  if(req.body.phno != ""){
    customer_connection.query('UPDATE `customer_contact` SET `PhoneNo` = ? WHERE `CustomerID` = ?',[req.body.phno,current_cust_id],(err,res)=>{console.log(res);});
  }
  res.redirect("/homecust");
});

app.get('/homeemp',function(req, res){
  res.render("homeemp",{current_emp: current_emp});
});

app.get('/resolveser',function(req, res){
  employee_connection.query('SELECT * FROM `service` WHERE `Service_Status` = "not resolved"', function (error, results, fields){
    results = JSON.parse(JSON.stringify(results));
    res.render("resolveser",{results: results});
  });
});

app.post('/resolveser',function(req, res){
  employee_connection.query('SELECT * FROM `service` WHERE `Service_Status` = "not resolved"', function (error, results, fields){
    results = JSON.parse(JSON.stringify(results));
    for(var i = 0; i<results.length;i++){
      if(req.body.resolved == results[i].ID){
        var day = new Date().toLocaleDateString('en-CA');
        employee_connection.query('UPDATE `service` SET `Service_Status` = "resolved" WHERE `ID` = ?',[results[i].ID], function (error, results){});
        employee_connection.query('UPDATE `service` SET `DORS` = ? WHERE `ID` = ?',[day,results[i].ID], function (error, results){});
        break;
      }
    }
    res.redirect('/resolveser');
  });
});

app.get('/resolvecomp',function(req, res){
  employee_connection.query('SELECT * FROM `complain` WHERE `Complain_Status` = "not resolved"', function (error, results, fields){
    results = JSON.parse(JSON.stringify(results));
    res.render("resolvecomp",{results: results});
  });
});

app.post('/resolvecomp',function(req, res){
  employee_connection.query('SELECT * FROM `complain` WHERE `Complain_Status` = "not resolved"', function (error, results, fields){
    results = JSON.parse(JSON.stringify(results));
    console.log(req.body);
    for(var i = 0; i<results.length;i++){
      if(req.body.resolved == (results[i].Complaint_ID).toString()){
        employee_connection.query('UPDATE `complain` SET `Complain_Status` = "resolved" WHERE `Complaint_ID` = ?',[results[i].Complaint_ID], function (error, results){});
        employee_connection.query('DELETE FROM `complain_list_notresolved` WHERE `Complaint_ID` = ?',[results[i].Complaint_ID], function (error, results){});
        break;
      }
    }
    res.redirect('/resolvecomp');
  });
});

app.get('/empdetails',function(req, res){
  employee_connection.query('SELECT * FROM employee, branch WHERE Emp_name = ? AND employee.Branch_ID = branch.Branch_ID',[current_emp],function(error, results, fields){
    results = JSON.parse(JSON.stringify(results));
    console.log(results);
    res.render("empdetails",{results: results});
  });
});

app.get('/bycustid',function(req, res){
  res.render("bycustid");
});

app.post('/bycustid',function(req, res){
  employee_connection.query('SELECT * FROM `customer` WHERE `CustomerID` = ?',[req.body.userid],function(error, results, fields){
    results = JSON.parse(JSON.stringify(results));
    res.render("custbyemp",{results:results});
  });
});

app.get('/byatmno',function(req, res){
  res.render("byatmno");
});

app.post('/byatmno',function(req, res){
  employee_connection.query('SELECT CustomerID,Account_No,Balance,Date_of_opening FROM `account_` WHERE `Account_No` = ?',[req.body.actno],function(error, results, fields){
    results = JSON.parse(JSON.stringify(results));
    res.render("custbyact",{results:results});
  });
});

app.get('/forgotpass',function(req, res){
  res.render("forgotpass");
});

app.post('/forgotpass',function(req, res){
  connection.query('SELECT * FROM `customer`',function(error, results,fields){
    results = JSON.parse(JSON.stringify(results));
    for(var i = 0; i<results.length;i++){
      if(results[i].User_ID == req.body.userid && results[i].Last_Name == req.body.lastname){
        current_cust = results[i].First_Name;
        res.redirect("homecust");
      }
    }
  });
});

app.get('/register',function(req, res){
  res.render("registercust");
});

app.get('/loanstatus',function(req, res){
  res.render("loanstatus");
});

app.post('/loanstatus',function(req, res){
  employee_connection.query('call function1(?)',[req.body.userid],function(err,results){
    results = JSON.parse(JSON.stringify(results));
    console.log(results);
    res.render("loanstatusi",{results: results});
  });
});

app.get('/transactionlog',function(req, res){
  res.render("transactionlog");
});

app.post('/transactionlog',function(req, res){
  employee_connection.query('SELECT AccountNo,Amount FROM transaction_log WHERE AccountNo = ?',[req.body.userid],function(err,results){
    if(err){console.log(err);}
    results = JSON.parse(JSON.stringify(results));
    console.log(results);
    res.render("transactionlogi",{results: results});
  });
});

app.get('/mgrlist',function(req, res){
  res.render("mgrlist");
});

app.post('/mgrlist',function(req, res){
  employee_connection.query('call function2(?)',[req.body.userid],function(err,results){
    results = JSON.parse(JSON.stringify(results));
    console.log(results);
    res.render("mgrlisti",{results: results});
  });
});

app.get("/teencust",function(req, res){
  employee_connection.query('SELECT * FROM teenager',(err,results)=>{
    results = JSON.parse(JSON.stringify(results));
    res.render("teencust",{results: results});
  });
});

app.get("/adultcust",function(req, res){
  employee_connection.query('SELECT customer_id,First_name,Last_name FROM adult',(err,results)=>{
    results = JSON.parse(JSON.stringify(results));
    res.render("adultcust",{results: results});
  });
});

app.get("/sencust",function(req, res){
  employee_connection.query('SELECT customer_id,First_name,Last_Name FROM senior',(err,results)=>{
    results = JSON.parse(JSON.stringify(results));
    res.render("sencust",{results: results});
  });
});

app.get('/availservices',function(req, res){
  res.render('availservices');
});

app.post('/availservices',function(req, res){
  var nowsertype = "";
  var nowdes = "";
  var nowdate = new Date().toLocaleDateString('en-CA');
  var nowstatus = "not resolved";
  if(req.body.opt == 1){
    console.log("1");
    nowsertype = "Passbook";
    nowdes = "Need Passbook";
  }
  else if(req.body.opt == 2){
    console.log("2");
    nowsertype = "Chequebook";
    nowdes = "Need Chequebook";
  }
  else if(req.body.opt == 3){
    console.log("3");
    nowsertype = "Creditcard";
    nowdes = "Need creditcard";
  }
  else if(req.body.opt == 4){
    console.log("4");
    nowsertype = "Recharge";
    nowdes = "Need recharge";
  }
  let post = {CustomerID: current_cust_id, Service_Type: nowsertype, DORQ: nowdate, DORS: "-", Service_Status: nowstatus, Service_Description: nowdes};
  console.log(post);
  let sql = 'INSERT INTO service SET ?';
  let query = customer_connection.query(sql,post,(err, result)=>{console.log(result)});
  res.redirect("/homecust");
});

app.get('/availcomplaint',function(req,res){
  res.render("availcomplaint");
});

app.post('/availcomplaint',function(req,res){
  let post1 = {CustomerID: current_cust_id, Complain_Status: "not resolved", Complain_Description: req.body.complain};
  console.log(post1);
  let sql1 = 'INSERT INTO complain SET ?';
  let query1 = customer_connection.query(sql1,post1,(err, result)=>{console.log(result)});

  customer_connection.query('SELECT * FROM customer WHERE `CustomerID` = ?',[current_cust_id],(err, results) => {
    if(err){
      console.log(err);
    }
    results = JSON.parse(JSON.stringify(results));
  });
  res.redirect("/homecust");
});

app.post('/registercust',function(req, res){
  var v = Math.floor(Math.random()*90000)+10000;
  let post1 = {CustomerID: v, First_Name: req.body.firstname, Last_Name: req.body.secondname, Street: req.body.street, City: req.body.city, State: req.body.state, Pincode: req.body.pincode, DOB: req.body.dob, User_ID: req.body.user, Password: req.body.password};
  let sql1 = 'INSERT INTO customer SET ?';
  let query1 = connection.query(sql1,post1,(err, result1)=>{console.log(result1);});

  let post2 = {CustomerID: v, PhoneNo: req.body.phno};
  let sql2 = 'INSERT INTO customer_contact SET ?';
  let query2 = connection.query(sql2,post2,(err, result2)=>{console.log(result2)});

  res.redirect("/");
});

app.get("/bankacc",function(req,res){
  customer_connection.query('SELECT CustomerID,Account_No,Balance,Date_of_opening FROM `account_`',(err, results)=>{
    results = JSON.parse(JSON.stringify(results));
    var temp = 0;
    for(var i = 0; i<results.length; i++){
      if(results[i].CustomerID == current_cust_id){
        temp = 1;
        customer_connection.query('SELECT * FROM transaction',(err,results1)=>{
          results1 = JSON.parse(JSON.stringify(results1));
          console.log(results1);
          res.render("banksttp",{results1: results1, accno: results[i].Account_No});
        });
        break;
      }
    }
    if(temp == 0){
      res.render("openacc");
    }
  });
});

app.get("/transmoney",function(req,res){
  res.render("transmoney");
});

app.post("/transmoney",function(req, res){
  var day = new Date().toLocaleDateString('en-CA');
  customer_connection.query('SELECT CustomerID,Account_No,Balance,Date_of_opening FROM `account_`',(err, results)=>{
    results = JSON.parse(JSON.stringify(results));
    for(var i = 0; i<results.length; i++){
      if(results[i].CustomerID == current_cust_id){
        let post1 = {Account_No: results[i].Account_No, Date_of_Transaction: day, Type_of_Transaction: "Debit", Amount: req.body.amt};
        let sql1 = 'INSERT INTO transaction SET ?';
        let query1 = customer_connection.query(sql1,post1,(err, result1)=>{console.log(result1)});
        customer_connection.query('UPDATE `account_` SET `Balance` = ? WHERE `Account_No` = ?',[results[i].Balance-req.body.amt,results[i].Account_No],(err, result2)=>{console.log(result2);});
      }
      if(results[i].Account_No == req.body.userid){
        let post3 = {Account_No: results[i].Account_No, Date_of_Transaction: day, Type_of_Transaction: "Credit", Amount: req.body.amt};
        let sql3 = 'INSERT INTO transaction SET ?';
        let query3 = customer_connection.query(sql3,post3,(err, result3)=>{console.log(result3)});
        customer_connection.query('UPDATE `account_` SET `Balance` = ? WHERE `Account_No` = ?',[results[i].Balance+req.body.amt,req.body.userid],(err, result4)=>{console.log(result4);});
      }
    }
  });
  res.redirect("/homecust");
});

app.post("/openacc",function(req,res){
  var day = new Date().toLocaleDateString('en-CA');
  let post = {CustomerID: current_cust_id, Account_No: Math.floor(Math.random()*90000000000)+10000000000, Balance: 500, Date_of_opening: day};
  let sql = 'INSERT INTO `account_` SET ?';
  let query = customer_connection.query(sql,post,(err, result)=>{console.log(result)});
  res.redirect("/homecust");
});

app.get("/loansanc",function(req,res){
  customer_connection.query('SELECT * FROM `loan_sanction`',(err,results)=>{
    results = JSON.parse(JSON.stringify(results));
    console.log(results);
    res.render("loansanc",{results: results});
  });
});

app.get("/loan",function(req,res){
  customer_connection.query('SELECT * FROM `loan`',(err, results)=>{
    results = JSON.parse(JSON.stringify(results));
    var temp = 0;
    for(var i = 0; i<results.length; i++){
      if(results[i].CustomerID == current_cust_id && results[i].Loan_status == "unpaid"){
        temp = 1;
        break;
      }
    }
    if(temp == 1){
      console.log(results);
      res.render("loanpay",{results: results, current_cust_id: current_cust_id});
    }
    else{
      res.render("loanstart",{results: results, current_cust_id: current_cust_id});
    }
  });
});

app.post("/loanpay",function(req,res){
  customer_connection.query('SELECT * FROM `loan`',(err, results)=>{
    results = JSON.parse(JSON.stringify(results));
    for(var i = 0; i<results.length; i++){
      if(results[i].Loan_ID == req.body.loanid){
        customer_connection.query('UPDATE `loan` SET `Amount_paid` = ? WHERE `Loan_ID` = ?',[results[i].Amount_paid+req.body.amt,req.body.loanid],(err,result1)=>{console.log(result1);});
        var day = new Date().toLocaleDateString('en-CA');
        let post = {Loan_ID: req.body.loanid, DOI: day, Amount: req.body.amt};
        let sql = 'INSERT INTO `payment` SET ?';
        let query = customer_connection.query(sql,post,(err, result)=>{console.log(result)});
        if(results[i].Amount_to_return == results[i].Amount_paid){
          customer_connection.query('UPDATE `loan` SET `Loan_status` = ? WHERE `Loan_ID` = ?',["paid",req.body.loanid],(err,result2)=>{console.log(result2);});
        }
        break;
      }
    }
  });
  res.redirect("/loancalc");
});



var tempsmt = false;
var calcamt = 0;
app.get("/loancalc",function(req,res){
  customer_connection.query('SELECT * FROM `loan`',(err, results)=>{
    results = JSON.parse(JSON.stringify(results));
    res.render("loanclac",{results: results,current_cust_id: current_cust_id, tempsmt: tempsmt,calcamt: calcamt});
    tempsmt = false;
  });
});

app.post("/loancalc",function(req,res){
  customer_connection.query('SELECT * FROM `loan`',(err, results)=>{
    results = JSON.parse(JSON.stringify(results));
    for(var i = 0; i<results.length; i++){
      if(results[i].Loan_ID == req.body.loanid){
        tempsmt = true;
        calcamt = (results[i].Amount_taken*results[i].Rate*results[i].Duration)/100;
        res.redirect("loanclac");
      }
    }
    tempsmt = false;
  });
});

app.post("loanstart",function(req, res){
  var customer_id = current_cust_id;
  var branch_id = req.body.brid;
  var duration = req.body.Duration;
  var amt_taken = req.body.amt_needed;
  if(req.body.loantype == "home"){
    var loan_type = "home";
    var rate = 6;
    var loan_status = "unpaid";
    var amt_paid = 0;
    var amt_return = amt_taken*0.06*duration;
  }
  if(req.body.loantype == "personal"){
    var loan_type = "personal";
    var rate = 8;
    var loan_status = "unpaid";
    var amt_paid = 0;
    var amt_return = amt_taken*0.08*duration;
  }
  if(req.body.loantype == "car"){
    var loan_type = "car";
    var rate = 10;
    var loan_status = "unpaid";
    var amt_paid = 0;
    var amt_return = amt_taken*0.1*duration;
  }
  let post = {CustomerID: customer_id, Branch_ID: brand_id, Loan_Type: loan_type, Duration: duration, Amount_taken: amt_taken, Rate: rate, Loan_status: loan_status, Amount_paid: amt_paid, Amount_to_return: amt_return};
  let sql = 'INSERT INTO `loan` SET ?';
  let query = customer_connection.query(sql,post,(err, result)=>{console.log(result)});
  res.redirect("/homecust");
});

app.listen(3000,function(){
  console.log("Bank web is running on port 3000");
});
