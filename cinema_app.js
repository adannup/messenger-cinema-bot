const yargs = require('yargs');

const cinema = require('./cinema/cinema');

const argv = yargs
  .command('ciudades', 'Lista todas las ciudades que cuentan con complejos cinepolis')
  .command('complejos', 'Muestra los complejos que existen en la ciudad', {
    ciudad: {
      alias: 'c',
      demandOption: 'true',
      describe: 'Ciudad o Estado',
      type: 'string'
    }
  })
  .options({
    c: {
      alias: 'ciudad',
      describe: 'Ciudad o Estado que cuente con complejo cinepolis',
      type: 'string'
    }
  })
  .help()
  .alias('h', 'help')
  .argv

const command = argv._[0];

if(command === 'ciudades') {
  cinema.getCities();
}else if(command === 'complejos') {
  cinema.getCinemas(argv.ciudad);
}
