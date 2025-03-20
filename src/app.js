const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profle");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cookieParser());



app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true, // Allow cookies
  })
);


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Connected to DB");
    app.listen(3000, () => {
      console.log(`Server is running : http://localhost:3000`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1); // exit immediately if connection fails to DB
  });
