import route from "./root.js"
import express from "express"
import {connect} from "mongoose"

connect('mongodb+srv://tonyesteban92:ArBrJ3rUB8J0fe7e@cluster0.mtw1yuy.mongodb.net/Paris')
.then(function(){
    console.log("connexion mongo réussie")
})
.catch(function(err){
    console.log(new Error(err))
})

const app = express();
const PORT = 1235;

app.use("", route);

app.listen(PORT, function(){
    console.log (`server express écoute sur le port ${PORT}`)
});
