
var express = require('express');

var router = express.Router();
const userHelpers = require('../helpers/user-helper')
const productHelpers = require('../helpers/productHelpers')
const adminHelpers = require('../helpers/adminhelper')
const offerHelper = require('../helpers/offer-helper')

//login verification middleware
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    req.redirect('/')
  }
}


/* GET home page. */
router.get('/', function (req, res, next) {
  let session = req.session.user
  productHelpers.getAllProducts().then((products) => {
    res.render('index', { session, products })
  })

});
/* GET signup page. */
router.get('/signup', function (req, res, next) {

  res.render('users/User-Signup');

});
/* POST User-signup page register form.*/
router.post('/signup', function (req, res) {

  userHelpers.doSignUp(req.body).then((response) => {
    req.session.user = req.session.body
    res.redirect('/')
  })


})

/* GET User-Login page*/
router.get('/login', function (req, res, next) {
  res.render('users/User-login',);

});
/* POST User-Login.    */

router.post('/login', function (req, res) {

  userHelpers.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.userlogged = true
      req.session.user = response.user
      res.redirect('/')

    } else {
      res.redirect('/login')
    }

  })


  console.log(req.body);

})


router.get('/logout', function (req, res,) {
  req.session.destroy()
  res.redirect('/')

})



router.get('/shop', (req, res) => {
  let session = req.session.user
  productHelpers.getAllProducts().then((products) => {
    res.render('users/shop', { session, products })
  })
})




router.post("/add-to-cart", (req, res) => {
  console.log("api call");
  console.log(req.body);
  console.log(req.session.user._id);
  userHelpers.addToCart(req.body.productId, req.session.user._id).then(() => {
    console.log('done');
    res.json({ status: true })
  })

})

router.get("/cart", async (req, res) => {
  let session = req.session.user;
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = 0;

  if (products.length > 0) {
    total = await userHelpers.getTotalAmount(req.session.user._id)
  }
  let coupon = req.session.coupon
  let discount = req.session.discount
  res.render("users/Cart", { products, total, session, coupon, discount });
  console.log(total);
});

router.post('/change-product-quantity', (req, res, next) => {
  console.log('ji', req.body);
  userHelpers.changeProductQuantity(req.body).then((response) => {
    console.log(response)
    res.json(response)
  })
})


router.post('/remove-from-cart', (req, res) => {
  console.log("remove", req.body);
  userHelpers.removeCartProduct(req.body).then((response) => {
    console.log("123");
    res.redirect('cart')
  })
})

router.post("/addtowishlist/", (req, res) => {
  console.log("add wish list route initiated");
  console.log(req.body);
  userHelpers.addToWishlist(req.body.productId, req.session.user._id).then(() => {
    res.json({ status: true });
    // res.redirect('/')
  });
});


router.post("/removefromwishlist", (req, res, next) => {
  console.log(req.body);
  userHelpers.removeWishListProduct(req.body.productId).then((response) => {
    res.json(response);
  });
});

router.get("/wishlist", async (req, res) => {
  let products = null;
  a = 1
  if (a = 1) {

    products = await userHelpers.getWishListProducts(req.session.user._id);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    console.log("prod  ", products);
    res.render("users/wishlist", {
      products,
      user: req.session.user,
    });
  }
  else {
    req.session.loginerr = true;
    res.render("users/wishlist");
  }
});

//Coupon
router.post('/apply-coupon', (req, res) => {
  let session = req.session.user;
  offerHelper.applyCoupon(req.body, req.session.user._id).then((response) => {
    if (response.status) {
      req.session.coupon = response.coupon;
      req.session.discount = response.discountTotal
      // console.log("user",req.session.coupon);
    }
    // console.log('user coup', response);
    res.json(response)
  })
})

router.get("/checkout", async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  total = await userHelpers.getTotalAmount(req.session.user._id)
  let coupon = req.session.coupon
  let user = req.session.user
  let discount = req.session.discount
  res.render('users/checkout', { total, products, user, coupon, discount })
})
router.post("/checkout", async (req, res) => {
  
  console.log('hii bishr');
  console.log(req.body);
  let products = await userHelpers.getCartProductList(req.body.userId)
  console.log(products);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  console.log(totalPrice);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] == 'cod') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)

      })

    }
  })
  req.session.discount = null;
  req.session.coupon = null;

})
router.get("/orders", async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('users/orders', { user: req.session.user, orders })
})

router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  console.log("hhhhh", products);
  res.render('users/view-order-products', { user: req.session.user, products })
})

router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changeOrderStatus(req.body['order[receipt]']).then(() => {
      console.log("payment successful");
      res.json({ status: true })
    })

  })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "payement failed" })

    })

})

module.exports = router;
