require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')

const Person = require('./models/phonebook')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms :body'))

app.get('/info', (req, res) => {
  const todayTime = (new Date()).toString()
  Person.find({}).then(result => {
    res.send(`Phonebook has info for ${result.length} people<br>
    ${todayTime}`)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    console.log("phonebook:")
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    res.json(result)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === "") {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  if (body.number === "") {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  /*if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }*/

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedNmr => {
    response.json(savedNmr)
  })

  ///persons = persons.concat(person)
  ///response.json(person)
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedNmr => {
      response.json(updatedNmr)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)
  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})