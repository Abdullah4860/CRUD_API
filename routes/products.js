const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const multer=require('multer');
const checkAuth=require('../middleware/check-auth.js');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
            cb(null,'./uploads/');
    },
    filename:function(req,file,cb){
         cb(null, Date.now()+file.originalname);
    }
});

const fileFilter=(req,file,cb)=>{
    //reject a file
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/png'){
        cb(null,true);
    }else{
    cb(null,false);
    }
}

const upload=multer({storage:storage, limits:{
    fileSize:1024*1024*5
},
fileFilter:fileFilter
});

const Product=require('../models/product.js');

router.get('/',(req,res,next)=>{
   Product.find().select('name price _id productImage').
   exec().
   then(docs=>{
    const response={
        count:docs.length,
        products:docs.map(doc=>{
            return{
                name: doc.name,
                price:doc.price,
                productImage:doc.productImage,
                _id:doc._id,
                request:{
                    type:'GET',
                    URL:'http://localhost:3000/products/'+doc._id
                }
            }
        })
    }
    console.log(docs);
    res.status(200).json(response);
   }).
   catch(err=> {
    console.log(err);
    res.status(500).json({
        error:err
    });
   })
})

router.post('/', checkAuth ,upload.single('productImage'), (req,res,next)=>{
   
    const product=new Product({
        _id:mongoose.Types.ObjectId(),
        name: req.body.name,
        price:req.body.price,
        productImage:req.file.path
    });
    product.save().then(result=>{
        console.log(result);
        res.status(200).json({
            message: 'Created Product Successfully',
            CreatedProduct:{
                name:result.name,
                price:result.price,
                _id:result._id,
                request:{
                    type:'GET',
                    URL:'http://localhost:3000/products/'+result._id
                }
            }
        });
    }).catch(err=>
            {
                console.log(err);
        res.status(500).json({error:err});
            }
        );
    

   
})

router.get('/:productId',(req,res,next)=>{
     const id=req.params.productId;
     Product.findById(id).select('name price _id productImage')
     .exec()
     .then(doc=>{
        if(doc){
            console.log(doc);
            res.status(200).json({
                product :doc,
                request:{
                    type:'GET',
                    URL:'http://localhost:3000/products'
                }
            });
        }
        else{
            res.status(501).json({
                message: "No Product was found for the provided ID"
            })
        }
        
     })
     .catch(err=>{
        
        console.log(err);
        res.status(500).json({error:err});
     });

})

router.patch('/:productId',checkAuth ,(req,res,next)=>{
    const id=req.params.productId;
    const updateOps={};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    
    Product.update({_id:id}, { $set : updateOps}).
    exec().
    then(result=>{
      
        res.status(200).json({
            message: 'Product successfully updated',
            request:{
                type:'GET',
                URL:'http://localhost:3000/products/'+id
            }
        });
    }).
    catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    })
});

router.delete('/:productId',checkAuth ,(req,res,next)=>{
    const id=req.params.productId;
    Product.remove({_id : id}).exec().
    then(result =>{
        res.status(200).json({
            message:'Product deleted Successfully',
            request:{
                type:'POST',
                URL:'http://localhost:3000/products',
                body:{
                    name:'String',
                    price:'Number'
                }
            }
        });
    }).
    catch(err=>{
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
});


module.exports=router;