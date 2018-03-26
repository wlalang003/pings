const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('underscore');
require('../models/Ping');
require('../models/Device');

const Ping = mongoose.model('pings');
const Device = mongoose.model('devices');

function serializeMoment(epochTime) {
  let epochMoment = moment.utc(epochTime, ['X', 'YYYY-MM-DD']);
  if (epochMoment._f === 'YYYY-MM-DD') {
    return epochMoment.startOf('date');
  } else {
    return epochMoment;
  }
}

function serializeEpochTime(epochTime) {
  return serializeMoment(epochTime).format('YYYY-MM-DD HH:mm:ss ZZ');
}

function deserializeEpochTime(epochTime) {
  return moment.utc(epochTime, 'YYYY-MM-DD HH:mm:ss ZZ').format('X');
}

function toDateEpochParam(date) {
  return {
    $gte: date.format('YYYY-MM-DD HH:mm:ss ZZ'),
    $lt: date.endOf('date').format('YYYY-MM-DD HH:mm:ss ZZ')
  };
}

function toRangeEpochParam(from, to) {
  return {
    $gte: serializeEpochTime(from),
    $lt: serializeEpochTime(to)
  };
}

module.exports = {
  getDeviceList: (req, res) => {
    Device.where().then(devices => {
      res.send(devices);
    });
  },
  createPing: (req, res) => {
    // format epochTime to correct format
    const deviceId = req.params.deviceId;
    const createPing = () => {
      new Ping({
        deviceId: req.params.deviceId,
        epochTime: serializeEpochTime(req.params.epochTime)
      })
        .save()
        .then(ping => res.send(ping));
    };
    Device.findOne({ deviceId }).then(existingDevice => {
      if (existingDevice) {
        createPing();
      } else {
        new Device({ deviceId }).save().then(device => {
          createPing();
        });
      }
    });
  },
  clearPings: (req, res) => {
    Device.remove().then(() => {
      Ping.remove().then(() => {
        res.send({ status: 'success' });
      });
    });
  },
  getAllPingsByDate: (req, res) => {
    let date = serializeMoment(req.params.date);
    Ping.where({
      epochTime: toDateEpochParam(date)
    }).then(pings => {
      results = {};
      _.each(pings, ping => {
        results[ping.deviceId] = results[ping.deviceId] || [];
        results[ping.deviceId].push(deserializeEpochTime(ping.epochTime));
      });
      res.send(results);
    });
  },
  getPingsByDate: (req, res) => {
    let date = serializeMoment(req.params.date);

    Ping.where({
      deviceId: req.params.deviceId,
      epochTime: toDateEpochParam(date)
    }).then(pings => {
      res.send(
        _.map(pings, ping => {
          deserializeEpochTime(ping.epochTime);
        })
      );
    });
  },
  getAllPingsByRange: (req, res) => {
    Ping.where({
      epochTime: toRangeEpochParam(req.params.from, req.params.to)
    }).then(pings => {
      results = {};
      _.each(pings, ping => {
        results[ping.deviceId] = results[ping.deviceId] || [];
        results[ping.deviceId].push(deserializeEpochTime(ping.epochTime));
      });
      res.send(results);
    });
  },
  getPingsByRange: (req, res) => {
    Ping.where({
      deviceId: req.params.deviceId,
      epochTime: toRangeEpochParam(req.params.from, req.params.to)
    }).then(pings => {
      res.send(
        _.map(pings, ping => {
          deserializeEpochTime(ping.epochTime);
        })
      );
    });
  }
};
