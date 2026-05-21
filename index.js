import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import homeRoutes from './routes/home.js';
import adminRoutes from './routes/admin.js';
import session from 'express-session';



const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days (2 weeks)
  }
}))

app.use("/", homeRoutes);
app.use("/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});