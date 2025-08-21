const express = require("express");
const app = express();
const { pool } = require("./dbConfig");
const createStore = require("./sessionStore");
// const pgSession = require("connect-pg-simple")(session);
// const { Pool } = require("pg");

const bcrypt = require("bcryptjs");
const session = require("express-session");
const flash = require("express-flash");
// const flash = require("connect-flash");
const passport = require("passport");
const initializePassport = require("./passportConfig");
// const fileUpload = require("express-fileupload");
const path = require("path");
const multer = require("multer");
const fs = require("fs-extra");
const helmet = require("helmet");
require ('dotenv').config();
// const  secretKey = process.env.SECRET_KEY;
// const csrf = require('csurf');
// const lusca = require('lusca')
const cookieParser = require('cookie-parser');
// const csrfProtection = csrf({ cookie: true });
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join (__dirname, "/public/uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // console.log(file);
    // cb(null, Date.now() + path.extname(file.originalname));
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

//File filter to allow specific filetypes
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  }else {
    cb(new Error("Only .jpeg, .png, .docx, .doc, .xlsx, and .xls files are allowed!"), false);
  }
};
// const upload = multer({ storage: storage }); //upload 
// file size limit and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024}, //5mb
  fileFilter: fileFilter,
});
// const { authCourse, authPage } = require("./middlewaresroles");
const { authUser, authRole } = require("./basicAuth");
const { ROLE, users } = require("./data");
// const projectRouter = require("./routes/projects");

const PORT = process.env.PORT || 4000;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bodyParser = require("body-parser");
// const https = require('https');
const cors = require('cors');
const store = createStore(session);


// const pool= new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });
// const store = new pgSession ({
//   pool: pool,
//   tableName: "user_sessions",
//     createTableIfMissing: true,
//     ttl: 86400,
//     pruneSessionInterval: 3600
// });





initializePassport(passport);

//middlewares setup

app.set('views', path.join(__dirname,'views'));
app.set("view engine", "ejs");
// Middleware to set charset
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});


app.use(express.static(path.join(__dirname, "public",
  // {
  // maxAge:'1d',
  // immutable: true //browser not to revalidate
// }
)));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SECRET_KEY,

    resave: false,

    saveUninitialized: true,
    cookie: {
      secure:true,
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, //24hrs  //60 * 60 * 1000,//1h//1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'Strict'
      // sameSite: 'lax'
    },
    // store: session.MemoryStore()
    store: store,
  })
);
// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// }

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(express.json());
app.use(setUser);
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
// app.use((req, res, next)=>{
//   res.locals.secretKey = secretKey;
//   next();
// });
app.use(cookieParser());
// app.use(lusca.csrf())
// const csrfProtection = csrf({ cookie: true });
// const csrfProtection = csrf();

// app.use(csrf({
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production', // Ensure this is true in production
//     sameSite: 'Strict'
//   }
// }));

// const csrfProtection = csrf ({
//   cookie:{
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: "Strict"
//   }
// });
// app.use(csrfProtection);
// app.use((req,res, next) => {
//   res.locals.csrfToken = req.csrfToken();//token available in views
//   res.locals.user = req.user || null;
//   next();
// });
// app.use((err, req, res, next) => {
//   if (err.code === "EBADCSRFTOKEN") {
//     res.status(403).send("CSRF token validation failed.");
//   } else {
//     next(err);
//   }
// });
app.use(cors()); //allows communication with backende and frontend
// app.use(cors({
//   origin: 'http://localhost:3000', // Replace with your frontend URL
//   methods: 'GET,POST,PUT,DELETE',
//   allowedHeaders: 'Content-Type,Authorization'
// }));




app.get("/", (req, res) => {
  res.render("index",{url:req.protocol+"://"+req.headers.host});
});
// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.get('/csrf-token',( req,res) => {
//   res.json({csrfToken:req.csrfToken()});
// });



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
  setTimeout(()=>{
  res.render("admin", { user: req.user.name });
},1000);
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

// app.get("/users/search", async (req, res) => {
//   const { q } = req.query;
//   const results = await pool.query("SELECT * FROM users WHERE email ILIKE $1", [
//     `%${q}`,
//   ]);
//   res.json(results.rows);
// });

