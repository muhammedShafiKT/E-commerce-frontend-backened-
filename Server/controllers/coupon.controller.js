import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";

 export const applycoupon= async (req,res)=>{
    try {
       const {couponcode} = req.body
       //cart finding
       const cart = await Cart.findOne({userId : await req.user.id})
       if(!cart||cart.items.length==0){
          res.status(400).json({message : "Cart is empty"})
       }

       //sum
    //    const total = cart.items.reduce((acc,item)=>{
    //    return acc+item.price*item.quantity
    //    },0)
const total = cart.items.reduce(
  (acc, item) => acc + item.price * item.qty,
  0
);

       //coupon find
       const coupon = await Coupon.findOne({code : couponcode , active : true})
       if(!coupon){
        res.status(400).json({message : "Coupon is invalid"})
       }
       //calc discount
       const discount = (total*coupon.discountpercent)/100
       const Finaltotal = total-discount
       res.json({
        message :"success",
        // cart,
        price : cart.items.price,
        total,
        discount,
        Finaltotal,
        coupon : coupon.code
       })
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "coupon failed"})
    }
}

export const getCoupon = async (req ,res)=>{
try {
    const coupons = await Coupon.find().sort({_id : -1})
   res.status(200).json(coupons)
} catch (error) {
   console.error(error)
   res.status(500).json({message : "failed to fetch coupons"})
}
}

export const createCoupon = async (req,res)=>{
  try {
   
    const {code , discountpercent ,active } = req.body

   if(!code || !discountpercent){
      res.status(400).json({message:"code and discount coupon required"})
   }

   const existing = await Coupon.findOne({code : code.toUpperCase()})
   if(existing){
         res.status(400).json({message:"coupon already exists"})
   }

   const coupon = await Coupon.create({
      code :  code.toUpperCase().trim(),
      discountpercent,
      active : active ?? true
   })
   res.status(201).json({message : "coupon created"})
  } catch (error) {
    console.error(error)
    res.staus(500).json({message : "failed to create coupon"})
  }
}

export const updateCoupon = async (req,res)=>{
   try {
      let coupon = await Coupon.findByIdAndUpdate(req.params.id,
         { $set : req.body},
         { new : true}
      )
      if(!coupon){
         res.status(404).json({message :"coupon not found"})
      }
      res.json(coupon)
   } catch (error) {
      console.error(error)
      res.status(500).json({message : "failed to update coupon"})
   }
}

export const deleteCoupon= async (req,res)=>{
   try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id)
        if(!coupon){
         res.status(404).json({message :"coupon not found"})
      }
      res.json({message :"coupon deleted"})
   } catch (error) {
      console.error(error)
      res.status(500).json({message : "failed to delete coupon"})
   }
}