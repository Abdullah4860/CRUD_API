const express=require('express');
const { default: mongoose } = require('mongoose');
const router=express.Router();

const Order=require('../models/orders.js');
const Product = require('../models/product.js');
const checkAuth=require('../middleware/check-auth.js');

router.get('/',checkAuth ,(req,res,next)=>{

   Order.find().select('product quantity _id')
   .populate('product','name')
   .exec()
   .then(docs=>{
    console.log(docs);
    res.status(201).json({
        count : docs.length,
        orders : docs.map(doc=>{
            return {
                product:doc.product,
                quantity:doc.quantity,
                id:doc._id,
                request:{
                    type:'GET',
                    URL:'http://localhost:3000/orders/'+doc._id
                }
            }
        })
    });
   })
   
   .catch(err=>{
    console.log(err);
    error:err;
   })
    
});

router.post("/",checkAuth , (req, res, next) => {
    Product.findById(req.body.productId)
      .then(product => {
        if (product) {
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
              });
               order.save().then(result => {
                console.log(result);
                 res.status(201).json({
                  message: "Order stored",
                  createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                  },
                  request: {
                    type: "GET",
                    url: "http://localhost:3000/orders/" + result._id
                  }
                });
              }).catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
        }
        else{
            return res.status(404).json({
                message: "Product not found"
              });
        }
            
          
          
        })
        
        
   
    
  });

router.get('/:orderId',checkAuth ,(req,res,next)=>{
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message :'Order not found'
            });
        }
        res.status(200).json({
            order:result,
            request: {
                type:'GET',
                URL:'http://localhost:3000/orders'
            }})
        
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    });
})



router.delete('/:orderId',checkAuth ,(req,res,next)=>{
    Order.remove()
    .exec()
    .then(result=>{
        res.status(200).json({
            Message:'Order deleted',
            request: {
                type:'POST',
                URL:'http://localhost:3000/orders',
                body:{
                    productId:"ID",
                    quantity:'Number'
                }
            }})
        
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    });
})



module.exports=router;