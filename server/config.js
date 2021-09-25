var shell = require('shelljs');

// create required directories
shell.mkdir('-p', 'public/experiments/images');
shell.mkdir('-p', 'public/experiments/code');

// config content
module.exports = {
    port: 8080,
    user: {
        username: 'none',       // remove credentials
        password: 'none'
    },
    database: {
        path: 'mongodb://localhost/cg_v_1'
    }
};
