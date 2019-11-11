'use strict';

const Hapi = require('@hapi/hapi');
const newman = require('newman'); // require newman in your project
const HapiCron = require('hapi-cron');
const fetch = require('node-fetch');

const init = async () => {
    const PORT = process.env.PORT || 3000;

    const server = Hapi.server({
        port: PORT,
        host: '0.0.0.0'
    });

    await server.register({
        plugin: HapiCron,
        options: {
            jobs: [{
                name: 'testcron',
                time: '*/10 11-17 * * *',
                timezone: 'Europe/London',
                request: {
                    method: 'GET',
                    url: '/shared/d045955d23edb95ffaa4'
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
                reporters: ['cli']
            }, function (err) {
                if (err) { throw err; }
                console.log('collection run complete!');
            });

            return 'Newman World!';
        }
    },
    {
        method: 'GET',
        path: '/shared/{collectionid?}',
        handler: (request, h) => {
            
            const collection = fetch('https://www.getpostman.com/collections/'+request.params.collectionid);            
            return collection.then(res => res.json())
            .then(json => {

                newman.run({
                    collection: json,
                    environment: require('./ioenv.json'),
                    reporters: ['cli']
                }, function (err, res) {
                    if (err) { throw err; }
                    console.log(new Date().toISOString() + ": Newman run finished for collection "+request.params.collectionid);
                    return 'finish newman run.';
                });
            })
            .then(res => '{ "status" : "scheduled" }');
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
        path: '/query',
        handler: (request, h) => {

            const collection = fetch('https://invertironline-bd01.restdb.io/rest/stats-ay24?q={"bono_id": "' +
                request.query.bono_id + '"}&h={"$max":50,"$orderby":{"fecha":1}}',
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-apikey': '9453dea7836b4cb03cfda11094533dd8f0aa3'
                    }
                });

            return collection.then(res => res.json())
                .then(json => {
                    var response = { prices : [], dates: [] };
                    json.forEach(element => {
                        response.prices.push(element.precio);
                        response.dates.push(element.fecha.substring(0, 16)); 
                    });
                    return response;
                });
        }
    }
    ]);

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
