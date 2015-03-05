import can from 'can/';
import 'can/view/stache/';

can.stache.registerHelper('even', function(num, options) {
	num = typeof num === 'function' ? num() : num;
	return !(num % 2) ? options.fn() : options.inverse();
});

can.stache.registerHelper('odd', function(num, options) {
	num = typeof num === 'function' ? num() : num;
	return num % 2 ? options.fn() : options.inverse();
});