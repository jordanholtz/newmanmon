'use strict';

const Hapi = require('@hapi/hapi');
const newman = require('newman'); // require newman in your project
const HapiCron = require('hapi-cron');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    await server.register({
        plugin: HapiCron,
        options: {
            jobs: [{
                name: 'testcron',
                time: '*/10 * * * *',
                timezone: 'Europe/London',
                request: {
                    method: 'GET',
                    url: '/io'
                },
                onComplete: (res) => {
                    console.log(res); // 'hello world'
                }
            }]
        }
    });

    server.route({
        method: 'GET',
        path: '/io',
        handler: (request, h) => {

            // call newman.run to pass `options` object and wait for callback
            newman.run({
                collection: require('./newmanmon.json'),
                environment: require('./ioenv.json'),
                reporters: ['cli','json']
            }, function (err) {
                if (err) { throw err; }
                console.log('collection run complete!');
            });

            return 'Newman World!';
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});


init();