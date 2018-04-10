module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "mocha"
    ],
    "globals": {
        'mocha': true
    },
    "env": {
        "node": true,
        "mocha": true
    },
    "rules": {
        "no-underscore-dangle": [
            "error", {
                "allow": [
                    "_id"
                ]
            }
        ]
    }
};