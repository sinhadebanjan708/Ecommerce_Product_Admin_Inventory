require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const { createDefaultTicket } = require("./controllers/taskController");
require("./logger");
// const { sequelize } = require('./src/models');

const db = require("./models"); // import the file where all associations are defined
const sequelize = db.sequelize;
const PORT = process.env.PORT || 5000;

const auth = require("./middlewares/auth");
// const errorHandler = require("./middlewares/errorHandler");
// const authController = require("./controllers/authController");
// const taskController = require("./controllers/taskController");
// const adminController = require("./controllers/adminController");
// const reportController = require("./controllers/reportController");
// const seedColorsOnce = require("./controllers/seedcolorController");

const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());


app.use((req, res, next) => {
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.originalUrl);
  console.log("Request Body:", req.body);
  next();
});

// Route Handling
// app.use("/api/taskStatusInfo", require("./routes/taskStatusInfoRouter"));
// app.use("/api/ticketingSystem", require("./routes/ticketingSystemRouter"));
app.use("/api/ecommerce", require("./routes/auth.route"));
app.use("/api/ecommerce", require("./routes/customerAddressRouter"));
app.use(
  "/api/ecommerce/admin",
  require("./routes/adminProduct.route")
);

app.use(
  "/api/ecommerce/products",
  require("./routes/customerProduct.routes")
);


app.use(
  "/api/ecommerce/cart",
  require("./routes/cart.routes")
);

app.use(
  "/api/ecommerce/checkout",
  require("./routes/checkout.route")
);

// app.use(
//   "/api/ecommerce/payments",
//   require("./routes/payment.route")
// );

// app.use(
//   "/api/ecommerce/admin/inventory",
//   require("./routes/adminInventory.route")
// );

// // IN USE
// app.use("/api/application", require("./routes/applicationRouter"));
// app.use("/api/report", require("./routes/reportRouter"));
// app.use("/api/module", require("./routes/moduleRouter"));
// app.use("/api/client", require("./routes/clientRouter"));
// app.use("/api/users", require("./routes/usersRouter"));
// app.use("/api/timeSheet", require("./routes/timesheetRouter"));

//Report Generate
//Weekly Report Get Call

// app.use("/api/reports/weekly", require("./routes/reportRouter"));
// app.post("/api/reports/pdf", reportController.taskPdf);

//app.use('/api/email/send', emailRoutes);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected successfully");

    // STEP 1 — Sync DB first (creates tables)//
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: false });
    } else {
      await sequelize.sync();
    }
    console.log("DB synced — tables created");

    // // STEP 2 — Seed Colors (NOW the table exists)
    // await seedColorsOnce.seedColorsOnce();

    // // STEP 3 — Admin creation (requires Users table)
    // await seedColorsOnce.run();

    // await createDefaultTicket();

    // console.log("Seeding completed");

    // STEP 4 — Start API
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start app", err);
    process.exit(1);
  }
}

// 🧹 Graceful shutdown handler
process.on("SIGINT", async () => {
  console.log("\n🛑 Caught SIGINT, closing database connection...");
  await db.sequelize.close();
  console.log("✅ Database connection closed. Exiting...");
  process.exit(0);
});

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
