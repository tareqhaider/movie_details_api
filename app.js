const express = require('express');
const database = require('mongoose');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookie = require('cookie-parser');
const bodyParser = require("body-parser");



const models = require('./models');
let actor = models.actor;
let user = models.user;
let movie = models.movie;

const server = express();
const port = process.env.port || 5000;

server.use(cookie()); 
server.use(session({secret: 'secret', saveUninitialized: true,cookie: { maxAge: 8*60*60*1000 }, resave:true}));

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());


server.get('/host/api/actors', async (request, response) => {
        try 
        {
            let result = await actor.find().select({'_id':0});
            await response.send(result);
        } 
        catch (error) 
        {
            response.status(500).send(error);
        }
    });

server.get('/host/api/movies', verify_token, (request,response) => {
        
    jwt.verify(request.token, 'secret', async (error,auth) => {

        if(error)
        {
            response.sendStatus(403);
        }
        else
        {
            try 
            {
            
             let result = await movie.find().populate('actors',{'_id':0}).select({'_id':0});
             await response.send({Movies: result, AuthenticationData: auth});
           
            } 
            catch (error) 
            {
            response.status(500).send(error);
            }
        }

    });
        
        
});

server.post('/host/api/user/signup', (request,response) => {
    
    //content-type - application/json

        let object = JSON.parse(JSON.stringify(request.body));
        
        try 
        {
            user.findOne({username:`${object.username}`}, (error,result) => {

                if(result === null)
                {
                    let temp = new user({ username: `${object.username}`,password: `${object.password}` });
                    temp.save();
                    jwt.sign({ username: `${object.username}`,password: `${object.password}` }, 'secret' ,(err,token) => response.json({token}));

                }

            }).exec();

        } 
        catch (error) 
        {
            response.status(500).send(error);
        }

});

server.post('/host/api/user/login',(request,response) => {
         
        let object = JSON.parse(JSON.stringify(request.body));
        
        try {
            
            if(object.username !== null && object.username !== '' && object.password !== null && object.password !== '') 
            {
                user.findOne({username:`${object.username}`,password:`${object.password}`}, (error,result) => {
                    if(result !== null)
                    {
                        jwt.sign({ username: `${result.username}`,password: `${result.password}` }, 'secret' ,(err,token) => response.json({token}));
                    }
                }).exec();
            }

        } 
        catch (error) 
        {
            response.status(500).send(error);
        }
        
});


server.listen(port, () => console.log(`Server Running on PORT:${port}`));

database.connect('mongodb://localhost:27017/MovieRental',{ useNewUrlParser: true, useUnifiedTopology: true })
        .then(() =>  console.log('Database Connected'))
        .catch((err) => console.error(err));

 
function verify_token(request,response,next){
    
    const bearerHeader = request.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){

        const bearer = bearerHeader.split(' ');

        const bearerToken = bearer[1];

        request.token = bearerToken;

        next();


    }
    else
    {

        response.sendStatus(403);

    }

}        