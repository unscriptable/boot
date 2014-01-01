/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = overrideIf;

function overrideIf (base, predicate, props) {
	for (var p in props) {
		if (p in base) {
			base[p] = override(base[p], predicate, props[p]);
		}
	}
}

function override (orig, predicate, method) {
	return function () {
		return predicate.apply(this, arguments)
			? method.apply(this, arguments)
			: orig.apply(this, arguments);
	};
}
