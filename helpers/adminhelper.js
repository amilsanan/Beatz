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
    }
}

