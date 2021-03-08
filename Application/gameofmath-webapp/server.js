const {app, config} = require('./app');

config.script_args = process.argv.slice(2);
config.script_dev = config.script_args.includes('dev');

//Open the server
app.listen(config.port_back, () => {
    console.log('Webapp open on port 5000' + (config.script_dev ? ' in development mod.' : '.'));
});

module.exports = app