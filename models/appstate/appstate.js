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
    //prsId: '2002005719',
    //displayName:'',
    //roleIds: [3],
    appId: '1179',
    //permissions:[],
    secretKey: 'f4166789-30bb-4e12-9973-a76376745096'
  },
  screenLookup:{
    screenid:undefined,//each screen has its own screen id, which will be set during navigation from Menu.
    ispagelocal:false, //it will be set to true when you navigate from one page to another
    pageLocalParm:[], //if ispagelocal is true then this array should have value. The values from this array will be take and used to query database
    targetScreen:undefined
  },//used for to carry the objects and pass it to the destination. U can follow the format as <SCREEN>:{<data>}
  page: null,
  periodFrom: undefined,
  periodTo: undefined,
  periodType: undefined,
  licensor: undefined,
  country: undefined,
  region: undefined,
  storeType: undefined,
  globalSearchButtonClicked: false,
  filled: false,
  renderGlobalSearch:true,
  globalSearch:undefined,
  csrfToken:undefined,
  fetchSize:30 //default fetch size. This will be overrided in index.js based on the browser size that the user is using.
};

var firstPage = 'dashboard';

var appState = new State({
  startRouting: function() {
    // Create a route and pass in initial values.
    route(':page', {page: firstPage});

    // start routing!
    route.ready();
  }
});

appState.attr(stateDefaults);
appState.bind('change', function() {
  var filled =  this.storeType &&
                this.contentType.length &&
                this.region &&
                this.country.length &&
                this.licensor.length &&
                this.periodFrom &&
                this.periodTo;

  this.attr('filled', !!filled);
});

// Make `appState` the Map that can.route uses to keep its data in.
route.map(appState);

export default appState;
export { stateDefaults as defaults };
