var express = require('express');
var router = express.Router();

const userModel = require('./users');
const itemModel = require('./items');
const passport = require('passport');
const passportLocal = require('passport-local');
const { escapeRegExpChars } = require('ejs/lib/utils');

passport.use(new passportLocal(userModel.authenticate()));

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/home',isLoggedIn,async function(req,res){
  let LoggedInUser = await userModel.findOne({username: req.session.passport.user})
  // .populate('cart')
  let allItems = await itemModel.find()

  // to predict item list while seraching
  let arr = [];
  allItems.forEach(elem=>{
    arr.push(elem.itemName.toLowerCase().split(' ').join(''))
  })
  // page rendering
  res.render('home',{allItems,LoggedInUser})
})

// redirecting on register page
router.get('/user/register',function(req,res){
  res.render('register');
})

// create route to render on create page
router.get('/create',function(req,res){
  res.render('create')
})

// create items
router.post('/create',async function(req,res){
  let createdItem = await itemModel.create({
    itemName: req.body.name,
    itemPrice: req.body.price,
    itemDes: req.body.des,
    itemImg: req.body.img
  })
  res.redirect('/create')
})

// read all items and show
router.get('/show',async function(req,res){
  let allItems = await itemModel.find()
  res.send(allItems)
})

// add item to cart
router.get('/add/:Itemid',async function(req,res){
  let lUser = await userModel.findOne({username: req.session.passport.user})
  if(lUser.cart.indexOf(req.params.Itemid)===-1){
    lUser.cart.push(req.params.Itemid)
    let additem = await lUser.save()
    res.redirect(req.headers.referer)
  }
  else{
    // var address = lUser.cart.indexOf(req.params.Itemid)
    // lUser.cart.splice(address,1);
    res.redirect(`/in/${req.params.Itemid}`)
  }
  
})

// show cart
router.get('/cart',isLoggedIn,async function(req,res){
  let lUser = await userModel.findOne({username: req.session.passport.user})
  .populate('cart')
  res.render("cart",{lUser})
  // res.send(lUser)
})

// increase quantity of item in cart 
router.get('/in/:itemId',async function(req,res){
  let foundItem = await itemModel.findOne({_id: req.params.itemId})
  foundItem.qty += 1;
  await foundItem.save();
  res.redirect(req.headers.referer)
})

// decrease quantity of item in cart
router.get('/dec/:itemId',async function(req,res){
  let foundItem = await itemModel.findOne({_id: req.params.itemId})
  if(foundItem.qty > 1){
    foundItem.qty -= 1;
    await foundItem.save();
    res.redirect(req.headers.referer)
  }
  else{
    res.redirect(`/remove/${foundItem._id}`)
  }
  
})

// remove product from cart
router.get('/remove/:itemId',async function(req,res){
  let lUser = await userModel.findOne({username: req.session.passport.user})
  let address = lUser.cart.indexOf(req.params.itemId)
  lUser.cart.splice(address,1);
  await lUser.save();
  let foundItem = await itemModel.findOne({_id: req.params.itemId})
  foundItem.qty = 1;
  await foundItem.save();
  res.redirect(req.headers.referer)
})

//check items in list (CONTAINING PART OF STRING)
// router.get('/check/:itname',async function(req,res){
//   var s = `${req.params.itname}`
//   var regex = new RegExp(s, 'i') // i for case insensitive
//   var gotitName = await itemModel.find({itemName: {$regex: regex}})
//   res.json(gotitName)
// })

//check items in list (STARTING WITH THE TYPED STRING)
router.get('/check/:itname',async function(req,res){
  var search_text = `${req.params.itname}`
  var resultnew = await itemModel.find({ itemName : { $regex: '^' + search_text, $options: 'i' } }).exec();
  // console.log(resultnew)
  res.json(resultnew);
})

//check items in list (ENDING WITH THE TYPED STRING)
// router.get('/check/:itname',async function(req,res){
//   var search_text = `${req.params.itname}`
//   var resultnew = await itemModel.find({ itemName : { $regex: search_text + '^' , $options: 'i' } }).exec();
//   res.json(resultnew)
// })

router.get('/item/:id', isLoggedIn, async function(req,res){
  try {
    let LoggedInUser = await userModel.findOne({username: req.session.passport.user})
    let foundItem = await itemModel.findById(req.params.id);
    res.render('item',{foundItem, LoggedInUser});
  } catch (error) {
    console.log(error.message)
    return res.redirect('/')
  }
})

// register user
router.post('/register',function(req,res){
  const newUser = new userModel({
    username: req.body.username,
    email: req.body.email
  })
  userModel.register(newUser,req.body.password)
    .then(function(){
      passport.authenticate('local')(req,res,function(){
        res.redirect('/home');
      })
    })
    .catch(function(e){
      res.send(e);
    })
})

// login user
router.post('/login',passport.authenticate('local',{
  successRedirect: '/home',
  failureRedirect: '/'
}),function(req,res){});

// logout user
router.get('/logout',function(req,res){
  req.logOut();
  res.redirect('/');
})

// isLoggedIn middleWare
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

module.exports = router;