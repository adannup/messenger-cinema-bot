const _ = require('lodash');
const request = require('request');

const requestCinema = require('./request_cinema');

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

        // var cities = data.map((complejos, index) => {
        //   return (`${index + 1}: ${complejos.Nombre}`);
        // });
        // console.log(JSON.stringify(data, undefined, 2));
        resolve(data);
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

var getMoviesFromCinema = (city, cinemaKey, movieTitle, callback) => {
  var actuallyDate = `/Date(${getDateParse()})/`;
 
  getDataByCinema(city, cinemaKey, (cinemaData) =>{
    var moviesData = cinemaData.Dates.filter((dates) => {
      return dates.FilterDate === actuallyDate;
    });
    var movies = [];

    moviesData[0].Movies.forEach(movie => { 
      if(movieTitle){
        if(isContain(movie.Key, movieTitle)){
          console.log('Movie Found', movie.Title);
          movies.push(movie);
        }
      }else{
        movies.push(movie);
      }
    });
    callback(movies);
  });
}

var getDataByCinema = (city, cinemaKey, callback) => {
  requestCinema(city)
    .then((body) => {
      cinemaMovies = body.d.Cinemas.filter((cinema) => {
        return cinema.Key === cinemaKey;
      });

      callback(cinemaMovies[0]);
    })
    .catch((messageError) => {
      console.log(messageError);
    });
}

var isContain = ( movieTitle , titleText) => {
    return movieTitle.indexOf(titleText.toLowerCase()) > -1;
}

var getDateParse = () => {
    var date = new Date();
    var dayNow = date.getDate();
    var monthNow = date.getMonth() + 1;
    var yearNow = date.getFullYear();

    return Date.parse(`${yearNow}-${monthNow}-${dayNow}`);
}

var cmd = (city) => {
  city[0].Complejos.forEach((complejo) => {
    console.log(complejo.Nombre);
  });
}

module.exports = {
  getCities,
  getCinemas,
  getMovies,
  getMoviesFromCinema,
  cmd
}
