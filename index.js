require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const static = require('static')
const cors = require('cors')
const Person = require('./models/phonebook')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms :body'))


let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  }
]

app.get('/info', (req, res) => {
    const ppl = persons.length
    const todayTime = (new Date()).toString()
    res.send(`Phonebook has info for ${ppl} people<br>
    ${todayTime}`)
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

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (!person) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  if (!body.number) {
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
  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})