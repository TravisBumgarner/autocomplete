import express from 'express'
import bodyParser from 'body-parser'
import elasticClient from './elasticClient'
import { searchAsYouType, searchNGrams } from './utilities/elasticHelper'

const app = express()

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE") // DELETE Shouldn't be here and auth should be required.
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended':'true'}))
app.use(bodyParser.json({type:'application/vnd.api+json'}))

const port = process.env.PORT || 8000

app.get('/ok', (req, res, next) => {
  elasticClient.cluster.health({},function(err,resp,status) {  
    res.json({resp})
  })
})

app.get('/indices', (req, resNode, next) => {
  elasticClient.cat.indices({format: 'json'}, function(err,resElastic,status) {  
    resNode.send(resElastic)
  })
})

app.get('/indices/delete', (req, resNode, next) => {
  elasticClient.indices.delete({index: req.query.index}, function(err,resElastic,status) {  
    resNode.send(resElastic)
  })
})

app.get('/indices/create', (req, resNode, next) => {
  elasticClient.indices.create({index: req.query.index}, function(err,resElastic,status) {  
    resNode.send(resElastic)
  })
})

app.get('/search/searchasyoutype', (req, resNode, next) => {
  console.log('full start')
  searchAsYouType(req.query.searchedTerm, req.query.slop, (data) => resNode.send(data))
  console.log('full stop')
})

app.get('/search/ngrams', (req, resNode, next) => {
  console.log('full start')
  searchNGrams(req.query.searchedTerm, (data) => resNode.send(data))
  console.log('full stop')
})


app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
