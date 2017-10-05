const request = require('request');

var getCities = () => {
  request({
    url: 'http://www.cinepolis.com/manejadores/CiudadesComplejos.ashx',
    qs: {
      EsVIP: false
    },
    method: 'POST',
    json: true
  }, (error, response, body) => {
    var data = body;

    data.forEach((complejos, index) => {
      console.log(`${index + 1}: ${complejos.Nombre}`);
    });
  });
}

var getCinemas = (city) => {
  var encodedCity = city.trim().replace(/\s/g,"-");
  request({
    uri: 'http://www.cinepolis.com/Cartelera.aspx/GetNowPlayingByCity',
    body: {
      claveCiudad: encodedCity,
      esVIP: false
    },
    method: 'POST',
    json: true
  }, (error, res, body) => {
    var data = body.d.Locations;

    Object.keys(data).forEach((location, index, array) => {
      console.log(data[location]);
    })

  })
}

// request({
//   url: 'http://www.cinepolis.com/Cartelera.aspx/GetNowPlayingByCity',
//   method: 'POST',
//   body: {
//     claveCiudad: estateEncoded,
//     esVIP:false
//   },
//   json: true
// }, (error, res, body) => {
//
// });

module.exports = {
  getCities,
  getCinemas
}
