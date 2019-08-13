const express = require('express')
const mongoose = require('mongoose');
const User = require('./models/User');
const data = require('./data')
const app = express()
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

mongoose 
    .connect('mongodb://localhost/interview', { useNewUrlParser: true })
    .then(() => {
        console.log('connected to mongo');
    })
    .catch(err => {
        console.log('error with mongo connection', err)
    });

//creating the examples
User.deleteMany().then(() => {
    return User.create(data)
}).then(docs => {
    console.log('DATA AVAILABILTY') 
    console.log(docs.map( doc => doc.availability))
})
.catch(err => {
    console.log('data creation error', err)
})

//route to create new users
app.post('/new', (req, res, next) => {
    let availabilityArr = []
    if (req.body.monday) {
        let mondayArr = req.body.monday.map(Number)
        availabilityArr.push({'monday': mondayArr})
    }
    if (req.body.tuesday) {
       let tuesdayArr = req.body.tuesday.map(Number)
        availabilityArr.push({'tuesday': tuesdayArr}) 
    }   
    if (req.body.wednesday) {
       let wednesdayArr = req.body.wednesday.map(Number)
        availabilityArr.push({'wednesday': wednesdayArr})
    }
    if (req.body.thursday) {
       let thursdayArr = req.body.thursday.map(Number)
        availabilityArr.push({'thursday': thursdayArr}) 
    }
    if (req.body.friday) {
       let fridayArr = req.body.friday.map(Number)
        availabilityArr.push({'friday': fridayArr}) 
    }
    User.create({
        name: req.body.name,
        role: req.body.role,
        availability: availabilityArr
    })
    .then(user => {
        res.json(user)
    }
    )
})
//route returns calls candidates
app.get('/', (req, res, next) => {
    User.find({role: 'candidate'})
    .then(users => {
        res.json(users)
    })
})

//route finds common interview timeslots between a candidate and all interviewers
app.post('/', (req, res, next) => {
    let candidate = req.query.name

Promise.all([
 User.find({name: candidate}),
 User.find({role: 'interviewer'}) 
])
.then(([candidate, interviewers]) => {
let result =[]
let candidateAvailability = candidate[0].availability
for (let i = 0; i < interviewers.length; i++) {
    let commonAvailability = {}
commonAvailability[interviewers[i].name] = getPossTimeSlots(candidateAvailability, interviewers[i].availability)
result.push(commonAvailability)
}
res.json(result)


})
.catch(err => {
    console.log('data sending error', err)
})})
app.listen(3000, () => {
  console.log('interview app on port 3000')
});

//filter function
function getPossTimeSlots(candidate, interviewer){
 let availabilityC = candidate   
 let availabilityI = interviewer
let finalResults = []
for (let i = 0; i < availabilityC.length; i++) {
  for (let j = 0; j < availabilityI.length; j++) {
let result = {}
    if (JSON.stringify(Object.keys(availabilityC[i])) === JSON.stringify(Object.keys(availabilityI[j]))) {
      let result1 =
        Object.values(availabilityC[i]).reduce(
          (acc, cur) => acc.concat(cur),
          []
        )
      let result2 = Object.values(availabilityI[j]).reduce(
        (acc, cur) => acc.concat(cur),
        []
      )
      let comHours = result1.filter(elem => result2.includes(elem))
      if (comHours.length > 0) {
     result[Object.keys(availabilityC[i])[0]] = comHours
        finalResults.push(result)
      } 
    }
  }
}
return finalResults 
}