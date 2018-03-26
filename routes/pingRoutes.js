const PingService = require('../services/pingService');

module.exports = app => {
  app.get('/devices', PingService.getDeviceList);

  app.post('/:deviceId/:epochTime', PingService.createPing);

  app.post('/clear_data', PingService.clearPings);

  app.get('/all/:date', PingService.getAllPingsByDate);

  app.get('/:deviceId/:date', PingService.getPingsByDate);

  app.get('/all/:from/:to', PingService.getAllPingsByRange);

  app.get('/:deviceId/:from/:to', PingService.getPingsByRange);
};
