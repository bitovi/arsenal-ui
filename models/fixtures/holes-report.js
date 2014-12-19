import _ from 'lodash';

var COUNTRIES = ['AUT', 'BEL', 'BGR', 'CHE', 'CYP', 'CZE', 'DEU', 'EST', 'FIN', 'FRA', 'GEO', 'GRE', 'HUN', 'ICE', 'IRE'];
var ENTITIES = ['ARESA', 'CLEAS', 'PAECOL', 'PRS', 'SABAM', 'SACEM', 'SGAE', 'UMPI', 'WCM', 'ZAIKS', 'AKM', 'ARITSIUS', 'GEM', 'SPA'];

var makeAHole = function(entityName, entityId, countryId, localSociety) {
  var pdfCount = _.random(0, 3);
  var ccidCount = _.random(0, 3);
  var isCCIDExpect = _.random(0, 1);

  return {
    entityId: entityId,
    entityName: entityName,
    countryId: countryId,
    localSociety: localSociety,
    fiscalPeriod: 201407,
    pdfCount: pdfCount,
    ccidCount: ccidCount,
    laFlag: _.random(0, 1),
    isCCIDExpect: isCCIDExpect
  };
};

var makeHolesReport = function() {
  var holes = [];
  _.each(COUNTRIES, function(countryName) {
    _.each(ENTITIES, function(entityName, ix) {
      if(_.random(0, 2) > 0) {
        holes.push(makeAHole(entityName, ix + 101, countryName, countryName + ' SOC'));
      }
    });
  });

  return holes;
};

export default {
  makeHolesReport,
  makeAHole
};
