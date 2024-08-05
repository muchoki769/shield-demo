const express = require("express");
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const initializePassport = require("./passportConfig");
// const fileUpload = require("express-fileupload");
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage }); //upload middleware
// const { authCourse, authPage } = require("./middlewaresroles");
const { authUser, authRole } = require("./basicAuth");
const { ROLE, users } = require("./data");
// const projectRouter = require("./routes/projects");

const PORT = process.env.PORT || 4000;
const nodemailer = require("nodemailer");
const crypto = require("crypto");

initializePassport(passport);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secret",

    resave: false,

    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(express.json());
app.use(setUser);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/users/dashboard", authUser, (req, res) => {
  res.render("dashboard", { user: req.user.name });
});

app.get("/users/upload", authUser, (req, res) => {
  res.render("upload", { user: req.user.name });
});

app.get("/users/admin", authUser, authRole(ROLE.ADMIN), (req, res) => {
  res.render("admin", { user: req.user.name });
});

app.get(
  "/users/manager",
  authUser,
  authRole(ROLE.MANAGER),

  (req, res) => {
    res.render("manager", { user: req.user.name });
  }
);

app.get(
  "/users/add",
  authUser,

  authRole(ROLE.ADMIN),
  (req, res) => {
    res.render("add");
  }
);
app.get("/users/delete", authUser, authRole(ROLE.ADMIN), async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM users ORDER BY id ASC`);
    res.render("delete", { users: result.rows });
  } catch (err) {
    res.send("Error fetching users");
  }
});
app.get("/users/edit", authUser, authRole(ROLE.ADMIN), async (req, res) => {
  const result = await pool.query(`SELECT * FROM users`);
  res.render("edit", { users: result.rows });
});

app.get("/projects", authUser, (req, res) => {
  res.render("projects", { user: req.user.name });
});

app.get("/users/search", async (req, res) => {
  const { q } = req.query;
  const results = await pool.query("SELECT * FROM users WHERE email ILIKE $1", [
    `%${q}`,
  ]);
  res.json(results.rows);
});

app.get("/users/forgot-password", (req, res) => {
  res.render("forgot-password");
});

app.get("/users/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const user = await pool.query(
    "SELECT * FROM users WHERE reset_token = $1 AND token_expiration > NOW()",
    [token]
  );

  if (user.rows.length > 0) {
    res.render("reset-password", { token });
  } else {
    res.send("Password reset token is invalid or has expired.");
  }
});

// app.get("/course/grades", authPage(["manager", "admin"]), (req, res) => {
//   res.json({
//     pedro: 100,
//     maria: 90,
//     Kamau: 90,
//     Kipngeno: 90,
//   });
// });

// app.get("/course/:number", authCourse, (req, res) => {
//   const courseNumber = req.params.number;
//   res.json(`YOU HAVE PERMISSION TO SEE COURSE $(courseNumber)`);
// });

app.get("/users/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You have logged out");
    res.redirect("/users/login");
  });
});
app.post("/users/register", async (req, res) => {
  let { name, email, password, confirmpassword, date, role } = req.body;

  console.log({
    name,
    email,
    password,
    confirmpassword,
    date,
    role,
  });
  let errors = [];

  if (!name || !email || !password || !date || !role) {
    errors.push({ message: "Please fill in all fields" });
  }
  if (password.length < 6) {
    errors.push({
      message: "Password should be at least 6 characters and contain symbols",
    });
  }
  if (password != confirmpassword) {
    errors.push({ message: "Passwords do not match" });
  }
  //after form validation
  if (errors.length > 0) {
    res.status(400).render("register", { errors });
  } else {
    //registration logic
    let hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);

    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "Email already registered" });
          res.render("register", { errors });
        } else {
          pool.query(
            `INSERT INTO users (name, email, password, date ,role) VALUES ($1, $2, $3, $4 ,$5) RETURNING id, password`,
            [name, email, hashedPassword, date, role],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash(
                "success_message ",
                "You are now registered.Please log in "
              );
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

/*const newUser = new user({
            name,
            email,
            password,
            created_at: time
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash)=> {
                bcrypt.hash(password, salt, (err, hash) =>{
                    if (err) {
                        throw err;
                    }
                    newUser.password = hash;
                    newUser.save((err) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Error registering user");

                        }else {
                            res.send("User registred succesfully");
                        }
                        
                        });
                        });
                        });
                        });
                        }
      
      
                    });*/

// app.get('/protected', function(req, res, next) {
//     passport.authenticate('local', function(err, user, info, status) {
//       if (err) { return next(err) }
//       if (!user) { return res.redirect('/signin') }
//       res.redirect('/account');
//     })(req, res, next);
//   });

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function setUser(req, res, next) {
  const userId = req.body.userId;
  if (userId) {
    req.user = users.find((user) => user.id === userId);
  }
  next();
}

//search users
function searchusers() {
  const input = document.getElementById("searchInput").value;
  fetch(`/users/search?q=${input}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); //process and display your search results
    })
    .catch((error) => console.error("Error:", error));
}

