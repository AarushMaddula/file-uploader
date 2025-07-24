const path = require("node:path")
const { Pool } = require("pg")
const express = require("express")
const session = require('express-session');
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")

const authenticationRouter = require("./routes/authenticationRouter")
const driveRouter = require("./routes/driveRouter")
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient, Prisma } = require("@prisma/client")

const prisma = new PrismaClient()

require("dotenv").config()

const pool = new Pool({ connectionString: process.env.CONNECTION_STRING })

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      })

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.use(
  session({ 
    secret: process.env.SECRET, 
    resave: false, 
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    store: new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
)
app.use(passport.session());
app.use(express.urlencoded({ extended: false}))
app.use(express.json());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.messages = req.session.messages || [];
  req.session.messages = []; 
  next();
});

app.use("/drive", driveRouter);
app.use("/", authenticationRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(`<h1>An unexpected error occured!</h1>`);
});


app.listen(3000, () => {
  console.log("App listening on port 3000");
})