app.get("/users/resources",(req, res) => {
  res.render("resources");
});

// app.get("/users/search", authUser, (req, res) => {
//   res.render("search", { user: req.user.name });
// });
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

// app.get('/users/login', (req, res) => {
//   res.render('login', { csrfToken: req.csrfToken() });
// });

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
  req.session.destroy((err)=> {
  // req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You have logged out");
    res.clearCookie(connect.sid);
    res.redirect("/users/login");
  // });
  });
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  try{
    const result = await pool.query(
      'SELECT name FROM users WHERE name ILIKE $1 LIMIT 5',
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Database error'});
  }
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
  const userId = req.body?.userId;
  if (userId) {
    req.user = users.find((user) => user.id === userId);
  }
  next();
}

//search users
// function searchusers() {
//   const input = document.getElementById("searchInput").value;
//   fetch(`/users/search?q=${input}`)
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data); //process and display your search results
//     })
//     .catch((error) => console.error("Error:", error));
// }

app.post("/users/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file){
      return res.status(400).send("No file uploaded or invalid file type.");

    }

    const userId = req.user.id; // Assuming user is authenticated and user ID is available
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    const fileData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };

    const queryText = `
    INSERT INTO files (filename, originalname, mimetype, size, path, user_id) VALUES ($1, $2, $3, $4, $5 , $6) RETURNING id
    `;

    await pool.query(queryText, [
      fileData.filename,
      fileData.originalname,
      fileData.mimetype,
      fileData.size,
      fileData.path,
      userId,
    ]);

    req.flash("success_message", "File has been added successfully");
    //  res.status(201).send("File has been added successfully");
              res.redirect("/users/upload");
    // res.send("File uploaded succesfully and metadata saved.");
    
  }catch (error) {
    console.error(error);
    res.status(500).send("Server error.Could not upload file.");
  }
});

// app.post(
//   "/users/upload",
//   upload.single("uploads"),
//   (req, res) => {
//     // console.log(req.file);

//     let {
//       userid,
//       fieldname,
//       originalname,
//       mimetype,
//       destination,
//       filename,
//       path,
//       size,
//     } = req.body;

//     console.log({
//       userid,
//       fieldname,
//       originalname,
//       mimetype,
//       destination,
//       filename,
//       path,
//       size,
//     });
//     pool.query(
//       `SELECT * FROM upload WHERE originalname = $1`,
//       [originalname],
//       (err, results) => {
//         if (err) {
//           throw err;
//         }
//         console.log(results.rows);

//         if (results.rows.length > 0) {
//           errors.push({ message: "image already there" });
//           res.render("upload", { errors });
//         } else {
//           pool.query(
//             `INSERT INTO upload (userid, fieldname, originalname, mimetype, destination, filename, path, size
// ) VALUES ($1, $2, $3, $4, $5, $6,$7, $8 ) RETURNING id, path`,
//             [
//               userid,
//               fieldname,
//               originalname,
//               mimetype,
//               destination,
//               filename,
//               path,
//               size,
//             ],
//             (err, results) => {
//               if (err) {
//                 throw err;
//               }
//               console.log(results.rows);
//               req.flash(
//                 "success_message ",
//                 "You are now registered.Please log in "
//               );
//               res.redirect("/users/upload");
//             }
//           );
//         }
//       }
//     );
//   }

  // res.send("Image Uploaded");
  // res.send("Image Uploaded");
// );
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
      user: "ndungudavidmuchoki@gmail.com",
      pass: ""
      // pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "ndungudavidmuchokigmail.com",
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

app.post('/users/search', async (req, res) => {
  const searchTerm = req.body.searchTerm;
  const query = 'SELECT * FROM users WHERE name ILIKE $1 ';
  const values = [`%${searchTerm}%`];

  try {
    const result = await pool.query(query, values);
    res.render('results', {users: result.rows, searchTerm});
    
  }catch (err) {
    console.error(err)
    res.status(500).send('Server error');
  }
});

// app.post('/submit', csrfProtection, (req, res) => {
//   // Handle form submission
//   console.log("Received Request Body:", req.body);
//   console.log("Received CSRF Token:", req.body._csrf);
//   res.send('Form successfully submitted!');
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
module.exports = app; // Export the app for testing purposes
