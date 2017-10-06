const request = require('request');

var requestCinema = (city) => {
  return new Promise((resolve, reject) => {
    var encodedCity = city.trim().replace(/\s/g,"-");

    request({
      uri:  'http://www.cinepolis.com/Cartelera.aspx/GetNowPlayingByCity',
      body: {
        claveCiudad: encodedCity,
        esVIP: false
      },
      method: 'POST',
      json: true
    }, (error, response, body) => {
        if(!error && response.statusCode === 200 && body.d !== null){
          resolve(body);
        }else if(body.d === null && response.statusCode === 200){
          reject('Unable to find that city');
        }else{
          reject(`An error ocurr retrieving data from API cinepolis: ${response.statusCode}`);
        }
    });
  });
}

module.exports = requestCinema;