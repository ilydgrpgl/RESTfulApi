
const express =require('express');
const router= express.Router();
const mongoose = require('mongoose');
const multer= require('multer');
const checkAuth =require('../middleware/check-auth');
//const upload= multer({dest: 'uploads/'});// gelen tüm dosyaları deoplayacağı klasör. ststic dosyaya çeviriyoruz.



//Nereye kaydedileceği
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    //Hangi isimle kaydedileceği
    filename: function (req, file, cb) {
        const uniqueName = new Date().toISOString().replace(/:/g, '-') + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};



const upload= multer ({
    storage: storage, 
    limits: {
    fileSize: 1024*1024*5
},
fileFilter: fileFilter
});


const Product = require('../models/product');

router.get('/', (req, res, next)=> {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then( docs => {
        const response= {
            count: docs.length,
        products: docs.map(doc=>
        {
            return{
                name:doc.name,
                price: doc.price,
                productImage: doc.productImage,
                _id:doc._id,
                request:{
                    type: 'GET',
                    url:' http://localhost:3000/products/'+doc._id
                }
            }
        }
        )
        };
            res.status(200).json(response);
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });

    });


router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded'
        });
    }
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created product succesfly',
                createdProduct:{
                   name: result.name,
                   price: result.price,
                   _id: result._id,
                   request:{
                    type: 'GET',
                    url:' http://localhost:3000/products/'+result._id

                   }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log(doc);
            if(doc)
            {
                 res.status(200).json({
                 product: doc,
                 request:{
                    type:'GET',
                    url: 'http://localhost:3000/products'
                 }
                 });
            }else{
                res.status(404).json({message: 'No Valid entry found for provided ID'});
            }
           
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});


    router.patch('/:productId', checkAuth, (req, res, next)=> {
        const id= req.params.productId;
        const updateOps= {};
        for(const ops of req.body)
        {
            updateOps[ops.propName]=ops.value;
        }
        Product.updateOne({_id: id}, {$set: updateOps})
        .exec()
        .then(result=> {
            res.status(200).json({
                message: 'product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+id
                }
            });
        })
        .catch(err=> {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
        });
        
        router.delete('/:productId', checkAuth,(req, res, next) => {
            const id = req.params.productId;
            Product.deleteOne({ _id: id })  // remove yerine deleteOne kullanılıyor
                .exec()
                .then(result => {
                    res.status(200).json({
                        message: 'Product deleted',
                        request:{
                            type: 'POST',
                            url:'http://localhost:3000/products',
                            body: {name: 'String', price: 'Number'}
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
        });
        

module.exports= router;