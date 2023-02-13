const express=require('express');
const app=express();
const morgan=require('morgan');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
require('dotenv').config();

const productRoutes= require('./routes/products.js')
const orderRoutes= require('./routes/orders.js')
const userRoutes=require('./routes/user.js')

mongoose.set("strictQuery", true);
const uri="mongodb+srv://Node-shop:"+process.env.MONGO_ATLAS_PW+"@api-rest-node-tutorial.6ta4nn4.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri);
//mongoose.connect('mongodb+srv://Node-shop:'+process.env.MONGO_ATLAS_PW+'@api-rest-node-tutorial.6ta4nn4.mongodb.net/?retryWrites=true&w=majoritymongodb+srv://Node-shop:<password>@api-rest-node-tutorial.6ta4nn4.mongodb.net/?retryWrites=true');


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(res.method=='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET')
        return res.status(200).json({});
    }
    next();
    })

app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/uploads',express.static('uploads'));
app.use('/user',userRoutes);

app.use((req,res,next)=>{
const error=new Error('Not found');
error.status=404;
next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
    })

module.exports=app;