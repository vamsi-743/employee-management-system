const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectToDatabase = require("./misc/db");
const { updateSubscriptions } = require("./subscriptionScheduler");

const port = 3030;


const EMSusersRouter = require("./routes/EMS_users.route.js");
const EMSorganizationRouter = require("./routes/EMS_organization.route.js");
const fileRouter = require("./routes/file.route.js");
const EMSemployeeRouter = require("./routes/EMS_employee.route.js");
const EMSdesignationRouter = require("./routes/EMS_designation.route.js");
const EMSdepartmentRouter = require("./routes/EMS_department.route.js");
const EMSprojectsRouter = require("./routes/EMS_projects.route.js");
const EMStasksRouter = require("./routes/EMS_tasks.route.js");


const { join } = require("path");
const { create } = require("domain");
// const { sendSMS } = require('./services/sms');

const app = express();
// const server = createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
console.log("Project path :" + __dirname);
app.use("/", express.static(join(__dirname, "public")));
const corsOptions = { credentials: true, origin: "*" };
app.use(cors(corsOptions));

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);


app.use(EMSusersRouter);
app.use(EMSorganizationRouter);
app.use(fileRouter);
app.use(EMSemployeeRouter);
app.use(EMSdesignationRouter);
app.use(EMSdepartmentRouter);
app.use(EMSprojectsRouter);
app.use(EMStasksRouter);


require("./subscriptionScheduler");

app.get("/", async (req, res) => {
  try {
    await connectToDatabase();
    console.log("Connection successful. ");
    return res.status(200).json({ message: "Connection successful." });
  } catch (err) {
    return res.status(500).send("Could not connect to the database.");
  }
});

// call the updateSubscriptions function
app.get("/api/updateSubscriptions", async (req, res) => {
  try {
    await updateSubscriptions();
    res.status(200).json({ message: "Subscriptions updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
