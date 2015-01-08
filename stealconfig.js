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
      		"lodash": "bower_components/lodash/dist/lodash.js",
			"bootstrap": "bower_components/bootstrap/dist/js/bootstrap.js",
			"bootstrap.css": "bower_components/bootstrap/dist/css/bootstrap.csscss",
			"qunit": "bower_components/qunit/qunit/qunit.js",
			"qunit.css": "bower_components/qunit/qunit/qunit.csscss",
			"bootstrap-datetimepicker": "bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js",
			"bootstrap-datetimepicker.css": "bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.csscss",
			"moment": "bower_components/moment/min/moment.min.js",
			"bootstrapValidator": "bower_components/bootstrapValidator/dist/js/bootstrapValidator.min.js",
			"bootstrapValidator.css": "bower_components/bootstrapValidator/dist/css/bootstrapValidator.csscss",
			"datatables": "bower_components/DataTables/media/js/jquery.dataTables.js",
			"datatables.css": "bower_components/DataTables/media/css/jquery.dataTables.csscss",
			"treetables": "bower_components/jquery-treetable/jquery.treetable.js",
			"treetables.css": "bower_components/jquery-treetable/css/jquery.treetable.csscss",
			"treetables_theme.css": "bower_components/jquery-treetable/css/jquery.treetable.theme.default.csscss",
			"tokeninput": "bower_components/jquery-tokeninput/src/jquery.tokeninput.js",
			"tokeninput.css": "bower_components/jquery-tokeninput/styles/token-input.csscss",
			"tokeninput_theme.css": "bower_components/jquery-tokeninput/styles/token-input-facebook.csscss",
			"highcharts": "bower_components/highcharts-release/highcharts.js",
			"exporting": "bower_components/highcharts-release/modules/exporting.js",
			"bootstrap-multiselect": "bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect.js",
			"bootstrap-multiselect.css": "bower_components/bootstrap-multiselect/dist/css/bootstrap-multiselect.csscss",
			"pdfjs": "bower_components/pdfjs-bower/dist/pdf.js",
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
