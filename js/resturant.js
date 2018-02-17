
'use strict'
const GetLinks = require('./calender')
const CinemaModule = require('./cinema')
const ResturantModule = require('./resturant')
const cheerio = require('cheerio')
var request = require('request')
const rp = require('request-promise').defaults({ simple: false })
const fetch = require('node-fetch')
var tough = require('tough-cookie')
var availableDays = require('./calender').availableDays
/**
* Resturant
* @version 1.1.0
*/

function fetchCheerio (url) {
  const options = {
    url: url,
    transform: (body) => cheerio.load(body)
  }
  return rp(options)
}

let loginLink

async function Resturant (resURL, availableDays) {
  const $ = await fetchCheerio(resURL)

  // TODO | - Return login link instead of setting a global variable
  loginLink = $('form').map(function (item, _) {
    return resURL.substring(0, resURL.lastIndexOf('/')) + $(item).attr('action')
  }).toArray()[0]

  return loginLink
}
let BookTable = []
async function LoginResturant (resURL) {
  let cookie = new tough.Cookie({
    key: 'Zeke',
    value: 'coys',
    Domain: resURL
  })

  // put cookie in an jar which can be used across multiple requests
  var cookiejar = rp.jar()

  cookiejar.setCookie(cookie, loginLink) // resURL)

  const options = {
    method: 'POST',
    uri: resURL + '/login',
    jar: cookiejar, // Tells rp to include cookies in jar that match uri
    followRedirect: true,
    followAllRedirects: true,
    resolveWithFullResponse: true,
    headers: {
      authorization: 'Basic emVrZTpjb3lz',
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: { username: 'zeke', password: 'coys' }
  }
  let result = await rp(options)
  // console.log(result.body)
  let $ = cheerio.load(result.body)
  $('input').map(function (d) {
    // let fatcock = $(this).attr('value')
    BookTable.push($(this).attr('value'))
  })
  BookTable.pop()
  if (parseInt(availableDays) === 5) {
    BookTable = BookTable.filter((e) => e.startsWith('fri'))
  } else if (parseInt(availableDays) === 6) {
    BookTable = BookTable.filter((e) => e.startsWith('sat'))
  } else if (parseInt(availableDays) === 7) {
    BookTable = BookTable.filter((e) => e.startsWith('sun'))
  }
  return BookTable
}

//   if (parseInt(availableDays) === 5) {
//     let friday = function (item) {
//       return item.indexOf('fri') === 0
//     }
//     let startsWithFri = BookTable.filter(friday)
//     console.log(startsWithFri)
//   } else if (parseInt(availableDays) === 6) {
//     let saturday = function (item) {
//       return item.indexOf('sat') === 0
//     }
//     let startsWithSat = BookTable.filter(saturday)
//     console.log(startsWithSat)
//   } else if (parseInt(availableDays) === 7) {
//     let sunday = function (item) {
//       return item.indexOf('sun') === 0
//     }
//     let starsWithSun = BookTable.filter(sunday)
//     console.log(starsWithSun)
//   }
//   return BookTable
// }

module.exports.Resturant = Resturant
module.exports.LoginResturant = LoginResturant