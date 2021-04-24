const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('./auth');
const SignUpModel = require('../models/SignUpModel');
const PostMessage = require('../models/PostMessage');
const mongoose = require('mongoose');

router.post('/signup',async(req,res)=>{

    try {
        const {fullName,userName,email,password} = req.body;
    
    if(!fullName || !userName || !email || !password)
    return res.status(400).send(`Not all fields are entered`);
    
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password,salt);

    const signedUpUser = new SignUpModel({
        fullName : fullName,
        userName : userName,
        email : email,
        password : hashPassword
    })
        const signedUpUserCopy = await signedUpUser.save();
        //res.send(signedUpUserCopy);
        
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/signin',async(req,res)=>{

    try {
        const {userName,password} = req.body;
        if(!userName || !password)
        return res.status(400).send(`Not all fields are entered`);
        const user = await SignUpModel.findOne({userName:userName});
        const isMatch = await bcrypt.compare(password,user.password);
        if(isMatch){
            res.status(201).json('Signed in');
            const token = jwt.sign({id : user._id}, process.env.TOKEN_SECRET);
            //res.header('auth-token' , token);
        }else{
            res.send('Invalid Login Details')
        }
    

    } catch (error) {
        res.status(400).send('Invalid Login Details');
    }
})

router.get('/authtest', verify ,(req,res)=>{


})

//get(display) all posts
router.get('/posts',async(req,res)=>{
    try {
        const postMessages = await PostMessage.find();
        res.status(200).json(postMessages);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
})

router.get('/posts/:id', async(req,res)=>{
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})

//create new posts
router.post('/createposts', async(req,res)=>{
    
    try {
        const post = req.body;
        const newPost = new PostMessage(post);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({message : error.message});
    }

}
)

//update posts
router.patch('/updateposts/:id',async(req,res)=>{
    
        const {id : _id} = req.params;
        const post = req.body;
        if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('no post with that id');
        const updatedPost = await PostMessage.findByIdAndUpdate(_id,post,{new : true});
        res.json(updatedPost);
    
})


//delete posts
router.delete('/deleteposts/:id',async(req,res)=>{
    try {
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('no post with that id');
        await PostMessage.findByIdAndRemove(id);
        //res.json({message : 'deleted'});
    } catch (error) {
        
    }

})

//update likes
router.patch('/updatelikes/:id',async(req,res)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('no post with that id');
    const post = await PostMessage.findById(id);
    const updatedPost = await PostMessage.findByIdAndUpdate(id,{likeCount: post.likeCount+1},{new:true});
    res.json(updatedPost);
})
module.exports = router;