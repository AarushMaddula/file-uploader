const { Router } = require("express")
const authenticationRouter = Router();

const passport = require("passport")
const userController = require("../controllers/usersController")

authenticationRouter.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

authenticationRouter.get("/log-in", (req, res) => {
  res.render("log-in");
});

authenticationRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/drive/my-drive",
    failureRedirect: "/log-in", 
    failureMessage: true 
  })
)

authenticationRouter.get("/log-out", (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  })
})

authenticationRouter.get("/sign-up", (req, res) => {
  res.render("sign-up");
});

authenticationRouter.post("/sign-up", userController.createUser)

module.exports = authenticationRouter;