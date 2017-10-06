const yargs = require('yargs');

const cinema = require('./cinema/cinema');

const options = {
  estado: {
      alias: 'e',
      demandOption: true,
      describe: 'Ciudad o Estado',
      type: 'string'
    },
  complejo: {
    alias: 'c',
    demandOption: true,
    describe: 'Nombre del complejo',
    type: 'string'
  },
  titulo: {
    alias: 't',
    demandOption: false,
    describe: 'Titulo de pelicula',
    type: 'string'
  } 
};

const argv = yargs
  .command('ciudades', 'Lista todas las ciudades que cuentan con complejos cinepolis')
  .command('peliculas', 'Lista todas las peliculas', {
    estado: options.estado
  })
  .command('complejos', 'Muestra los complejos que existen en la ciudad', {
    estado: options.estado
  })
  .command('pelicula', 'Muestra las peliculas de un complejo', options)
  .help()
  .alias('h', 'help')
  .argv

const command = argv._[0];

if(command === 'ciudades') {
  cinema.getCities().then((message) => {
    console.log(message);
  }).catch((errorMessage) => {
    console.log(errorMessage);
  });
}else if(command === 'complejos') {
  cinema.getCinemas(argv.ciudad);
}else if(command === 'peliculas') {
  cinema.getMovies(argv.ciudad);
}else if(command === 'pelicula'){
  console.log(argv.estado, argv.complejo);
  cinema.getMoviesFromCinema(argv.estado, argv.complejo, argv.titulo, (movies) => {
    if(movies.length > 0){
      console.log(movies);
    }else{
      console.log('No se encontro la pelicula con el titulo:', argv.titulo);
    }
  })
}
