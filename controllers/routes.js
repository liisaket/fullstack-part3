const theRouter = require('express').Router()
const Person = require('../models/phonebook')
const logger = require('../utils/logger')

theRouter.get('/info', (request, response) => {
  const todayTime = (new Date()).toString()
  Person.find({}).then(result => {
    response.send(`Phonebook has info for ${result.length} people<br>
      ${todayTime}`)
  })
})

theRouter.get('/', (request, response) => {
  Person.find({}).then(result => {
    logger.info('phonebook:')
    result.forEach(person => {
      logger.info(`${person.name} ${person.number}`)
    })
    response.json(result)
  })
})

theRouter.get('/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

theRouter.delete('/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

theRouter.post('/', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedNmr => {
      response.json(savedNmr)
    })
    .catch(error => next(error))
})

theRouter.put('/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true , context: 'query' })
    .then(updatedNmr => {
      response.json(updatedNmr.toJSON())
    })
    .catch(error => next(error))
})

module.exports = theRouter