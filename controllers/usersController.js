const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient()

const storage = require("./storageController.js")

const validateUser = [
  body("username").trim().toLowerCase()
    .isAlphanumeric().withMessage("Username must contain only letters and numbers.")
    .isLength({ min: 1, max: 20 }).withMessage("Username must be between 1 - 20 characters.")
    .custom(async (value, { req }) => {
        const user = await prisma.user.findUnique({
          where: {
            username: value,
          },
        })

        if (user) throw new Error("Username already exists");

        return true;
    }),
  body("password").trim()
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("confirm-password").trim()
    .custom(async (value, { req }) => {
      if (req.body.password != value) {
        throw new Error("Passwords do not match.");
      }

      return true;
    })
  ];

exports.createUser = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", { errors: errors.array(), oldData: req.body });
    }

    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { username: username, password: hashedPassword } })

      storage.handleCreateUserBucket(user.id);

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.redirect("/drive/my-drive"); 
      });

    } catch (error) {
      console.error(error);
      next(error);
    }
  }
];