var db = require("../config/connection");
var collection = require("../config/collections")
let ObjectId=require('mongodb').ObjectId

module.exports={
      addBanner:(banner,callback)=>{
        try {
          db.get().collection(collection.BANNER_COLLECTION).insertOne({
              name:banner.name,
              description:banner.description,
              offer:banner.offer
          }).then((data)=>{
              console.log(data);
              callback(data.insertedId)
          })
        } catch (error) {
         reject(error)
        }
     },
     getAllBanners:()=>{
         return new Promise(async(resolve,reject)=>{
             try {
                 let Banners=await db.get().collection(collection.BANNER_COLLECTION).find().sort({_id:-1}).toArray()
                 resolve(Banners)
             } catch (error) {
                reject(error) 
             }
         })
     },
     getBannerDetail:(banid)=>{
         return new Promise((resolve,reject)=>{
            try {
              db.get().collection(collection.BANNER_COLLECTION).findOne({_id:ObjectId(banid)}).then((productDetail)=>{
                  resolve(productDetail)
              })
            } catch (error) {
             reject(error)
            }
         })
     },
     editBanner:(banid,productDetail)=>{
         console.log('editbaannenrrr');
         return new Promise((resolve,reject)=>{
              try {
                  db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:ObjectId(banid)},{
                    $set:{
                        name:productDetail.name,
                        description:productDetail.description,
                    }
                  }).then((response)=>{
                    resolve()
                  })
              } catch (error) {
                reject(error) 
              }
         })
     },
     deleteBanner:(banId)=>{
         console.log(banId);
         return new Promise((resolve,reject)=>{
             try {
                 db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:ObjectId(banId)}).then((response)=>{
                     resolve(response) 
                 })
             } catch (error) {
                reject(error) 
             }
         })
     }
    }