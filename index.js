'use strict';

const Hapi = require('@hapi/hapi');
const newman = require('newman'); // require newman in your project
const HapiCron = require('hapi-cron');

const init = async () => {
    const PORT = process.env.PORT || 3000;

    const server = Hapi.server({
        port: PORT,
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
                    url: '/ping'
                },
                onComplete: (res) => {
                    console.log(res); // 'hello world'
                }
            }]
        }
    });

    server.route([{
        method: 'GET',
        path: '/io',
        handler: (request, h) => {

            // call newman.run to pass `options` object and wait for callback
            newman.run({
                collection: require('./newmanmon.json'),
                environment: require('./ioenv.json'),
                reporters: ['cli', 'json']
            }, function (err) {
                if (err) { throw err; }
                console.log('collection run complete!');
            });

            return 'Newman World!';
        }
    },
    {
        method: 'GET',
        path: '/ping',
        handler: (request, h) => {
            return 'pong!';
        }
    },
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'root!';
        }
    }]);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

try {
    init();
} catch (error) {
    console.error(error);
    // expected output: ReferenceError: nonExistentFunction is not defined
    // Note - error messages will vary depending on browser
}
