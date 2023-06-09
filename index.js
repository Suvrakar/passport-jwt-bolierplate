const _ = require('lodash');
const express = require('express') ;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const passport = require('passport');
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const cors = require("cors");


const PORT = process.env.PORT || 5000;
const users = [
    {
        id: 1,
        name: 'suvra',
        email: 'kar.suvra@gmail.com',
        password: '12346'
    },
];


const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'secret';

const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('payload received', jwt_payload);
    var user = users[_.findIndex(users, {id: jwt_payload.id})];
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});
passport.use(strategy);

const app = express();

app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.get('/', (req, res) => {

    res.json({"message":"Express is up"});
});

app.post("/login", function(req, res) {
    if(req.body.email && req.body.password){
      var email = req.body.email;
      var password = req.body.password;
    }
    var user = users[_.findIndex(users, {email: email})];
    if( ! user ){
      res.status(401).json({message:"no such user/email id found"});
    }
  
    if(user.password === password) {
      var payload = {id: user.id};
      var token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({message: "ok", token: token});
    } else {
      res.status(401).json({message:"passwords did not match"});
    }
  });

  app.get("/protected", passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json("Protected Route");
  });
  

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
