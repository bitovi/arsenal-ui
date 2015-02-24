import $ from 'jquery';
import Control from 'can/control/';
import Map from 'can/map/';
import can_define from 'can/map/define/';
import can_delegate from 'can/map/delegate/';

import Counter from 'models/common/getCounter/';
import UserReq from 'utils/request/';

var countMap = new can.Map({
  bookmarks: 0,
  notifications: 0,
  count: 1
});

var CounterControl = Control.extend({
  init: function (){
      this.interval = setInterval(function () {
          var getCounterRequest = {};
          
          Promise.all([
              Counter.findOne(UserReq.formRequestDetails(getCounterRequest))
            ]).then(function(values) {
              countMap.attr('bookmarks', values[0].bookmarks);
              countMap.attr('notifications', values[0].notifications);
          });
      }, 20000);
  },

  destroy: function () {
      removeInterval(this.interval);
  }
});

new CounterControl();

export default countMap;
