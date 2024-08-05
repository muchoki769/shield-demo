// // const Customer = require("../models/customer");
// // const mongoose = require("mongoose");

// exports.addCustomer = async (req, res) => {
//   res.render("/add", add);
// };

// exports.postCustomer = async (req, res) => {
//   console.log(req.body);

//   const newCustomer = new Customer({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     role: req.body.email,
//   });
//   // res.render("add", add);

//   // get
//   // homepage

//   // exports.homepage = async (req, res) => {
//   //   const views = {
//   //     title: "Nodejs",
//   //     description: "Free NdeJs User Management System",
//   };
//   res.render("customer", views);
// };

//   try {
//     await Customer.create(newCustomer);

//     res.redirect("/");
//   } catch (error) {
//     console.log(error);
//   }
// };
