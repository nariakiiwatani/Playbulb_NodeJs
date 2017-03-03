/*
Copyright 2017 nariakiiwatani

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
'use strict';
var noble = require('noble');

var BleDevice = function (localName, requiredUuids) {
    var requiredCharacteristics = [];
    var callbacks = [];
    var isReady = function() {
        return requiredCharacteristics.length == requiredUuids.length;
    };
    var execCallbacks = function () {
        if(!isReady()) {
            console.error("not ready!");
            return;
        }
        var callback;
        while (callbacks.length > 0) {
            callback = callbacks.pop(0);
            setTimeout(callback, 0, requiredCharacteristics);
        }
    };

    noble.on('stateChange', function(state) {
      if (state === 'poweredOn') {
        noble.startScanning();
      } else {
        noble.stopScanning();
      }
    });

    noble.on('discover', function (peripheral) {
        if (peripheral.advertisement.localName === localName) {
            peripheral.connect(function (error) {
                if (error) {
                    throw error;
                }
                peripheral.on('servicesDiscover', function (services) {
                    services.map(function (service) {
                        service.on('characteristicsDiscover', function (characteristics) {
                            var matches = characteristics.filter(function(characteristic) {
                                return requiredUuids.indexOf(characteristic.uuid) != -1;
                            });
                            if(matches.length > 0) {
                                Array.prototype.push.apply(requiredCharacteristics, matches);
                                if(isReady()) execCallbacks();
                            }
                        });
                    });
                });
                peripheral.discoverAllServicesAndCharacteristics();
            });
        }
    });
    return {
        ready: function (callback) {
            if(isReady()) setTimeout(callback, 0, requiredCharacteristics);
            else callbacks.push(callback);
        }
    };
};
var PlaybulbSmart = function () {
    var device = new BleDevice("PLAYBULB", ["2a39"]);
    var blightnessCharacteristics = null;
    return {
        setBlightness: function(blightness, callback) { // 0-20
            blightnessCharacteristics.write(new Buffer([1, blightness]), true, callback);
        },
        increase: function(callback) {
            blightnessCharacteristics.write(new Buffer([0, 1]), true, callback);
        },
        decrease: function(callback) {
            blightnessCharacteristics.write(new Buffer([0, 0]), true, callback);
        },
        ready: function (callback) {
            device.ready(function(characteristics) {
                blightnessCharacteristics = characteristics[0];
                setTimeout(callback,0);
            });
        }
    };
};

module.exports = {
    Smart : PlaybulbSmart
};
