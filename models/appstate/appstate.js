import Map from 'can/map/';
import can_define from 'can/map/define/';

import route from 'can/route/';
import can_pushstate from 'can/route/pushstate/';

var State = Map.extend({

    define: {
        page: {
            type: 'string'
        }
    },

    /*
     * Override can.Map.serialize.
     * This produces a URL-friendly export of the app state's properties.
     * @returns {{ page: String }}
     */
    serialize: function() {
        return {
            page: this.attr('page')
        };
    }

});

var stateDefaults = {
  // TODO: instead of this, go get the current user and replace this info
  // for right now, this is just a mock-up
  userInfo: {
    token: 'FAKE TOKEN',
    prsId: '2002005722',
    roleIds: [2],
    appId: '1179',
    secretKey: 'f4166789-30bb-4e12-9973-a76376745096'
  },
  page: 'dashboard',
  periodFrom: undefined,
  periodTo: undefined,
  periodType: undefined,
  licensor: undefined,
  country: undefined,
  region: undefined,
  storeType: undefined,
  renderGlobalSearch:false,
  globalSearch:undefined
};



var appState = new State({
  startRouting: function() {
    // Create a route and pass in initial values.
    route(':page', stateDefaults);

    // start routing!
    route.ready();
  }
});

appState.attr(stateDefaults);

// Make `appState` the Map that can.route uses to keep its data in.
route.map(appState);

export default appState;
export { stateDefaults as defaults };