app.post(
  "/users/upload",
  upload.single("uploads"),
  (req, res) => {
    // console.log(req.file);

    let {
      userid,
      fieldname,
      originalname,
      mimetype,
      destination,
      filename,
      path,
      size,
    } = req.body;

    console.log({
      userid,
      fieldname,
      originalname,
      mimetype,
      destination,
      filename,
      path,
      size,
    });
    pool.query(
      `SELECT * FROM upload WHERE originalname = $1`,
      [originalname],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "image already there" });
          res.render("upload", { errors });
        } else {
          pool.query(
            `INSERT INTO upload (userid, fieldname, originalname, mimetype, destination, filename, path, size
) VALUES ($1, $2, $3, $4, $5, $6,$7, $8 ) RETURNING id, path`,
            [
              userid,
              fieldname,
              originalname,
              mimetype,
              destination,
              filename,
              path,
              size,
            ],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash(
                "success_message ",
                "You are now registered.Please log in "
              );
              res.redirect("/users/upload");
            }
          );
        }
      }
    );
  }

  // res.send("Image Uploaded");
  // res.send("Image Uploaded");
);
app.post("/users/add", async (req, res) => {
  let { name, email, password, confirmpassword, date, role } = req.body;

  console.log({
    name,
    email,
    password,
    confirmpassword,
    date,
    role,
  });
  let errors = [];

  if (!name || !email || !password || !date || !role) {
    errors.push({ msg: "Please fill in all fields" });
  }
  if (password.length < 6) {
    errors.push({
      message: "Password must be at least 6 characters and contain symbols",
    });
  }
  if (password !== confirmpassword) {
    errors.push({ message: "Passwords do not match" });
  }
  //after form validation
  if (errors.length > 0) {
    res.status(400).render("add", { errors });
  } else {
    //registration logic
    let hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);

    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          errors.push({ message: "Email already exists" });
          res.render("add", { errors });
        } else {
          pool.query(
            `INSERT INTO users (name,email,password,date,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,password`,
            [name, email, hashedPassword, date, role],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_message", "User has been added successfully");
              res.redirect("/users/admin");
            }
          );
        }
      }
    );
  }
});

app.post("/users/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    res.redirect("/users/delete");
  } catch (err) {
    res.send("Error deleting user");
  }
});

app.post("/users/edit/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`SELECT * FROM users where id = $1`, [id]);
  res.render("edit", { users: result.rows[0] });
});

app.post("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  await pool.query(
    `UPDATE users SET email=$1, name=$2, role=$3 WHERE id = $4`,
    [email, name, role, id]
  );
  res.redirect("/users/delete");
});

app.post("/users/forgot-password", async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  // const hashedToken = await bcrypt.hash(token, 10);
  const expires = new Date(Date.now() + 3600000); //1hr from now

  await pool.query(
    "UPDATE users SET reset_token= $1, token_expiration = $2 WHERE email = $3",
    [token, expires, email]
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "",
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "ndungu@gmail.com",
    to: email,
    subject: " Password Reset",
    text: `You can reset your password by clicking on this link: http://localhost:4000`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.send("Error sending email");
    }
    res.send("Email sent: " + info.response);
  });
});

app.post("/users/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  await pool.query(
    "UPDATE users SET password = $1, reset_token =  NULL, token_expiration = NULL WHERE reset_token = $2",
    [password, token]
  );
  req.flash("success_msg", "Your password has been updated");
  // res.redirect("/users/login");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});