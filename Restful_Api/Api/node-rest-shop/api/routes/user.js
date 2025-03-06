const express =require('express');
const router= express.Router();
const mongoose = require('mongoose');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');

const User= require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email})
    .exec()
    .then(user=>{
        if(user.length>=1){
            return res.status(409).json({
                message: 'Mail exists'
            });
        }else{
            // "tuzlama" (salting) işlemi yapılıyor. 
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        } else {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
            });

            user.save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: 'User created'
                    });
                })
                .catch(err => {
                    console.error("Hata oluştu:", err); // Hata mesajını logla
                    res.status(500).json({
                        error: err.message || "Bilinmeyen bir hata oluştu"
                    });
                });
                
        }
    });
        }
    })
    
});
router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

             // Şifreyi doğrulamak için bcrypt.compare kullanılıyor.
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    // Kullanıcı doğru şifreyi girdiyse, JWT (JSON Web Token) oluşturuluyor.
                   const token=  jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    },
                process.env.JWT_KEY, // Gizli anahtar ile imzalanıyor.
                {
                    expiresIn: "1h"
                }
            );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                return res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});



router.delete('/:userId', (req, res, next) => {
              User.deleteOne({_id: req.params.userId})
                .exec()
                .then(result => {
                    res.status(200).json({
                        message: 'User deleted',
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
        });


module.exports= router;