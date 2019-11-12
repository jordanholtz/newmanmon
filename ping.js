'use strict';

const fetch = require('node-fetch');

const init = async () => {

    const collection = fetch('https://newman-mon.herokuapp.com/ping');            
    return collection.then(res=>res);

};

try {
    init();
} catch (error) {
    console.error(error);
    // expected output: ReferenceError: nonExistentFunction is not defined
    // Note - error messages will vary depending on browser
}
