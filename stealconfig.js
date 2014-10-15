(function () {
	// taking from HTML5 Shiv v3.6.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
	var supportsUnknownElements = false;

	(function () {
		try {
			var a = document.createElement('a');
			a.innerHTML = '<xyz></xyz>';

			supportsUnknownElements = a.childNodes.length == 1 || (function () {
				// assign a false positive if unable to shiv
				(document.createElement)('a');
				var frag = document.createDocumentFragment();
				return (
					typeof frag.cloneNode == 'undefined' ||
						typeof frag.createDocumentFragment == 'undefined' ||
						typeof frag.createElement == 'undefined'
					);
			}());
		} catch (e) {
			// assign a false positive if detection fails => unable to shiv
			supportsUnknownElements = true;
		}
	}());


	System.config({
		map: {
			"can/util/util": "can/util/jquery/jquery",
			"jquery/jquery": "jquery"
		},
		paths: {
			"jquery": "bower_components/jquery/dist/jquery.js",
			"lodash": "bower_components/lodash/dist/lodash.js",
			"can/*": "bower_components/canjs/*.js",
      "bundles/*": "../bundles/*css",
			"bootstrap": "bower_components/bootstrap/dist/js/bootstrap.js",
			"bootstrap.css": "bower_components/bootstrap/dist/css/bootstrap.csscss",
			"qunit": "bower_components/qunit/qunit/qunit.js",
			"qunit.css": "bower_components/qunit/qunit/qunit.csscss"
		},
		meta: {
			jquery: {
				exports: "jQuery",
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv.js"]
			},
			qunit: {
				format: 'global',
				exports: 'QUnit'
			}
		},
		ext: {
			stache: "can/view/stache/system",
			css: "bower_components/steal/css",
			less: "bower_components/steal/less"
		}
	});

  System.buildConfig = {
    map: {
      "can/util/util": "can/util/domless/domless"
    }
  };
})();
