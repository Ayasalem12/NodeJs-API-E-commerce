const fs = require('fs').promises;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer  = require('multer')
const usersRoutes = require('./routes/users');
const AppError = require('./utlis/AppError')
const port = 3000;

dotenv.config();

// Middleware
app.use(express.json());

// uploads file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix+'_'+file.originalname)
  }
})
const upload = multer({ storage: storage })
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  res.send("File uploaded!")
  // console.log()
})


app.set('view engine', 'pug');
app.set('views', './views'); // Set the views directory
// Routes

app.use('/users', usersRoutes);

// Custom 404 Middleware 
app.use((req, res, next) => {
  next(new AppError(404,'Route not found'))
  // res.status(404).json({ status: "fail", message: "Route not found" });
});

// Error-Handling Middleware 
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ status: "error", message: err.message || "Something went wrong, try again later" });
  // res.status(500).json({ status: "fail", message: "Something went wrong, try again later" });
});

mongoose.connect('mongodb://127.0.0.1/db_ecommerce', {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Connection error:', err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});