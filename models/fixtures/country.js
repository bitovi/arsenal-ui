import _ from 'lodash';

import fixture from 'can/util/fixture/';

var countries = [
  {
    "id": 1,
    "region": 1,
    "name": "United States of America"
  },
  {
    "id": 2,
    "region": 1,
    "name": "Canada"
  },
  {
    "id": 3,
    "region": 2,
    "name": "Belgium"
  },
  {
    "id": 4,
    "region": 2,
    "name": "France"
  },
  {
    "id": 5,
    "region": 2,
    "name": "Switzerland"
  },
  {
    "id": 6,
    "region": 3,
    "name": "India"
  },
  {
    "id": 7,
    "region": 3,
    "name": "China"
  },
  {
    "id": 8,
    "region": 3,
    "name": "Japan"
  },
  {
    "id": 9,
    "region": 4,
    "name": "Mexico"
  },
  {
    "id": 10,
    "region": 4,
    "name": "Brazil"
  },
  {
    "id": 11,
    "region": 4,
    "name": "Argentina"
  }
];

fixture('GET /countries', function(req, res, headers) {
  res(
    200,
    _.filter(countries, {region: req.data.region})
  );
});
