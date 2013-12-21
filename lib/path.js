var absUrlRx, findDotsRx;

absUrlRx = /^\/|^[^:]+:\/\//;
findDotsRx = /(\.)(\.?)(?:$|\/([^\.\/]+.*)?)/g;

/** @module path */
module.exports = {
	isAbsUrl: isAbsUrl,
	isRelPath: isRelPath,
	joinPaths: joinPaths,
	removeEndSlash: removeEndSlash,
	ensureExt: ensureExt,
	reduceLeadingDots: reduceLeadingDots
};

/**
 * Returns true if the url is absolute (not relative to the document)
 * @param {String} url
 * @return {Boolean}
 */
function isAbsUrl (url) { return absUrlRx.test(url); }

/**
 * Returns true if the the path provided is relative.
 * @param {String} path
 * @return {Boolean}
 */
function isRelPath (path) { return path.charAt(0) == '.'; }

/**
 * Joins two paths, base and sub, together.
 * @param {String} base
 * @param {String} sub
 * @return {String}
 */
function joinPaths (base, sub) {
	base = removeEndSlash(base);
	return (base ? base + '/' : '') + sub;
}

/**
 * Removes any trailing slash ("/") from a string.
 * @param {String} path
 * @return {String}
 */
function removeEndSlash (path) {
	return path && path.charAt(path.length - 1) == '/'
		? path.substr(0, path.length - 1)
		: path;
}
/**
 * Ensures that a path ends in the given extension.
 * @param {String} path
 * @param {String} ext
 * @return {String}
 */
function ensureExt (path, ext) {
	return path.lastIndexOf(ext) == path.length - ext.length
		? path
		: path + ext;
}

/**
 * Normalizes a CommonJS-style (or AMD) module id against a referring
 * module id.  Leading ".." or "." path specifiers are folded into
 * the referer's id/path.
 * @param {String} childId
 * @param {String} baseId
 * @return {String}
 */
function reduceLeadingDots (childId, baseId) {
	var removeLevels, normId, levels, isRelative, diff;
	// this algorithm is similar to dojo's compactPath, which
	// interprets module ids of "." and ".." as meaning "grab the
	// module whose name is the same as my folder or parent folder".
	// These special module ids are not included in the AMD spec
	// but seem to work in node.js, too.

	removeLevels = 1;
	normId = childId;

	// remove leading dots and count levels
	if (isRelPath(normId)) {
		isRelative = true;
		// replaceDots also counts levels
		normId = normId.replace(findDotsRx, replaceDots);
	}

	if (isRelative) {
		levels = baseId.split('/');
		diff = levels.length - removeLevels;
		if (diff < 0) {
			// this is an attempt to navigate above parent module.
			// maybe dev wants a url or something. punt and return url;
			return childId;
		}
		levels.splice(diff, removeLevels);
		// normId || [] prevents concat from adding extra "/" when
		// normId is reduced to a blank string
		return levels.concat(normId || []).join('/');
	}
	else {
		return normId;
	}

	function replaceDots (m, dot, dblDot, remainder) {
		if (dblDot) removeLevels++;
		return remainder || '';
	}
}
