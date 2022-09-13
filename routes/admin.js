
var express = require('express');

var router = express.Router();

const userHelpers = require('../helpers/user-helper')
const productHelpers = require('../helpers/productHelpers')
const adminHelper = require('../helpers/adminhelper')
const adminLoginVerify=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin')

  }
}
/*admin route*/


router.get('/', function (req, res, next) {
    res.render('admin/admin-login');
  
  })


  router.post('/',(req,res)=>{
  
    adminHelper.doAdminLogin(req.body).then((response)=>{
      let a=1
     if(a=1){
      console.log("");
      req.session.adminLoggedIn=true
      req.session.admin=response.admin
      res.render('admin/admin-dashboard')
     }else{
      res.redirect('/admin')
     }
    })
  })

  router.get('/admin-viewproducts', function (req, res, next) {
    console.log('test2');
    productHelpers.getAllProducts().then((products)=>{
      res.render('admin/view-products',{products})
    })
    
  })

   router.post('/addproduct', (req, res) => {
    productHelpers.addProduct(req.body, (id) => {
      let image = req.files.Image
      console.log(id);
      image.mv('./public/product-images/' + id + '.jpg', (err) => {
        if (!err) {
          console.log("unda");
          res.redirect('/admin/admin-viewproducts')
        } else {
          console.log(err);
        }
      })
  
    })
  })
  
  router.get('/delete-product/:id',(req,res)=>{
let proId=req.params.id
console.log(proId);
productHelpers.deleteProduct(proId).then((response)=>{
  res.redirect('/admin/admin-viewproducts')
})
})


router.get('/view-users',(req,res)=>{
  userHelpers.getAllUsers().then((users)=>{
    
    res.render('admin/view-users',{users})
  })
 
})
router.get('/edit-product/:id',async (req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product} )
})
router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id);
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/admin-viewproducts')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/admin-assets/product-images/'+id+'.jpg')
    }
  })
})

router.get('/block/:id',(req,res)=>{
  userHelpers.userblock(req.params.id).then(()=>{
    res.redirect('/admin/view-users')
})
})
router.get('/unblock/:id',(req,res)=>{
  userHelpers.userunblock(req.params.id).then(()=>{
    res.redirect('/admin/view-users')
})
})

// router.get('/admin-logout',(req,res)=>{
//   req.session.adminLoggedIn=false
//     req.session.admin=null
//   res.redirect('/admin')
// })

module.exports = router;
