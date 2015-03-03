var testModules = [
  'components/header-navigation/test'
];

Promise.all(testModules.map(function(module) {
  return System.import(module);
})).then(function() {
  QUnit.start();
});
