const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    //create new user
    create: (req, res) => {
        //find users with this username
        db.User.findAll({ where: { userName: req.body.name } }).then(dbModal => {
            //if any show up tell the client their account cannot be created
          if (dbModal.length > 0) res.json({ userCreated: false });
          else {
              //otherwise hash the password and create the user
            bcrypt.hash(req.body.password, 10, (err, hash) => {
              db.User.create({
                userName: req.body.name,
                email: req.body.email,
                password: hash
              })
              //tell the client their account was successfully created
                .then(res.json({ userCreated: true }))
                .catch(err => console.log(err));
            });
          }
        });
      },
      //user log in
    logIn: (req, res) => {
        //find the user who wants to log in 
        db.User.findOne({ where: { userName: req.body.userName}})
        .then(data => {
            //compare the req's password to the stored password using bcrypt since db's password is hashed
            bcrypt.compare(req.body.password, data.dataValues.password).then(pwCheck => {
                //if the return is true, create a user object with their information
                if (pwCheck) {
                    user = {
                        id: data.id,
                        userName: data.datavalues.userName,
                        email: data.dataValues.email,
                        createdOn: data.dataValues.createdAt
                    };
                } else console.log(pwCheck)
                //assign a token to this user and send the user information and token back to the user
                jwt.sign({ user }, 'secretkey', (err, token) => {
                    if(err) throw err
                    else {
                        const data = [user, token];
                        res.json({ data })
                    }
                })
            })
        })
    }
};