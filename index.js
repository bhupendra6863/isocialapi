const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const router = express.Router();
const path = require("path");
const cors = require("cors");

dotenv.config();

const PORT = process.env.PORT || 5000
const BASE_URL = process.env.BASE_URL

app.use(cors({
  origin:BASE_URL,
  credentials:true
}));

mongoose.connect(process.env.MONGO_URL,
  { useNewUrlParser: true, 
    useUnifiedTopology: true
  }).then(() => {
    console.log("Connected to MongoDB");
  }).catch((err)=>{
    console.log(err)
  })
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

app.get("/api/test", async (req, res) => {
  try {
    res.send("Hi My name is Bhupendra Singh and this is isocialapi");
  } catch (err) {
    res.status(500).json(err)
  }
});

app.get("/", async (req, res) => {
  try {
    res.json({routes : {
      test: "/api/test",
      auth: "/api/auth",
      etc: "/api/..."
    }});
  } catch (err) {
    res.status(500).json(err)
  }
});

if(process.env.NODE_ENV=="production"){
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,'client','build','index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Backend server is running at ${PORT}!`);
});
