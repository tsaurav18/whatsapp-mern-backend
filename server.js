// importing all the stuffs 
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import cors from 'cors'
import Pusher from "pusher"

//app config
const app = express()
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1139013",
    key: "7d14c4be60c90ae6aa4f",
    secret: "1cf8d72f214a2e3c68c8",
    cluster: "eu",
    useTLS: true
  });
const db = mongoose.connection
db.once('open', ()=>{
    console.log("db is connected")
    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();
    changeStream.on('change', (change)=>{
        console.log(change)
        if(change.operationType ==='insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',{
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received: messageDetails.received
            })
        }else{
            console.log("error triggering pusher")
        }
    })
})




//middleware
app.use(express.json())
app.use(cors())
//this is for message encriptions
// app.use((req, res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     next();
// }) == cors()

// DB config
const connection_url=('mongodb+srv://admin:BNOPjrTdjdlhithY@cluster0.ha5bl.mongodb.net/whatsappdb?retryWrites=true&w=majority')
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

//???


//api route
app.get('/', (req, res)=>res.status(200).send('hello world'))

app.get('/messages/sync', (req, res)=>{
    Messages.find((err, data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    }
    )
})


app.post("/messages/new", (req, res)=>{
    const dbMessage = req.body
    Messages.create(dbMessage, (err, data)=>{
        if (err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})


//listen
app.listen(port,()=>console.log(`listening on localhost:${port}`))
