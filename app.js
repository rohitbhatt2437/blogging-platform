const express = require('express')
const app = express()
const userModel = require('./models/user')
const postModel = require('./models/post')
const user = require('./models/user')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get('/', (req,res)=>{
    res.render("index")
})

app.post('/register', async (req,res)=>{
    let {name, email, username, age, password} = req.body
    let user = await userModel.findOne({email})

    if(user) return res.status(500).send("User already registered")

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password:hash,
            })

            let token = jwt.sign({email:email, userid:user._id}, "shhh")
            res.cookie("token", token)
            res.send("registered")  
         

        })
    })
})

app.get('/login', (req,res)=>{
    res.render("login")
})

app.get('/profile', isLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email:req.user.email}).populate("posts")
    
    res.render("profile", {user})
    
})

app.post('/post', isLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email:req.user.email})
    let {content} = req.body
    let post = await postModel.create({
        user:user._id,
        content,
    })
    user.posts.push(post._id)
    await user.save()   
    res.redirect("profile")
})

app.post('/login',async (req,res)=>{
    let {email, password} = req.body
    let user = await userModel.findOne({email})

    if(!user) return res.status(500).send("Something went wrong")

    else{bcrypt.compare(password, user.password, (err, result)=>{
        if(result) {
            let token = jwt.sign({email:email, userid:user._id}, "shhh")
            res.cookie("token", token)
            res.status(200).render("profile")
            
        }
        res.redirect("/login")
    })
}
})

app.get('/logout', (req,res)=>{
    res.cookie("token", "")
    res.redirect("/login")
})

function isLoggedIn(req,res, next){
    if(req.cookies.token == "") res.redirect("/login")

    else{
        let data = jwt.verify(req.cookies.token, "shhh")
        req.user = data
    }
    next()
}

app.listen(3000)