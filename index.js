// works on node v10.16.0 (does not work on latest version)
// run 'nvm use 10.16.0' before running 'node index.js'

const nodeFetch = require('node-fetch')
const fetch = require('fetch-cookie/node-fetch')(nodeFetch)
const cheerio = require("cheerio")
const nodemailer = require("nodemailer")
const alert = require("alert-node")
const player = require('play-sound')(opts = {})

const bluebridgeUrl = "https://bookings.bluebridge.co.nz/res_booking_availability_and_price.aspx?quick=Y&marketSectorId=Passenger&outRouteID=WLGPIC&haveTrailer=N&returnType=O&passengerId=A&passengerCount=1&passengerId=S&passengerCount=0&passengerId=C&passengerCount=1&passengerId=I&passengerCount=0&vehicleID=C1&outSelectDay=28&outSelectMonth=12&outSelectYear=2019&vehicleLength=5"

const htmlTag = "#ctl00_ContentPlaceHolder1_rptAvaliableSailingsOut_ctl02_lblCheapestUnrestrictedTicketTypePrice"

const sendEmail = () => {
  // fake info, obvs
  const gmailUsername = "sender@gmail.com"
  const gmailPassword = "sendersPassword"
  const targetEmail = "recipient@gmail.com"

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: gmailUsername,
      pass: gmailPassword
    }
  })

  const mailOptions = {
    from: `Superstar Sarah ${gmailUsername}`,
    to: targetEmail,
    subject: "GO BUY A FERRY TICKET!!!",
    html: `<p>U DA BOMB SISTA!!</p><a href=${bluebridgeUrl}>CLICK HERE</a>`
  }

  transporter.sendMail(mailOptions)
}

const playSound = () => {
  // byo audio file
  player.play('audio.mp3')
}

const showAlert = () => {
  alert(bluebridgeUrl)
}

const resetTimer = () => {
  clearInterval(timerId)
  timerId = setInterval(checkSailing, 300000)
}

const soldOut = (currentTime) => {
  console.log(`
    ${currentTime}
    no availability, so sad!
  `)
}

const sailingAvailable = (currentTime) => {
  console.log(`
    ${currentTime}
    WE HAVE A WINNER!!
  `)
}

const checkSailing = () => {
  fetch(bluebridgeUrl)
  .then(res => res.text())
  .then(body => {
    var ts = new Date()
    let currentTime = ts.toLocaleTimeString()

    let $ = cheerio.load(body)
    const sailingPrice = $(htmlTag).text()

    if (sailingPrice) {
      sailingAvailable(currentTime)
      showAlert()
      playSound()
      sendEmail()
      // resetTimer()
    } else {
      soldOut(currentTime)
    }
  })
  .catch(err => console.error('error in checkSailing: ', err))
}

const bluebridgeUrlTest = "https://bookings.bluebridge.co.nz/res_booking_availability_and_price.aspx?quick=Y&marketSectorId=Passenger&outRouteID=WLGPIC&haveTrailer=N&returnType=O&passengerId=A&passengerCount=1&passengerId=S&passengerCount=0&passengerId=C&passengerCount=1&passengerId=I&passengerCount=0&vehicleID=C1&outSelectDay=17&outSelectMonth=01&outSelectYear=2020&vehicleLength=5"

const testRun = () => {
  fetch(bluebridgeUrlTest)
    .then(res => res.text())
    .then(body => {
      let $ = cheerio.load(body)

      const testSailingPrice = $(htmlTag).text()

      console.log(`
##########################################################################################################################################################################

      Sailing price on test date is: ${testSailingPrice}
      `)

    })
    .catch(err => console.error('error in testRun', err))
}

checkSailing()
let timerId = setInterval(checkSailing, 30000)
testRun()
let testTimerId = setInterval(testRun, 1000000)
