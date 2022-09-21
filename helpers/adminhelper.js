var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");

module.exports={
    doAdminLogin:(adminData)=>{
        return new Promise(async (resolve,reject)=>{
            console.log("test1");
            console.log(adminData);
            let loginStatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({mailid:adminData.mailid})
            console.log(admin);
            console.log("test4");
            if(admin){
                bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                    console.log("test3");
                    if(status){
                        console.log('login succes');
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                        resolve({status:false})
                        console.log('failed');
                    }

                })
            }else{
                resolve({status:false})
                console.log('no user');
            }
        })
    },
    getallOrders: () => {
        return new Promise(async (resolve, reject) => {     
          let orders = await db.get().collection(collection.ORDER_COLLECTION)
            .find().toArray()
             resolve(orders)
        })
      },
      //coupon

    addCoupon : (coupon) => {
        coupon.name= coupon.name.toUpperCase()
        coupon.user =[]
        coupon.discount = parseInt(coupon.discount)
        return new Promise(async(resolve,reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).findOne({name:coupon.name})
            if(coupons){
                reject('already exists')
            }else{
                db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response) => {
                    console.log("cou",coupon);
                    resolve(response)
                })
            }

        })
    },
    viewCoupon : () => {
        return new Promise(async(resolve,reject) => {
          let couponDetails = await  db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(couponDetails);
        })
    },
    deleteCoupon : (couponId) => {
        return new Promise(async(resolve,reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then((response)=>{
                resolve({status:true});
            }).catch(() => {
                reject();
            })
        })
    },
}


