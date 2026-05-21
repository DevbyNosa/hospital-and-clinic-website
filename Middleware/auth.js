import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';




export const isAuthenticated = (req, res, next) => {
  try {
     if(!req.session || !req.session.user) {
       return res.redirect("/admin");
     }

     next();
  } catch (error) {
     console.error('Error in authentication middleware', error);
    res.status(500).send('Internal Server Error');
  }
}
export const authPostMiddleware = async (req, res, next) => {
  try {

    const {admin_email, admin_password} = req.body;

   if (admin_email.length < 8 || admin_password.length < 8) {
     return res.render("auth.ejs", {
      errorMessage: "Email or Password must above 8 Chars"
    })
    } 

    if(!admin_email.includes("@")) {
      return res.render("auth.ejs", {
        errorMessage: "Email must include @"
      })
    }

   const result = await pool.query('SELECT email_address, password FROM admincredentials WHERE id = 1');


    if(!result.rows[0])
      return res.render("auth.ejs", {
      errorMessage: "Invalid Admin Credentials"
    })

    if (admin_email !== result.rows[0].email_address) {
      return res.render("auth.ejs", {
        errorMessage: "Invalid Admin Credentials"
      });
    }
      
    const adminPassword = result.rows[0].password;

    const comparePassword = await bcrypt.compare(admin_password, adminPassword);

    if(!comparePassword)
      return res.render("auth.ejs", {
      errorMessage: "Inavlid Admin Credentials"
    })

    req.session.user = {
      id: result.rows[0].id,
      email: result.rows[0].email_address
    };

    req.session.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

     return res.redirect("/admin/dashboard")
    })

    
    

  } catch (error) {
    console.error('Error in authentication middleware', error);
    res.status(500).send('Internal Server Error');
  }
}

