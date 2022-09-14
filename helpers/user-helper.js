var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");

const objectId = require('mongodb').ObjectId
const Razorpay=require('razorpay');

var instance = new Razorpay({ key_id: 'rzp_test_l1R1frsNXkrruh', key_secret: '4yATudDZJgYkSze6yXHZKlTb' })

module.exports = {
  doSignUp: (userData) => {

    userData.isBlocked = false
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          userData._id = data.insertedId;
          resolve(userData);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mailid: userData.mailid, isBlocked: false });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          // console.log(userData.Password)
          console.log(user.Password);;
          if (status) {
            console.log("success");
            response.user = user
            response.status = true
            resolve(response)
          } else {
            console.log("fail");
            resolve({ status: false })
          }
        });
      } else {
        console.log("lo fail");
        resolve({ status: false })
      }
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
      resolve(users)
    })
  },
  userblock: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) },
          {
            $set: { isBlocked: true }
          }
        )
      resolve()

    })

  },
  userunblock: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) },
          {
            $set: { isBlocked: false }
          }
        )
      resolve()

    })

  },


  addToCart: (proid, userId) => {
    console.log(proid, userId);
    let proObj = {
      item: objectId(proid),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {

      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == proid)
        console.log(proExist);
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId), 'products.item': objectId(proid) },
              {
                $inc: { 'products.$.quantity': 1 }
              }
            ).then(() => {
              resolve()
            })
        } else {

          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId) },
              {
                $push: { products: proObj }
              })
            .then((response) => {

              resolve()
            })
        }
      } else {

        let cartObj = {
          user: objectId(userId),
          products: [proObj]

        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj)
          .then((response) => {
            resolve()
          })

      }
    })

  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }

      ]).toArray()

      resolve(cartItems)
    })
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (cart) {
        count = cart.products.length

      }
      resolve(count)
    })
  },
  // changeProductQuantity:(details)=>{
  //   details.count=parseInt(details.count)
  //   return new Promise((resolve,reject)=>{
  //     db.get().collection(collection.CART_COLLECTION)
  //         .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
  //         {
  //           $inc:{'products.$.quantity':details.count}
  //         }
  //         ).then((result)=>{
  //           console.log(result);
  //           resolve()
  //         })
  //   })
  // }


  changeProductQuantity: (details) => {
    console.log("changeProductQuantity", details);
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: objectId(details.cart) },

            {
              $pull: { products: { item: objectId(details.product) } }

            }
          ).then((response) => {
            resolve({ removeProduct: true })
          })

      } else {
        db.get().collection(collection.CART_COLLECTION)

          .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },

            {
              $inc: { 'products.$.quantity': details.count }

            }
          ).then((response) => {
            resolve(true)
          })
      }

    })

  },
  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      console.log("remove help", details);
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },

          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then((response) => {
          resolve(true);
        });
    });
  },
  addToWishlist: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
    };
    console.log("add function");
    return new Promise(async (resolve, reject) => {
      let userWishList = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      console.log("add wish promise");
      if (userWishList) {
        let proExist = userWishList.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);
        if (proExist == -1) {
          console.log(proId);
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((data) => {

              resolve(data);
            });
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $pull: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let wishListObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishListObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getWishListProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishListItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(wishListItems);
    });
  },

  removeWishListProduct: (proId) => {

    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .deleteOne({ _id: objectId(proId) }).then((response) => {
          resolve(response)
        })
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
          }
        }

      ]).toArray()

      resolve(total[0].total)
    })
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      console.log(order, products, total);
      let status = order['payment-method'] === 'cod' ? 'Placed' : 'Pending'
      let orderObj = {
        deliveryDetails: {
          mobile: order.Phone,
          address1: order.Address1,
          address2: order.Address2,
          pincode: order.Pincode
        },
        userId: objectId(order.userId),
        paymentMethod: order['payment-method'],
        products: products,
        totalAmount: total,
        status: status,
        date: new Date()
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
        resolve(response.insertedId)

      })

    })

  },
  getCartProductList: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

      resolve(cart.products)

    })
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let orders = await db.get().collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) }).toArray()

      resolve(orders)
    })
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { _id: objectId(orderId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }

      ]).toArray()

      resolve(orderItems)
    })
  },
  generateRazorpay: (orderId,totalPrice) => {
    return new Promise((resolve, reject) => {
        var options = {
        amount: totalPrice*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: ""+orderId
        
      }
      instance.orders.create(options, function (err, order) {
        console.log("Neworder:",order)
        resolve(order)           
      })
    })
  },
  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{

      const crypto=require('crypto')
      let hmac=crypto.createHmac('sha256','4yATudDZJgYkSze6yXHZKlTb')
      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      console.log(details['payment[razorpay_order_id]']);
      console.log(details['payment[razorpay_payment_id]']);
      console.log(hmac);
      hmac=hmac.digest('hex')
      console.log(hmac);
      console.log(details['payment[razorpay_signature]']);
      if(hmac==details['payment[razorpay_signature]'])
      {
        resolve()
      }
        else{
          console.log("mooonji");
          reject()
        }
    })
  },
  changeOrderStatus:(orderId)=>{
    console.log(orderId);
      return new Promise((resolve, reject) => {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
        {
            $set:{
              status:'placed'
            }
        }
        ).then(()=>{
          resolve()
        })
      })

  }

}  