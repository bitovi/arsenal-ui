import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-recon-stats.less!';
import Stats from 'models/refreshstats/refreshstats';

import ReconStats from 'components/recon-stats/';


var page = Component.extend({
  tag: 'page-recon-stats',
  template: template,
  
  scope: {

      
  	},

  
});


export default page;

