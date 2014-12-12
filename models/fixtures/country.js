import _ from 'lodash';

import fixture from 'can/util/fixture/';

var countries = [
  {
    "id": 1,
    "region": 1,
    "name": "United States of America",
    "abbr": "AUT"
  },
  {
    "id": 2,
    "region": 1,
    "name": "Canada",
    "abbr": "AUT"
  },
  {
    "id": 3,
    "region": 2,
    "name": "Belgium",
    "abbr": "AUT"
  },
  {
    "id": 4,
    "region": 2,
    "name": "France",
    "abbr": "AUT"
  },
  {
    "id": 5,
    "region": 2,
    "name": "Switzerland",
    "abbr": "AUT"
  },
  {
    "id": 6,
    "region": 3,
    "name": "India",
    "abbr": "AUT"
  },
  {
    "id": 7,
    "region": 3,
    "name": "China",
    "abbr": "AUT"
  },
  {
    "id": 8,
    "region": 3,
    "name": "Japan",
    "abbr": "AUT"
  },
  {
    "id": 9,
    "region": 4,
    "name": "Mexico",
    "abbr": "AUT"
  },
  {
    "id": 10,
    "region": 4,
    "name": "Brazil",
    "abbr": "AUT"
  },
  {
    "id": 11,
    "region": 4,
    "name": "Argentina",
    "abbr": "AUT"
  }
];

fixture('GET /countries', function(req, res, headers) {
  res(
    200,
    _.filter(countries, {region: req.data.region})
  );
});
