// MIT License
//
// Copyright 2018 Electric Imp
//
// SPDX-License-Identifier: MIT
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
// EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
// OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.


const ImpCentralApi = require('imp-central-api');
const User = require('./user');

const DeviceGroups = ImpCentralApi.DeviceGroups;
const Products = ImpCentralApi.Products;

function login(creds) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.login(creds.username, creds.password)
            .then(authInfo => resolve(authInfo), (err) => {
                reject(new Error(`${User.ERRORS.AUTH_LOGIN} ${err}`));
            });
    });
}
module.exports.login = login;

function getAgentURL(accessToken, deviceID) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.devices.get(deviceID).then((result) => {
            resolve(result.data.attributes.agent_url);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getAgentURL = getAgentURL;

function addDeviceToDG(accessToken, dgID, deviceID) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.deviceGroups.addDevices(dgID, deviceID).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.addDeviceToDG = addDeviceToDG;

function removeDeviceFromDG(accessToken, dgID, deviceID) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.deviceGroups.removeDevices(dgID, null, deviceID)
            .then(() => {
                resolve();
            }, (err) => {
                reject(err);
            });
    });
}
module.exports.removeDeviceFromDG = removeDeviceFromDG;

function getProductList(accessToken, owner) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;

        let filters;
        if (owner) {
            filters = {
                [Products.FILTER_OWNER_ID]: owner,
            };
        }

        api.products.list(filters).then((result) => {
            const products = new Map();
            result.data.forEach((item) => {
                products.set(item.attributes.name, item);
            });
            resolve(products);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getProductList = getProductList;

function getOwners(accessToken) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;
    return new Promise((resolve, reject) => {
        api.accounts.list().then((accaunts) => {
            const owners = new Map();
            accaunts.data.forEach((item) => {
                owners.set(item.attributes.username, item.id);
            });
            resolve(owners);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getOwners = getOwners;

function getDGList(accessToken, product, owner) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;

        let filters;
        if (product || owner) {
            filters = {
                [DeviceGroups.FILTER_PRODUCT_ID]: product,
                [DeviceGroups.FILTER_OWNER_ID]: owner,
            };
        }

        api.deviceGroups.list(filters).then((result) => {
            const deviceGroups = new Map();
            result.data.forEach((item) => {
                deviceGroups.set(item.attributes.name, item);
            });
            resolve(deviceGroups);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getDGList = getDGList;

function newProduct(accessToken, productName, ownerID = null) {
    const attrs = {
        name: productName,
    };

    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.products.create(attrs, ownerID).then((product) => {
            resolve(product);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.newProduct = newProduct;

function newDG(accessToken, productID, dgName) {
    const attrs = {
        name: dgName,
    };

    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.deviceGroups.create(productID, DeviceGroups.TYPE_DEVELOPMENT, attrs)
            .then((dg) => {
                resolve(dg);
            }, (err) => {
                reject(err);
            });
    });
}
module.exports.newDG = newDG;

function logStreamCreate(accessToken, logMsg, logState) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.logStreams.create(logMsg, logState).then((logStream) => {
            resolve(logStream.data.id);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.logStreamCreate = logStreamCreate;

function logStreamAddDevice(accessToken, logStreamID, deviceID) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.logStreams.addDevice(logStreamID, deviceID).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.logStreamAddDevice = logStreamAddDevice;

function logStreamRemoveDevice(accessToken, logStreamID, deviceID) {
    return new Promise((resolve, reject) => {
        const api = new ImpCentralApi();
        api.auth.accessToken = accessToken;
        api.logStreams.removeDevice(logStreamID, deviceID).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.logStreamRemoveDevice = logStreamRemoveDevice;
