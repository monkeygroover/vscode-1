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

const ImpDeviceGroups = ImpCentralApi.DeviceGroups;
const ImpProducts = ImpCentralApi.Products;
const ImpDevices = ImpCentralApi.Devices;

const maxPageSize = 100;

function login(creds) {
    const api = new ImpCentralApi();

    return new Promise((resolve, reject) => {
        api.auth.login(creds.username, creds.password)
            .then(authInfo => resolve(authInfo), (err) => {
                reject(new Error(`${User.ERRORS.AUTH_LOGIN} ${err}`));
            });
    });
}
module.exports.login = login;

function refreshAccessToken(refreshToken) {
    const api = new ImpCentralApi();

    return new Promise((resolve, reject) => {
        api.auth.refreshAccessToken(refreshToken)
            .then((authInfo) => {
                resolve(authInfo);
            }, (err) => {
                reject(err);
            });
    });
}
module.exports.refreshAccessToken = refreshAccessToken;

function getDG(accessToken, dgID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.deviceGroups.get(dgID).then((result) => {
            resolve(result);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getDG = getDG;

function getAgentURL(accessToken, deviceID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.devices.get(deviceID).then((result) => {
            resolve(result.data.attributes.agent_url);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getAgentURL = getAgentURL;

function addDeviceToDG(accessToken, dgID, deviceID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.deviceGroups.addDevices(dgID, deviceID).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.addDeviceToDG = addDeviceToDG;

function removeDeviceFromDG(accessToken, dgID, deviceID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.deviceGroups.removeDevices(dgID, null, deviceID)
            .then(() => {
                resolve();
            }, (err) => {
                reject(err);
            });
    });
}
module.exports.removeDeviceFromDG = removeDeviceFromDG;

async function getProductList(accessToken, owner) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    let filters = null;
    if (owner) {
        filters = {
            [ImpProducts.FILTER_OWNER_ID]: owner,
        };
    }

    const products = new Map();
    let result;
    let i = 1;
    try {
        do {
            result = await api.products.list(filters, i, maxPageSize);
            result.data.forEach((item) => {
                products.set(item.attributes.name, item);
            });

            i += 1;
        } while (result.links.next);
    } catch (err) {
        return Promise.reject(err);
    }

    return Promise.resolve(products);
}
module.exports.getProductList = getProductList;

function getMe(accessToken) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.accounts.get('me').then((me) => {
            resolve(me);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getMe = getMe;

function getOwners(accessToken) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.accounts.get('me').then((me) => {
            api.accounts.list().then((accaunts) => {
                const owners = new Map();
                accaunts.data.forEach((item) => {
                    owners.set(item.attributes.username, item.id);
                });
                owners.delete(me.data.attributes.username);
                resolve(owners);
            });
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getOwners = getOwners;

function getDGOwnerID(accessToken, dgID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.deviceGroups.get(dgID).then((dg) => {
            resolve(dg.data.relationships.owner.id);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.getDGOwnerID = getDGOwnerID;

async function getDGList(accessToken, product, owner) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    let filters = null;
    if (product || owner) {
        filters = {
            [ImpDeviceGroups.FILTER_PRODUCT_ID]: product,
            [ImpDeviceGroups.FILTER_OWNER_ID]: owner,
        };
    }

    const deviceGroups = new Map();
    let result;
    let i = 1;
    try {
        do {
            result = await api.deviceGroups.list(filters, i, maxPageSize);
            result.data.forEach((item) => {
                deviceGroups.set(item.attributes.name, item);
            });

            i += 1;
        } while (result.links.next);
    } catch (err) {
        return Promise.reject(err);
    }

    return Promise.resolve(deviceGroups);
}
module.exports.getDGList = getDGList;

function newProduct(accessToken, productName, ownerID = null) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    const attrs = {
        name: productName,
    };

    return new Promise((resolve, reject) => {
        api.products.create(attrs, ownerID).then((product) => {
            resolve(product);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.newProduct = newProduct;

function newDG(accessToken, productID, dgName) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    const attrs = {
        name: dgName,
    };

    return new Promise((resolve, reject) => {
        api.deviceGroups.create(productID, ImpDeviceGroups.TYPE_DEVELOPMENT, attrs)
            .then((dg) => {
                resolve(dg);
            }, (err) => {
                reject(err);
            });
    });
}
module.exports.newDG = newDG;

async function getDeviceList(accessToken, ownerID, dgIDAssigned, dgIDExclude) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    const filters = {
        [ImpDevices.FILTER_OWNER_ID]: ownerID,
        [ImpDevices.FILTER_DEVICE_GROUP_ID]: dgIDAssigned,
    };

    const devices = new Map();
    let result;
    let i = 1;
    try {
        do {
            result = await api.devices.list(filters, i, maxPageSize);
            result.data.forEach((item) => {
                if ((dgIDExclude && item.relationships.devicegroup) &&
                        dgIDExclude === item.relationships.devicegroup.id) {
                    return;
                }

                devices.set(item.id, item);
            });

            i += 1;
        } while (result.links.next);
    } catch (err) {
        return Promise.reject(err);
    }

    return Promise.resolve(devices);
}
module.exports.getDeviceList = getDeviceList;

function logStreamCreate(impCentralApi, logMsg, logState, logError) {
    return new Promise((resolve, reject) => {
        impCentralApi.logStreams.create(logMsg, logState, logError).then((logStream) => {
            resolve(logStream.data.id);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.logStreamCreate = logStreamCreate;

function logStreamClose(impCentralApi, logStreamID) {
    if (logStreamID === undefined) {
        return Promise.resolve();
    }

    /*
     * It is possible, that stream will be silently closed by server.
     * Return resolve() in all cases.
     */
    return new Promise((resolve) => {
        impCentralApi.logStreams.close(logStreamID).then((result) => {
            resolve(result);
        }, (err) => {
            resolve(err);
        });
    });
}
module.exports.logStreamClose = logStreamClose;

function logStreamAddDevice(accessToken, logStreamID, deviceID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.logStreams.addDevice(logStreamID, deviceID).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.logStreamAddDevice = logStreamAddDevice;

function logStreamRemoveDevice(accessToken, logStreamID, deviceID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.logStreams.removeDevice(logStreamID, deviceID).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.logStreamRemoveDevice = logStreamRemoveDevice;

function deploy(accessToken, dgID, dgType, attrs) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.deployments.create(dgID, dgType, attrs).then(() => {
            api.devices.list({ [ImpDevices.FILTER_DEVICE_GROUP_ID]: dgID })
                .then((devices) => {
                    if (devices.data.length < 1) {
                        resolve();
                    } else {
                        resolve(devices);
                    }
                });
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.deploy = deploy;

function restartDevices(accessToken, dgID) {
    const api = new ImpCentralApi();
    api.auth.accessToken = accessToken;

    return new Promise((resolve, reject) => {
        api.deviceGroups.restartDevices(dgID).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
module.exports.restartDevices = restartDevices;
