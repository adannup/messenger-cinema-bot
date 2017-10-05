const request = require('request');
const _ = require('lodash');

var getCities = () => {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://www.cinepolis.com/manejadores/CiudadesComplejos.ashx',
      qs: {
        EsVIP: false
      },
      method: 'POST',
      json: true
    }, (error, response, body) => {
       if(!error && response.statusCode === 200){
        var data = body;

        var cities = data.map((complejos, index) => {
          return (`${index + 1}: ${complejos.Nombre}`);
        });
        resolve(cities);
      }else{
        reject(`An error ocurr retrieving data from API cinepolis: ${response.statusCode}`);
      }
    });
  });
}

var getCinemas = (city) => {
  requestCinema(city)
    .then((body) => {
     var data = body.d.Locations;
      var cinemas = Object.keys(data).map((location, index, array) => {
        return data[location];
      });
    console.log(cinemas);
  }).catch((messageError) => {
    console.log(messageError);
  });
}

var getMovies = (city) => {
  requestCinema(city).
    then((body) => {
      var data = body.d.Cinemas;
      var movies = [];

      data.forEach((cinema) => {
        // console.log(cinema);
        var cinemaName = cinema.Name;
        var cinemaKey = cinema.Key;
        cinema.Dates.forEach((dates) => {
          // console.log(dates);
          var showtimeDate = dates.ShowtimeDate;
          dates.Movies.forEach((movie) => {
            // console.log(movie);
            var movieTitle = movie.Title;
            var movieKey = movie.Key;
            movies.push(movieTitle);
          });
        })
      })

      var moviesFiltered = _.uniq(movies);
      console.log(moviesFiltered);
    })
    .catch((messageError) => {
      console.log(messageError);
  });
}

var getMoviesFromCinema = (city, cinema) => {
  var cinemaKey = 'cinepolis-plaza-el-dorado'
  requestCinema(city)
    .then((body) => {
      var moviesData = body.d.Cinemas.filter((cinemas) => {
        return cinemas.Key === cinemaKey;
      });
        console.log(moviesData[0]);
    })
    .catch((messageError) => {
      console.log(messageError);
    });
}

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

module.exports = {
  getCities,
  getCinemas,
  getMovies,
  getMoviesFromCinema
}
