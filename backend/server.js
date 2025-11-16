const express=require('express');
const cors=require('cors');

const app=express();
app.use(cors());
app.use(express.json());


app.get('/',(req,res)=>{
    return res.send('Hello from the backend!');
})

app.listen(5000,()=>{
    console.log('Server is running on http://localhost:5000');
})