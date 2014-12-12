import _fixtures from '../fixtures/';
import PaymentBundle from './payment-bundle';

var appstate = {
  userinfo: { token: '1234567890' },
  contentType: {id: 1},
  region: {id: 1}
};

PaymentBundle.findAll({appstate: appstate}).then(function(bundles) {
  console.log('bundles', bundles);

  var bundle0 = bundles[0];

  bundle0.getDetails(appstate, false, 'recon').then(function(details) {
    console.log('details', details);
    console.log('bundle0', bundle0);
  });
});
