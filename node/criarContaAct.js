require('dotenv').config();
const express = require("express")
const app = express()
const PORT = 4000;
var path = require('path')
app.use(express.urlencoded({ extended: true })); // para ler dados do form
app.use(express.static("ŃutriAcao-LandingPage"));

app.get('/', (req, res)=>{
    res.sendFile(path.join('/home/gabriel/github/NutriAcao/NutriAcao-LandingPage/pages/cadastropage.html'))
})

app.post('/cadastrarConta', (req, res) =>{
    console.log(req.body)
    res.send("Cadastro realizado com sucesso!");
})

app.listen(PORT, () =>{
    console.log("deu bom")
    console.log(PORT)
})