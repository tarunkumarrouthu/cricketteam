const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServers = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Error:${error.message}`)
    process.exit(1)
  }
}
initializeDBAndServers()

// app.get("/",(request,response)=>{
//   response.send("HIII");
// })

//API--1

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `select * from cricket_team;`
  const playersArray = await db.all(getPlayerQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//API--2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerquery = `insert into cricket_team(player_name,jersey_number,role)
  values("${playerName}","${jerseyNumber}","${role}");`
  const dbresponse = await db.run(addPlayerquery)
  // const playerId = dbresponse.lastId
  response.send('Player Added to Team')
})

// //API--3

app.get('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const getPlayerDetails = `select * from cricket_team where player_id=${player_id};`
  const playersArray = await db.get(getPlayerDetails)
  //   response.send(playersArray)
  // })
  response.send(convertDbObjectToResponseObject(playersArray))
})

// //API--4
// {"player_id":4,"player_name":"Venkat","jersey_number":19,"role":"Batsman"}

app.put('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerDetails = `update cricket_team
                            set
                             player_name='${playerName}',
                             jersey_number='${jerseyNumber}',
                             role='${role}'
                             where player_id=${player_id};`
  await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

// //API--5

app.delete('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const deletePlayerDetails = `delete from cricket_team where player_id=${player_id}`
  await db.run(deletePlayerDetails)
  response.send('Player Removed')
})
module.exports = app
