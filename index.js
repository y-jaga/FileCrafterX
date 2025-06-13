const express = require("express");
const cors = require("cors");
const folderRoutes = require("./src/router/folderRouter.js");
const fileRoutes = require("./src/router/fileRouter.js");
const { sequelize } = require("./models");

const app = express();

app.use(express.json());
app.use(cors());

//folders related routes
app.use("/folders", folderRoutes);

//files related routes
app.use("/folder-files", fileRoutes);

if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(() =>
      console.log("Database connection has been established successfully.")
    )
    .catch((err) => console.error("Unable to connect to the database:", err));
}

module.exports = { app };
