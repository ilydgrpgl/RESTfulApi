const express = require('express');
const app= express();
const morgan = require('morgan');
const bodyParser = require('body-parser');//middleware'leri özellikle POST işlemlerinde gelen veriyi okumak ve işlemek için kullanılır.
const mongoose= require('mongoose');


const productRoutes= require('./api/routes/products');
const orderRoutes= require('./api/routes/orders');
const userRoutes= require('./api/routes/user');


mongoose.connect('mongodb+srv://ilaydaagaripoglu:'+ process.env.MONGO_ATLAS_PW+'@node-rest-shop.14bdn.mongodb.net/?retryWrites=true&w=majority&appName=node-rest-shop',{

}
    
)

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>
{
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Reguested-With Content-Type, Accept, Authorization"
    );
    if(req.method=== 'OPTIONS')
    {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();

})



app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);


app.use((req, res, next)=>{
    const error= new Error('Not Founs');
    error.status(404);
    next(error);
})

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
    next(error);
})

module.exports=app;