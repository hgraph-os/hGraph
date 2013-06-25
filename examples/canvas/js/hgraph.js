/*! 
 * HGraph.js (Canvas Version)
 * Author:
 *     Danny Hadley <danny@goinvo.com>
 * License:
 *     Copyright 2013, Involution Studios <http://goinvo.com>
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *	   you may not use this file except in compliance with the License.
 * 	   You may obtain a copy of the License at
 *      
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
*/
(function( global ) {

var // hGraph namespace definition
    hGraph = { },
    
    // jQL and d3 namespaces defined in vendor
    $ = { },
    d3 = { },
    
    // private (h) variables
    hRootElement = false,
    hGraphInstances = { };

// Sizzle Libary import
// Defines, load inside a closure, and exposes to the outside 
var Sizzle;
(function( ) {    
/*
 * _Sizzle CSS Selector Engine v1.9.4-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-06-03
 */
var i,
	support,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	hasDuplicate = false,
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rsibling = new RegExp( whitespace + "*[+~]" ),
	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function _Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: _Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: _Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: _Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by _Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = _Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Expose support vars for convenience
support = _Sizzle.support = {};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = _Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent.attachEvent && parent !== parent.top ) {
		parent.attachEvent( "onbeforeunload", function() {
			setDocument();
		});
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Support: Opera 10-12/IE8
			// ^= $= *= and empty values
			// Should not select anything
			// Support: Windows 8 Native Apps
			// The type attribute is restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "t", "" );

			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = rnative.test( docElem.contains ) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === doc || contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === doc || contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		}

		// Not directly comparable, sort on existence of method
		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

_Sizzle.matches = function( expr, elements ) {
	return _Sizzle( expr, null, null, elements );
};

_Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return _Sizzle( expr, document, null, [elem] ).length > 0;
};

_Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

_Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val === undefined ?
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null :
		val;
};

_Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
_Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = _Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = _Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					_Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				_Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] && match[4] !== undefined ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = _Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					_Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as _Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return _Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				_Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			_Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					_Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = _Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		_Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}
				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return (val = elem.getAttributeNode( name )) && val.specified ?
				val.value :
				elem[ name ] === true ? name.toLowerCase() : null;
		}
	});
}
Sizzle = _Sizzle;
})( );
// jQuery Libary import
// Defines, load inside a closure, and exposes to the outside 
var $;
(function( ) {
/*
 * jQLite JavaScript Library v1.1.1 (http://code.google.com/p/jqlite/)
 *
 * Copyright (c) 2010 Brett Fattori (bfattori@gmail.com)
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Many thanks to the jQuery team's efforts.  Some code is
 * Copyright (c) 2010, John Resig.  See
 * http://jquery.org/license
 *
 * @author Brett Fattori (bfattori@gmail.com)
 * @author $Author: bfattori $
 * @version $Revision: 144 $
 *
 * Created: 03/29/2010
 * Modified: $Date: 2010-06-21 11:06:36 -0400 (Mon, 21 Jun 2010) $
 */

function now(){
  return +new Date;
}

/*
  Simplified DOM selection engine
  START ---------------------------------------------------------
*/
var parseChunks = function(stringSelector, contextNodes) {

  if (stringSelector === "" && contextNodes) {
     return contextNodes;
  }

  var chunks = stringSelector.split(" ");

  // Revise the context nodes
  var chunk = chunks.shift();
  var ctxNode;

  // Is the chunk an Id selector?
  if (chunk.charAt(0) == "#") {
     var idNode = document.getElementById(chunk.substring(1));
     ctxNode = idNode ? [idNode] : [];
  } else {

     var elName = chunk.charAt(0) !== "." ? chunk.split(".")[0] : "*";
     var classes = chunk.split(".");
     var attrs = null;

     // Remove any attributes from the element
     if (elName.indexOf("[") != -1) {
        attrs = elName;
        elName = elName.substr(0, elName.indexOf("["));
     }

     var cFn = function(node) {
        var aC = arguments.callee;
        if ((!aC.needClass || hasClasses(node, aC.classes)) &&
            (!aC.needAttribute || hasAttributes(node, aC.attributes))) {
           return node;
        }
     };

     // Find tags in the context of the element
     var cnodes = [];
     for (var cxn = 0; cxn < contextNodes.length; cxn++) {
        var x = contextNodes[cxn].getElementsByTagName(elName);
        for (var a = 0;a < x.length; a++) {
           cnodes.push(x[a]);
        }
     }
     if (classes) {
        classes.shift();
     }
     ctxNode = [];
     cFn.classes = classes;

     if (attrs != null) {
        var b1 = attrs.indexOf("[");
        var b2 = attrs.lastIndexOf("]");
        var as = attrs.substring(b1 + 1,b2);
        var attrib = as.split("][");
     }

     cFn.attributes = attrs != null ? attrib : null;
     cFn.needClass = (chunk.indexOf(".") != -1 && classes.length > 0);
     cFn.needAttribute = (attrs != null);

     for (var j = 0; j < cnodes.length; j++) {
        if (cFn(cnodes[j])) {
           ctxNode.push(cnodes[j]);
        }
     }
  }

  return parseChunks(chunks.join(" "), ctxNode);
};

var parseSelector = function(selector, context) {

  context = context || document;

  if (selector.nodeType && selector.nodeType === DOM_DOCUMENT_NODE) {
     selector = document.body;
     if (selector === null) {
        // Body not ready yet, return the document instead
        return [document];
     }
  }

  if (selector.nodeType && selector.nodeType === DOM_ELEMENT_NODE) {
     // Is the selector already a single DOM node?
     return [selector];
  }

  if (selector.jquery && typeof selector.jquery === "string") {
     // Is the selector a jQL object?
     return selector.toArray();
  }

  if (context) {
     context = cleanUp(context);
  }

  if (jQL.isArray(selector)) {
     // This is already an array of nodes
     return selector;
  } else if (typeof selector === "string") {

     // This is the meat and potatoes
     var nodes = [];
     for (var cN = 0; cN < context.length; cN++) {
        // For each context node, look for the
        // specified node within it
        var ctxNode = [context[cN]];
        if (!jQL.forceSimpleSelectorEngine && ctxNode[0].querySelectorAll) {
           var nl = ctxNode[0].querySelectorAll(selector);
           for (var tni = 0; tni < nl.length; tni++) {
              nodes.push(nl.item(tni));
           }
        } else {
           nodes = nodes.concat(parseChunks(selector, ctxNode));
        }
     }
     return nodes;
  } else {
     // What do you want me to do with this?
     return null;
  }
};

var hasClasses = function(node, cArr) {
  if (node.className.length == 0) {
     return false;
  }
  var cn = node.className.split(" ");
  var cC = cArr.length;
  for (var c = 0; c < cArr.length; c++) {
     if (jQL.inArray(cArr[c], cn) != -1) {
        cC--;
     }
  }
  return (cC == 0);
};

var hasAttributes = function(node, attrs) {
  var satisfied = true;
  for (var i = 0; i < attrs.length; i++) {
     var tst = attrs[i].split("=");
     var op = (tst[0].indexOf("!") != -1 || tst[0].indexOf("*") != -1) ? tst[0].charAt(tst[0].length - 1) + "=" : "=";
     if (op != "=") {
        tst[0] = tst[0].substring(0, tst[0].length - 1);
     }
     switch (op) {
        case "=": satisfied &= (node.getAttribute(tst[0]) === tst[1]); break;
        case "!=": satisfied &= (node.getAttribute(tst[0]) !== tst[1]); break;
        case "*=": satisfied &= (node.getAttribute(tst[0]).indexOf(tst[1]) != -1); break;
        default: satisfied = false;
     }
  }
  return satisfied;
};

/*
  END -----------------------------------------------------------
  Simplified DOM selection engine
*/

var gSupportScriptEval = false;

setTimeout(function() {
  var root = document.body;

  if (!root) {
     setTimeout(arguments.callee, 33);
     return;
  }

  var script = document.createElement("script"),
   id = "i" + new Date().getTime();

  script.type = "text/javascript";
  try {
     script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
  } catch(e) {}

  root.insertBefore( script, root.firstChild );

  // Make sure that the execution of code works by injecting a script
  // tag with appendChild/createTextNode
  // (IE doesn't support this, fails, and uses .text instead)
  var does = true;
  if ( window[ id ] ) {
     delete window[ id ];
  } else {
     does = false;
  }

  root.removeChild( script );
  gSupportScriptEval = does;
}, 33);

var stripScripts = function(data) {
  // Wrap the data in a dom element
  var div = document.createElement("div");
  div.innerHTML = data;
  // Strip out all scripts
  var scripts = div.getElementsByTagName("script");

  return { scripts: scripts, data: data};
};

var properCase = function(str, skipFirst) {
  skipFirst = skipFirst || false;
  str = (!str ? "" : str.toString().replace(/^\s*|\s*$/g,""));

  var returnString = "";
  if(str.length <= 0){
     return "";
  }

  var ucaseNextFlag = false;

  if(!skipFirst) {
     returnString += str.charAt(0).toUpperCase();
  } else {
     returnString += str.charAt(0);
  }

  for(var counter=1;counter < str.length;counter++) {
     if(ucaseNextFlag) {
        returnString += str.charAt(counter).toUpperCase();
     } else {
        returnString += str.charAt(counter).toLowerCase();
     }
     var character = str.charCodeAt(counter);
     ucaseNextFlag = character == 32 || character == 45 || character == 46;
     if(character == 99 || character == 67) {
        if(str.charCodeAt(counter-1)==77 || str.charCodeAt(counter-1)==109) {
           ucaseNextFlag = true;
        }
     }
  }
  return returnString;
};


var fixStyleProp = function(name) {
  var tempName = name.replace(/-/g, " ");
  tempName = properCase(tempName, true);
  return tempName.replace(/ /g, "");
};

//------------------ EVENTS

/**
* Associative array of events and their types
* @private
*/
var EVENT_TYPES = {click:"MouseEvents",dblclick:"MouseEvents",mousedown:"MouseEvents",mouseup:"MouseEvents",
                  mouseover:"MouseEvents",mousemove:"MouseEvents",mouseout:"MouseEvents",contextmenu:"MouseEvents",
                  keypress:"KeyEvents",keydown:"KeyEvents",keyup:"KeyEvents",load:"HTMLEvents",unload:"HTMLEvents",
                  abort:"HTMLEvents",error:"HTMLEvents",resize:"HTMLEvents",scroll:"HTMLEvents",select:"HTMLEvents",
                  change:"HTMLEvents",submit:"HTMLEvents",reset:"HTMLEvents",focus:"HTMLEvents",blur:"HTMLEvents",
                  touchstart:"MouseEvents",touchend:"MouseEvents",touchmove:"MouseEvents"};

var createEvent = function(eventType) {
  if (typeof eventType === "string") {
     eventType = eventType.toLowerCase();
  }

  var evt = null;
  var eventClass = EVENT_TYPES[eventType] || "Event";
  if(document.createEvent) {
     evt = document.createEvent(eventClass);
     evt._eventClass = eventClass;
     if(eventType) {
        evt.initEvent(eventType, true, true);
     }
  }

  if(document.createEventObject) {
     evt = document.createEventObject();
     if(eventType) {
        evt.type = eventType;
        evt._eventClass = eventClass;
     }
  }

  return evt;
};

var fireEvent = function(node, eventType, data) {
  var evt = createEvent(eventType);
  if (evt._eventClass !== "Event") {
     evt.data = data;
     return node.dispatchEvent(evt);
  } else {
     var eHandlers = node._handlers || {};
     var handlers = eHandlers[eventType];
     if (handlers) {
        for (var h = 0; h < handlers.length; h++) {
           var args = jQL.isArray(data) ? data : [];
           args.unshift(evt);
           var op = handlers[h].apply(node, args);
           op = (typeof op == "undefined" ? true : op);
           if (!op) {
              break;
           }
        }
     }
  }
};

var setHandler = function(node, eventType, fn) {
  if (!jQL.isFunction(fn)) {
     return;
  }

  if (typeof eventType === "string") {
     eventType = eventType.toLowerCase();
  }

  var eventClass = EVENT_TYPES[eventType];
  if (eventType.indexOf("on") == 0) {
     eventType = eventType.substring(2);
  }
  if (eventClass) {
     // Let the browser handle it
     var handler = function(evt) {
        var aC = arguments.callee;
        var args = evt.data || [];
        args.unshift(evt);
        var op = aC.fn.apply(node, args);
        if (typeof op != "undefined" && op === false) {
           if (evt.preventDefault && evt.stopPropagation) {
              evt.preventDefault();
              evt.stopPropagation();
           } else {
              evt.returnValue = false;
              evt.cancelBubble = true;
           }
           return false;
        }
        return true;
     };
     handler.fn = fn;
     if (node.addEventListener) {
        node.addEventListener(eventType, handler, false);
     } else {
        node.attachEvent("on" + eventType, handler);
     }
  } else {
     if (!node._handlers) {
        node._handlers = {};
     }
     var handlers = node._handlers[eventType] || [];
     handlers.push(fn);
     node._handlers[eventType] = handlers;
  }
};

/**
* jQuery "lite"
*
* This is a small subset of support for jQuery-like functionality.  It
* is not intended to be a full replacement, but it will provide some
* of the functionality which jQuery provides to allow development
* using jQuery-like syntax.
*/
var jQL = function(s, e) {
  return new jQLp().init(s, e);
},
document = window.document,
hasOwnProperty = Object.prototype.hasOwnProperty,
toString = Object.prototype.toString,
push = Array.prototype.push,
slice = Array.prototype.slice,
DOM_ELEMENT_NODE = 1,
DOM_DOCUMENT_NODE = 9,
readyStack = [],
isReady = false,
setReady = false,
DOMContentLoaded;

/** 
* Force the usage of the simplified selector engine. Setting this to true will
* cause the simplified selector engine to be used, limiting the number of available
* selectors based on the original (jQLite v1.0.0 - v1.1.0) selector engine.  Keeping
* the value at "false" will allow jQLite to switch to using [element].querySelectorAll()
* if it is available.  This provides a speed increase, but it may function differently
* based on each platform.
*/
jQL.forceSimpleSelectorEngine = false;

jQL.find = Sizzle;

/**
* Loop over each object, performing the function for each one
* @param obj
* @param fn
*/
jQL.each = function(obj, fn) {
  var name, i = 0,
     length = obj.length,
     isObj = length === undefined || jQL.isFunction(obj);

  if ( isObj ) {
     for ( name in obj ) {
        if ( fn.call( obj[ name ], name, obj[ name ] ) === false ) {
           break;
        }
     }
  } else {
     for ( var value = obj[0];
        i < length && fn.call( value, i, value ) !== false; value = obj[++i] ) {}
  }

  return obj;
};

/**
* NoOp function (empty)
*/
jQL.noop = function() {};

/**
* Test if the given object is a function
* @param obj
*/
jQL.isFunction = function(obj) {
  return toString.call(obj) === "[object Function]";
};

/**
* Test if the given object is an Array
* @param obj
*/
jQL.isArray = function( obj ) {
  return toString.call(obj) === "[object Array]";
};

/**
* Test if the given object is an Object
* @param obj
*/
jQL.isPlainObject = function( obj ) {
  // Make sure that DOM nodes and window objects don't pass through, as well
  if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
     return false;
  }

  // Not own constructor property must be Object
  if ( obj.constructor && !hasOwnProperty.call(obj, "constructor")
     && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
     return false;
  }

  // Own properties are enumerated firstly
  var key;
  for ( key in obj ) {}
  return key === undefined || hasOwnProperty.call( obj, key );
};

/**
* Merge two objects into one
* @param first
* @param second
*/
jQL.merge = function( first, second ) {
  var i = first.length, j = 0;

  if ( typeof second.length === "number" ) {
     for ( var l = second.length; j < l; j++ ) {
        first[ i++ ] = second[ j ];
     }
  } else {
     while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
     }
  }

  first.length = i;

  return first;
};

jQL.param = function(params) {
  var pList = "";
  if (params) {
     jQL.each(params, function(val, name) {
        pList += (pList.length != 0 ? "&" : "") + name + "=" + encodeURIComponent(val);
     });
  }
  return pList;
};

jQL.evalScripts = function(scripts) {
  var head = document.getElementsByTagName("head")[0] || document.documentElement;
  for (var s = 0; s < scripts.length; s++) {

     var script = document.createElement("script");
     script.type = "text/javascript";

     if ( gSupportScriptEval ) {
        script.appendChild( document.createTextNode( scripts[s].text ) );
     } else {
        script.text = scripts[s].text;
     }

     // Use insertBefore instead of appendChild to circumvent an IE6 bug.
     // This arises when a base node is used (#2709).
     head.insertBefore( script, head.firstChild );
     head.removeChild( script );
  }
};

jQL.ready = function() {
  isReady = true;
  while(readyStack.length > 0) {
     var fn = readyStack.shift();
     fn();
  }
};

var expando = "jQuery" + now(), uuid = 0, windowData = {};

// The following elements throw uncatchable exceptions if you
// attempt to add expando properties to them.
jQL.noData = {
  "embed": true,
  "object": true,
  "applet": true
};

jQL.cache = {};

jQL.data = function( elem, name, data ) {
  if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
     return;
  }

  elem = elem == window ?
     windowData :
     elem;

  var id = elem[ expando ];

  // Compute a unique ID for the element
  if ( !id ) { id = elem[ expando ] = ++uuid; }

  // Only generate the data cache if we're
  // trying to access or manipulate it
  if ( name && !jQuery.cache[ id ] ) {
     jQuery.cache[ id ] = {};
  }

  // Prevent overriding the named cache with undefined values
  if ( data !== undefined ) {
     jQuery.cache[ id ][ name ] = data;
  }

  // Return the named cache data, or the ID for the element
  return name ?
     jQuery.cache[ id ][ name ] :
     id;
};

jQL.removeData = function( elem, name ) {
  elem = elem == window ?
     windowData :
     elem;

  var id = elem[ expando ];

  // If we want to remove a specific section of the element's data
  if ( name ) {
     if ( jQuery.cache[ id ] ) {
        // Remove the section of cache data
        delete jQuery.cache[ id ][ name ];

        // If we've removed all the data, remove the element's cache
        name = "";

        for ( name in jQuery.cache[ id ] )
           break;

        if ( !name ) {
           jQuery.removeData( elem );
        }
     }

  // Otherwise, we want to remove all of the element's data
  } else {
     // Clean up the element expando
     try {
        delete elem[ expando ];
     } catch(e){
        // IE has trouble directly removing the expando
        // but it's ok with using removeAttribute
        if ( elem.removeAttribute ) {
           elem.removeAttribute( expando );
        }
     }

     // Completely remove the data cache
     delete jQuery.cache[ id ];
  }
};

jQL.ajax = {
  status: -1,
  statusText: "",
  responseText: null,
  responseXML: null,

  send: function(url, params, sendFn) {
     if (jQL.isFunction(params)) {
        sendFn = params;
        params = {};
     }

     if (!url) {
        return;
     }

     var async = true, uName = null, pWord = null;
     if (typeof params.async !== "undefined") {
        async = params.async;
        delete params.async;
     }

     if (typeof params.username !== "undefined") {
        uName = params.username;
        delete params.username;
     }

     if (typeof params.password !== "undefined") {
        pWord = params.password;
        delete params.password;
     }

     // Poll for readyState == 4
     var p = jQL.param(params);
     if (p.length != 0) {
        url += (url.indexOf("?") == -1 ? "?" : "&") + p;
     }
     var req = new XMLHttpRequest();
     req.open("GET", url, async, uName, pWord);
     req.send();

     if (async) {
        var xCB = function(xhr) {
           var aC = arguments.callee;
           if (xhr.status == 200) {
              jQL.ajax.complete(xhr, aC.cb);
           } else {
              jQL.ajax.error(xhr, aC.cb);
           }
        };
        xCB.cb = sendFn;

        var poll = function() {
           var aC = arguments.callee;
           if (aC.req.readyState != 4) {
              setTimeout(aC, 250);
           } else {
              aC.xcb(aC.req);
           }
        };
        poll.req = req;
        poll.xcb = xCB;

        setTimeout(poll, 250);
     } else {
        // synchronous support?
     }
  },

  complete: function(xhr, callback) {
     jQL.ajax.status = xhr.status;
     jQL.ajax.responseText = xhr.responseText;
     jQL.ajax.responseXML = xhr.responseXML;
     if (jQL.isFunction(callback)) {
        callback(xhr.responseText, xhr.status);
     }
  },

  error: function(xhr, callback) {
     jQL.ajax.status = xhr.status;
     jQL.ajax.statusText = xhr.statusText;
     if (jQL.isFunction(callback)) {
        callback(xhr.status, xhr.statusText);
     }
  }

};

jQL.makeArray = function( array, results ) {
  var ret = results || [];
  if ( array != null ) {
     // The window, strings (and functions) also have 'length'
     // The extra typeof function check is to prevent crashes
     // in Safari 2 (See: #3039)
     if ( array.length == null || typeof array === "string" || jQuery.isFunction(array) || (typeof array !== "function" && array.setInterval) ) {
        push.call( ret, array );
     } else {
        jQL.merge( ret, array );
     }
  }

  return ret;
};

jQL.inArray = function(e, arr) {
  for (var a = 0; a < arr.length; a++) {
     if (arr[a] === e) {
        return a;
     }
  }
  return -1;
};

jQL.trim = function(str) {
  if (str != null) {
     return str.toString().replace(/^\s*|\s*$/g,"");
  } else {
     return "";
  }
};

/**
* jQLite instance object
* @private
*/
var jQLp = function() {};
jQLp.prototype = {

  selector: "",
  context: null,
  length: 0,
  jquery: "jqlite-1.1.1",

  init: function(s, e) {

     if (!s) {
        return this;
     }

     if (s.nodeType) {
        // A simple node
        this.context = this[0] = s;
        this.length = 1;
     } else if (typeof s === "function") {
        // Short-form document.ready()
        this.ready(s);
     } else {
        var els = [];
        if (s.jquery && typeof s.jquery === "string") {
           // Already jQLite, just grab its elements
           els = s.toArray();
        } else if (jQL.isArray(s)) {
           // An array of elements
           els = s;
        } else if (typeof s === "string" && jQL.trim(s).indexOf("<") == 0 && jQL.trim(s).indexOf(">") != -1) {
           // This is most likely html, so create an element for them
           var elm = getParentElem(s);
           var h = document.createElement(elm);
           h.innerHTML = s;
           // Extract the element
           els = [h.removeChild(h.firstChild)];
           h = null;
        } else {
           var selectors;
           if (s.indexOf(",") != -1) {
              // Multiple selectors - split them
              selectors = s.split(",");
              for (var n = 0; n < selectors.length; n++) {
                 selectors[n] = jQL.trim(selectors[n]);
              }
           } else {
              selectors = [s];
           }

           var multi = [];
           for (var m = 0; m < selectors.length; m++) {
              multi = multi.concat(parseSelector(selectors[m], e));
           }
           els = multi;
        }

        push.apply(this, els);

     }
     return this;
  },

  // CORE

  each: function(fn) {
     return jQL.each(this, fn);
  },

  size: function() {
     return this.length;
  },

  toArray: function() {
     return slice.call( this, 0 );
  },

  ready: function(fn) {
     if (isReady) {
        fn();
     } else {
        readyStack.push(fn);
        return this;
     }
  },

  data: function( key, value ) {
     if ( typeof key === "undefined" && this.length ) {
        return jQuery.data( this[0] );

     } else if ( typeof key === "object" ) {
        return this.each(function() {
           jQuery.data( this, key );
        });
     }

     var parts = key.split(".");
     parts[1] = parts[1] ? "." + parts[1] : "";

     if ( value === undefined ) {

        if ( data === undefined && this.length ) {
           data = jQuery.data( this[0], key );
        }
        return data === undefined && parts[1] ?
           this.data( parts[0] ) :
           data;
     } else {
        return this.each(function() {
           jQuery.data( this, key, value );
        });
     }
  },

  removeData: function( key ) {
     return this.each(function() {
        jQuery.removeData( this, key );
     });
  },

  // CSS

  addClass: function(cName) {
     return this.each(function() {
        if (this.className.length != 0) {
           var cn = this.className.split(" ");
           if (jQL.inArray(cName, cn) == -1) {
              cn.push(cName);
              this.className = cn.join(" ");
           }
        } else {
           this.className = cName;
        }
     });
  },

  removeClass: function(cName) {
     return this.each(function() {
        if (this.className.length != 0) {
           var cn = this.className.split(" ");
           var i = jQL.inArray(cName, cn);
           if (i != -1) {
              cn.splice(i, 1);
              this.className = cn.join(" ");
           }
        }
     });
  },

  hasClass: function(cName) {
     if (this[0].className.length == 0) {
        return false;
     }
     return jQL.inArray(cName, this[0].className.split(" ")) != -1;
  },

  isElementName: function(eName) {
     return (this[0].nodeName.toLowerCase() === eName.toLowerCase());
  },

  toggleClass: function(cName) {
     return this.each(function() {
        if (this.className.length == 0) {
           this.className = cName;
        } else {
           var cn = this.className.split(" ");
           var i = jQL.inArray(cName, cn);
           if (i != -1) {
              cn.splice(i, 1);
           } else {
              cn.push(cName);
           }
           this.className = cn.join(" ");
        }
     });
  },

  hide: function(fn) {
     return this.each(function() {
        if (this.style && this.style["display"] != null) {
           if (this.style["display"].toString() != "none") {
              this._oldDisplay = this.style["display"].toString() || (this.nodeName != "span" ? "block" : "inline");
              this.style["display"] = "none";
           }
        }
        if (jQL.isFunction(fn)) {
           fn(this);
        }
     });
  },

  show: function(fn) {
     return this.each(function() {
        this.style["display"] = ((this._oldDisplay && this._oldDisplay != "" ? this._oldDisplay : null) || (this.nodeName != "span" ? "block" : "inline"));
        if (jQL.isFunction(fn)) {
           fn(this);
        }
     });
  },

  css: function(sel, val) {
     if (typeof sel === "string" && val == null) {
        return this[0].style[fixStyleProp(sel)];
     } else {
        sel = typeof sel === "string" ? makeObj(sel,val) : sel;
        return this.each(function() {
           var self = this;
           if (typeof self.style != "undefined") {
              jQL.each(sel, function(key,value) {
                 value = (typeof value === "number" ? value + "px" : value);
                 var sn = fixStyleProp(key);
                 if (!self.style[sn]) {
                    sn = key;
                 }
                 self.style[sn] = value;
              });
           }
        });
     }
  },

  // AJAX

  load: function(url, params, fn) {
     if (jQL.isFunction(params)) {
        fn = params;
        params = {};
     }
     return this.each(function() {
        var wrapFn = function(data, status) {
           var aC = arguments.callee;
           if (data) {
              // Strip out any scripts first
              var o = stripScripts(data);
              aC.elem.innerHTML = o.data;
              jQL.evalScripts(o.scripts);
           }
           if (jQL.isFunction(aC.cback)) {
              aC.cback(data, status);
           }
        };
        wrapFn.cback = fn;
        wrapFn.elem = this;
        jQL.ajax.send(url, params, wrapFn);
     });
  },

  // HTML

  html: function(h) {
     if (!h) {
        return this[0].innerHTML;
     } else {
        return this.each(function() {
           var o = stripScripts(h);
           this.innerHTML = o.data;
           jQL.evalScripts(o.scripts);
        });
     }
  },

  attr: function(name, value) {
     if (typeof name === "string" && value == null) {
        if (this[0]) {
           return this[0].getAttribute(name);
        } else {
           return "";
        }
     } else {
        return this.each(function() {
           name = typeof name === "string" ? makeObj(name,value) : name;
           for (var i in name) {
              var v = name[i];
              this.setAttribute(i,v);
           }
        });
     }
  },

  eq: function(index) {
     var elms = this.toArray();
     var elm = index < 0 ? elms[elms.length + index] : elms[index];
     this.context = this[0] = elm;
     this.length = 1;
     return this;
  },

  first: function() {
     var elms = this.toArray();
     this.context = this[0] = elms[0];
     this.length = 1;
     return this;
  },

  last: function() {
     var elms = this.toArray();
     this.context = this[0] = elms[elms.length - 1];
     this.length = 1;
     return this;
  },

  index: function(selector) {
     var idx = -1;
     if (this.length != 0) {
        var itm = this[0];
        if (!selector) {
           var parent = this.parent();
           var s = parent[0].firstChild;
           var arr = [];
           while (s != null) {
              if (s.nodeType === DOM_ELEMENT_NODE) {
                 arr.push(s);
              }
              s = s.nextSibling;
           }
           jQL.each(s, function(i) {
              if (this === itm) {
                 idx = i;
                 return false;
              }
           });
        } else {
           var elm = jQL(selector)[0];
           this.each(function(i) {
              if (this === elm) {
                 idx = i;
                 return false;
              }
           });
        }
     }
     return idx;
  },

  next: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var elm = this.nextSibling;
           while (elm != null && elm.nodeType !== DOM_ELEMENT_NODE) {
              elm = elm.nextSibling;
           }
           if (elm != null) {
              arr.push(elm);
           }
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this.nextSibling;
           while (us != null && us.nodeType !== DOM_ELEMENT_NODE) {
              us = us.nextSibling;
           }
           if (us != null) {
              var found = false;
              pElm.each(function() {
                 if (this == us) {
                    found = true;
                    return false;
                 }
              });
              if (found) {
                 arr.push(us);
              }
           }
        });
     }
     return jQL(arr);
  },

  prev: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var elm = this.previousSibling;
           while (elm != null && elm.nodeType !== DOM_ELEMENT_NODE) {
              elm = elm.previousSibling;
           }
           if (elm != null) {
              arr.push(elm);
           }
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this.previousSibling;
           while (us != null && us.nodeType !== DOM_ELEMENT_NODE) {
              us = us.previousSibling;
           }
           if (us != null) {
              var found = false;
              pElm.each(function() {
                 if (this == us) {
                    found = true;
                    return false;
                 }
              });
              if (found) {
                 arr.push(us);
              }
           }
        });
     }
     return jQL(arr);
  },

  parent: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           arr.push(this.parentNode);
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this.parentNode;
           var found = false;
           pElm.each(function() {
              if (this == us) {
                 found = true;
                 return false;
              }
           });
           if (found) {
              arr.push(us);
           }
        });
     }
     return jQL(arr);
  },

  parents: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var us = this;
           while (us != document.body) {
              us = us.parentNode;
              arr.push(us);
           }
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this;
           while (us != document.body) {
              pElm.each(function() {
                 if (this == us) {
                    arr.push(us);
                 }
              });
              us = us.parentNode;
           }
        });
     }
     return jQL(arr);
  },
    
    find : function(selector) {
        var i,
			ret = [],
			self = this,
			len = self.length;

		for ( i = 0; i < len; i++ ) {
			jQL.find( selector, self[ i ], ret );
		}
		return jQL( ret );
    },
    
  children: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var us = this.firstChild;
           while (us != null) {
              if (us.nodeType == DOM_ELEMENT_NODE) {
                 arr.push(us);
              }
              us = us.nextSibling;
           }
        });
     } else {
        var cElm = jQL(selector);
        this.each(function() {
           var us = this.firstChild;
           while (us != null) {
              if (us.nodeType == DOM_ELEMENT_NODE) {
                 cElm.each(function() {
                    if (this === us) {
                       arr.push(us);
                    }
                 });
              }
              us = us.nextSibling;
           }
        });
     }
     return jQL(arr);
  },

  append: function(child) {
     child = cleanUp(child);
     return this.each(function() {
        for (var i = 0; i < child.length; i++) {
           this.appendChild(child[i]);
        }
     });
  },

  remove: function(els) {
     return this.each(function() {
        if (els) {
           $(els, this).remove();
        } else {
           var par = this.parentNode;
           par.removeChild(this);
        }
     });
  },

  empty: function() {
     return this.each(function() {
        this.innerHTML = "";
     });
  },

  val: function(value) {
     if (value == null) {
        var v = null;
        if (this && this.length != 0 && typeof this[0].value != "undefined") {
           v = this[0].value;
        }
        return v;
     } else {
        return this.each(function() {
           if (typeof this.value != "undefined") {
              this.value = value;
           }
        });
     }
  },

  // EVENTS

  bind: function(eType, fn) {
     return this.each(function() {
        setHandler(this, eType, fn);
     });
  },

  trigger: function(eType, data) {
     return this.each(function() {
        return fireEvent(this, eType, data);
     });
  },

  submit: function(fn) {
     return this.each(function() {
        if (jQL.isFunction(fn)) {
           setHandler(this, "onsubmit", fn);
        } else {
           if (this.submit) {
              this.submit();
           }
        }
     });
  }

};


// Cleanup functions for the document ready method
if ( document.addEventListener ) {
  DOMContentLoaded = function() {
     document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
     jQL.ready();
  };

} else if ( document.attachEvent ) {
  DOMContentLoaded = function() {
     // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
     if ( document.readyState === "complete" ) {
        document.detachEvent( "onreadystatechange", DOMContentLoaded );
        jQL.ready();
     }
  };
}

// Document Ready
if (!setReady) {
  setReady = true;
  // Catch cases where $(document).ready() is called after the
  // browser event has already occurred.
  if ( document.readyState === "complete" ) {
     return jQL.ready();
  }

  // Mozilla, Opera and webkit nightlies currently support this event
  if ( document.addEventListener ) {
     // Use the handy event callback
     document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

     // A fallback to window.onload, that will always work
     window.addEventListener( "load", jQL.ready, false );

  // If IE event model is used
  } else if ( document.attachEvent ) {
     // ensure firing before onload,
     // maybe late but safe also for iframes
     document.attachEvent("onreadystatechange", DOMContentLoaded);

     // A fallback to window.onload, that will always work
     window.attachEvent( "onload", jQL.ready );
  }
}

var makeObj = function(sel, val) {
  var o = {};
  o[sel] = val;
  return o;
};

var cleanUp = function(els) {
  if (els.nodeType && (els.nodeType === DOM_ELEMENT_NODE ||
             els.nodeType === DOM_DOCUMENT_NODE)) {
     els = [els];
  } else if (typeof els === "string") {
     els = jQL(els).toArray();
  } else if (els.jquery && typeof els.jquery === "string") {
     els = els.toArray();
  }
  return els;
};

var getParentElem = function(str) {
  var s = jQL.trim(str).toLowerCase();
  return s.indexOf("<option") == 0 ? "SELECT" :
            s.indexOf("<li") == 0 ? "UL" :
            s.indexOf("<tr") == 0 ? "TBODY" :
            s.indexOf("<td") == 0 ? "TR" : "DIV";
};

jQL.fn = jQL.prototype;

// Allow extending jQL or jQLp
jQL.extend = jQL.fn.extend = function() {
  // copy reference to target object
  var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
     deep = target;
     target = arguments[1] || {};
     // skip the boolean and the target
     i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
     target = {};
  }

  // extend jQL itself if only one argument is passed
  if ( length === i ) {
     target = this;
     --i;
  }

  for ( ; i < length; i++ ) {
     // Only deal with non-null/undefined values
     if ( (options = arguments[ i ]) != null ) {
        // Extend the base object
        for ( name in options ) {
           src = target[ name ];
           copy = options[ name ];

           // Prevent never-ending loop
           if ( target === copy ) {
              continue;
           }

           // Recurse if we're merging object literal values or arrays
           if ( deep && copy && ( jQuery.isPlainObject(copy) || jQuery.isArray(copy) ) ) {
              var clone = src && ( jQuery.isPlainObject(src) || jQuery.isArray(src) ) ? src
                 : jQuery.isArray(copy) ? [] : {};

              // Never move original objects, clone them
              target[ name ] = jQuery.extend( deep, clone, copy );

           // Don't bring in undefined values
           } else if ( copy !== undefined ) {
              target[ name ] = copy;
           }
        }
     }
  }

  // Return the modified object
  return target;
};

// Wire up events
jQL.each("click,dblclick,mouseover,mouseout,mousedown,mouseup,keydown,keypress,keyup,focus,blur,change,select,error,load,unload,scroll,resize,touchstart,touchend,touchmove".split(","),
     function(i, name) {
        jQL.fn[name] = function(fn) {
           return (fn ? this.bind(name, fn) : this.trigger(name));
        };
     });
$ = jQL;    
})( );
/* Copyright (c) 2013, Michael Bostock
 * All rights reserved.
 *   
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *   
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * The name Michael Bostock may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
d3.scale = {};

function d3_scaleExtent(domain) {
  var start = domain[0], stop = domain[domain.length - 1];
  return start < stop ? [start, stop] : [stop, start];
}

function d3_scaleRange(scale) {
  return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
}
d3.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step === Infinity) throw new Error("infinite range");
  var range = [],
       k = d3_range_integerScale(Math.abs(step)),
       i = -1,
       j;
  start *= k, stop *= k, step *= k;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k);
  else while ((j = start + step * ++i) < stop) range.push(j / k);
  return range;
};

function d3_range_integerScale(x) {
  var k = 1;
  while (x * k % 1) k *= 10;
  return k;
}
// Copies a variable number of methods from source to target.
d3.rebind = function(target, source) {
  var i = 1, n = arguments.length, method;
  while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
  return target;
};

// Method is assumed to be a standard D3 getter-setter:
// If passed with no arguments, gets the value.
// If passed with arguments, sets the value and returns the target.
function d3_rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments);
    return value === source ? target : value;
  };
}
function d3_Color() {}

d3_Color.prototype.toString = function() {
  return this.rgb() + "";
};
function d3_class(ctor, properties) {
  try {
    for (var key in properties) {
      Object.defineProperty(ctor.prototype, key, {
        value: properties[key],
        enumerable: false
      });
    }
  } catch (e) {
    ctor.prototype = properties;
  }
}

d3.map = function(object) {
  var map = new d3_Map;
  for (var key in object) map.set(key, object[key]);
  return map;
};

function d3_Map() {}

d3_class(d3_Map, {
  has: function(key) {
    return d3_map_prefix + key in this;
  },
  get: function(key) {
    return this[d3_map_prefix + key];
  },
  set: function(key, value) {
    return this[d3_map_prefix + key] = value;
  },
  remove: function(key) {
    key = d3_map_prefix + key;
    return key in this && delete this[key];
  },
  keys: function() {
    var keys = [];
    this.forEach(function(key) { keys.push(key); });
    return keys;
  },
  values: function() {
    var values = [];
    this.forEach(function(key, value) { values.push(value); });
    return values;
  },
  entries: function() {
    var entries = [];
    this.forEach(function(key, value) { entries.push({key: key, value: value}); });
    return entries;
  },
  forEach: function(f) {
    for (var key in this) {
      if (key.charCodeAt(0) === d3_map_prefixCode) {
        f.call(this, key.substring(1), this[key]);
      }
    }
  }
});

var d3_map_prefix = "\0", // prevent collision with built-ins
    d3_map_prefixCode = d3_map_prefix.charCodeAt(0);

d3.hsl = function(h, s, l) {
  return arguments.length === 1
      ? (h instanceof d3_Hsl ? d3_hsl(h.h, h.s, h.l)
      : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl))
      : d3_hsl(+h, +s, +l);
};

function d3_hsl(h, s, l) {
  return new d3_Hsl(h, s, l);
}

function d3_Hsl(h, s, l) {
  this.h = h;
  this.s = s;
  this.l = l;
}

var d3_hslPrototype = d3_Hsl.prototype = new d3_Color;

d3_hslPrototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, this.l / k);
};

d3_hslPrototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, k * this.l);
};

d3_hslPrototype.rgb = function() {
  return d3_hsl_rgb(this.h, this.s, this.l);
};

function d3_hsl_rgb(h, s, l) {
  var m1,
      m2;

  /* Some simple corrections for h, s and l. */
  h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
  s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
  l = l < 0 ? 0 : l > 1 ? 1 : l;

  /* From FvD 13.37, CSS Color Module Level 3 */
  m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
  m1 = 2 * l - m2;

  function v(h) {
    if (h > 360) h -= 360;
    else if (h < 0) h += 360;
    if (h < 60) return m1 + (m2 - m1) * h / 60;
    if (h < 180) return m2;
    if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
    return m1;
  }

  function vv(h) {
    return Math.round(v(h) * 255);
  }

  return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
}
var π = Math.PI,
    ε = 1e-6,
    ε2 = ε * ε,
    d3_radians = π / 180,
    d3_degrees = 180 / π;

function d3_sgn(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

function d3_acos(x) {
  return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
}

function d3_asin(x) {
  return x > 1 ? π / 2 : x < -1 ? -π / 2 : Math.asin(x);
}

function d3_sinh(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
}

function d3_cosh(x) {
  return (Math.exp(x) + Math.exp(-x)) / 2;
}

function d3_haversin(x) {
  return (x = Math.sin(x / 2)) * x;
}

d3.hcl = function(h, c, l) {
  return arguments.length === 1
      ? (h instanceof d3_Hcl ? d3_hcl(h.h, h.c, h.l)
      : (h instanceof d3_Lab ? d3_lab_hcl(h.l, h.a, h.b)
      : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b)))
      : d3_hcl(+h, +c, +l);
};

function d3_hcl(h, c, l) {
  return new d3_Hcl(h, c, l);
}

function d3_Hcl(h, c, l) {
  this.h = h;
  this.c = c;
  this.l = l;
}

var d3_hclPrototype = d3_Hcl.prototype = new d3_Color;

d3_hclPrototype.brighter = function(k) {
  return d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
};

d3_hclPrototype.darker = function(k) {
  return d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
};

d3_hclPrototype.rgb = function() {
  return d3_hcl_lab(this.h, this.c, this.l).rgb();
};

function d3_hcl_lab(h, c, l) {
  if (isNaN(h)) h = 0;
  if (isNaN(c)) c = 0;
  return d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
}

d3.lab = function(l, a, b) {
  return arguments.length === 1
      ? (l instanceof d3_Lab ? d3_lab(l.l, l.a, l.b)
      : (l instanceof d3_Hcl ? d3_hcl_lab(l.l, l.c, l.h)
      : d3_rgb_lab((l = d3.rgb(l)).r, l.g, l.b)))
      : d3_lab(+l, +a, +b);
};

function d3_lab(l, a, b) {
  return new d3_Lab(l, a, b);
}

function d3_Lab(l, a, b) {
  this.l = l;
  this.a = a;
  this.b = b;
}

// Corresponds roughly to RGB brighter/darker
var d3_lab_K = 18;

// D65 standard referent
var d3_lab_X = 0.950470,
    d3_lab_Y = 1,
    d3_lab_Z = 1.088830;

var d3_labPrototype = d3_Lab.prototype = new d3_Color;

d3_labPrototype.brighter = function(k) {
  return d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
};

d3_labPrototype.darker = function(k) {
  return d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
};

d3_labPrototype.rgb = function() {
  return d3_lab_rgb(this.l, this.a, this.b);
};

function d3_lab_rgb(l, a, b) {
  var y = (l + 16) / 116,
      x = y + a / 500,
      z = y - b / 200;
  x = d3_lab_xyz(x) * d3_lab_X;
  y = d3_lab_xyz(y) * d3_lab_Y;
  z = d3_lab_xyz(z) * d3_lab_Z;
  return d3_rgb(
    d3_xyz_rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
    d3_xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
    d3_xyz_rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z)
  );
}

function d3_lab_hcl(l, a, b) {
  return l > 0
      ? d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l)
      : d3_hcl(NaN, NaN, l);
}

function d3_lab_xyz(x) {
  return x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
}
function d3_xyz_lab(x) {
  return x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
}

function d3_xyz_rgb(r) {
  return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
}

d3.rgb = function(r, g, b) {
  return arguments.length === 1
      ? (r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b)
      : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb))
      : d3_rgb(~~r, ~~g, ~~b);
};

function d3_rgb(r, g, b) {
  return new d3_Rgb(r, g, b);
}

function d3_Rgb(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
}

var d3_rgbPrototype = d3_Rgb.prototype = new d3_Color;

d3_rgbPrototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  var r = this.r,
      g = this.g,
      b = this.b,
      i = 30;
  if (!r && !g && !b) return d3_rgb(i, i, i);
  if (r && r < i) r = i;
  if (g && g < i) g = i;
  if (b && b < i) b = i;
  return d3_rgb(
      Math.min(255, Math.floor(r / k)),
      Math.min(255, Math.floor(g / k)),
      Math.min(255, Math.floor(b / k)));
};

d3_rgbPrototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_rgb(
      Math.floor(k * this.r),
      Math.floor(k * this.g),
      Math.floor(k * this.b));
};

d3_rgbPrototype.hsl = function() {
  return d3_rgb_hsl(this.r, this.g, this.b);
};

d3_rgbPrototype.toString = function() {
  return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
};

function d3_rgb_hex(v) {
  return v < 0x10
      ? "0" + Math.max(0, v).toString(16)
      : Math.min(255, v).toString(16);
}

function d3_rgb_parse(format, rgb, hsl) {
  var r = 0, // red channel; int in [0, 255]
      g = 0, // green channel; int in [0, 255]
      b = 0, // blue channel; int in [0, 255]
      m1, // CSS color specification match
      m2, // CSS color specification type (e.g., rgb)
      name;

  /* Handle hsl, rgb. */
  m1 = /([a-z]+)\((.*)\)/i.exec(format);
  if (m1) {
    m2 = m1[2].split(",");
    switch (m1[1]) {
      case "hsl": {
        return hsl(
          parseFloat(m2[0]), // degrees
          parseFloat(m2[1]) / 100, // percentage
          parseFloat(m2[2]) / 100 // percentage
        );
      }
      case "rgb": {
        return rgb(
          d3_rgb_parseNumber(m2[0]),
          d3_rgb_parseNumber(m2[1]),
          d3_rgb_parseNumber(m2[2])
        );
      }
    }
  }

  /* Named colors. */
  if (name = d3_rgb_names.get(format)) return rgb(name.r, name.g, name.b);

  /* Hexadecimal colors: #rgb and #rrggbb. */
  if (format != null && format.charAt(0) === "#") {
    if (format.length === 4) {
      r = format.charAt(1); r += r;
      g = format.charAt(2); g += g;
      b = format.charAt(3); b += b;
    } else if (format.length === 7) {
      r = format.substring(1, 3);
      g = format.substring(3, 5);
      b = format.substring(5, 7);
    }
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
  }

  return rgb(r, g, b);
}

function d3_rgb_hsl(r, g, b) {
  var min = Math.min(r /= 255, g /= 255, b /= 255),
      max = Math.max(r, g, b),
      d = max - min,
      h,
      s,
      l = (max + min) / 2;
  if (d) {
    s = l < .5 ? d / (max + min) : d / (2 - max - min);
    if (r == max) h = (g - b) / d + (g < b ? 6 : 0);
    else if (g == max) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  } else {
    h = NaN;
    s = l > 0 && l < 1 ? 0 : h;
  }
  return d3_hsl(h, s, l);
}

function d3_rgb_lab(r, g, b) {
  r = d3_rgb_xyz(r);
  g = d3_rgb_xyz(g);
  b = d3_rgb_xyz(b);
  var x = d3_xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / d3_lab_X),
      y = d3_xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / d3_lab_Y),
      z = d3_xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / d3_lab_Z);
  return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
}

function d3_rgb_xyz(r) {
  return (r /= 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
}

function d3_rgb_parseNumber(c) { // either integer or percentage
  var f = parseFloat(c);
  return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
}

var d3_rgb_names = d3.map({
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
});

d3_rgb_names.forEach(function(key, value) {
  d3_rgb_names.set(key, d3_rgb_parse(value, d3_rgb, d3_hsl_rgb));
});

d3.interpolateRgb = d3_interpolateRgb;

function d3_interpolateRgb(a, b) {
  a = d3.rgb(a);
  b = d3.rgb(b);
  var ar = a.r,
      ag = a.g,
      ab = a.b,
      br = b.r - ar,
      bg = b.g - ag,
      bb = b.b - ab;
  return function(t) {
    return "#"
        + d3_rgb_hex(Math.round(ar + br * t))
        + d3_rgb_hex(Math.round(ag + bg * t))
        + d3_rgb_hex(Math.round(ab + bb * t));
  };
}
var d3_document = document,
    d3_documentElement = d3_document.documentElement,
    d3_window = window;
var d3_nsPrefix = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: "http://www.w3.org/1999/xhtml",
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

d3.ns = {
  prefix: d3_nsPrefix,
  qualify: function(name) {
    var i = name.indexOf(":"),
        prefix = name;
    if (i >= 0) {
      prefix = name.substring(0, i);
      name = name.substring(i + 1);
    }
    return d3_nsPrefix.hasOwnProperty(prefix)
        ? {space: d3_nsPrefix[prefix], local: name}
        : name;
  }
};

d3.transform = function(string) {
  var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
  return (d3.transform = function(string) {
    if (string != null) {
      g.setAttribute("transform", string);
      var t = g.transform.baseVal.consolidate();
    }
    return new d3_transform(t ? t.matrix : d3_transformIdentity);
  })(string);
};

// Compute x-scale and normalize the first row.
// Compute shear and make second row orthogonal to first.
// Compute y-scale and normalize the second row.
// Finally, compute the rotation.
function d3_transform(m) {
  var r0 = [m.a, m.b],
      r1 = [m.c, m.d],
      kx = d3_transformNormalize(r0),
      kz = d3_transformDot(r0, r1),
      ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
  if (r0[0] * r1[1] < r1[0] * r0[1]) {
    r0[0] *= -1;
    r0[1] *= -1;
    kx *= -1;
    kz *= -1;
  }
  this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
  this.translate = [m.e, m.f];
  this.scale = [kx, ky];
  this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
};

d3_transform.prototype.toString = function() {
  return "translate(" + this.translate
      + ")rotate(" + this.rotate
      + ")skewX(" + this.skew
      + ")scale(" + this.scale
      + ")";
};

function d3_transformDot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function d3_transformNormalize(a) {
  var k = Math.sqrt(d3_transformDot(a, a));
  if (k) {
    a[0] /= k;
    a[1] /= k;
  }
  return k;
}

function d3_transformCombine(a, b, k) {
  a[0] += k * b[0];
  a[1] += k * b[1];
  return a;
}

var d3_transformIdentity = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0};
d3.interpolateNumber = d3_interpolateNumber;

function d3_interpolateNumber(a, b) {
  b -= a = +a;
  return function(t) { return a + b * t; };
}

d3.interpolateTransform = d3_interpolateTransform;

function d3_interpolateTransform(a, b) {
  var s = [], // string constants and placeholders
      q = [], // number interpolators
      n,
      A = d3.transform(a),
      B = d3.transform(b),
      ta = A.translate,
      tb = B.translate,
      ra = A.rotate,
      rb = B.rotate,
      wa = A.skew,
      wb = B.skew,
      ka = A.scale,
      kb = B.scale;

  if (ta[0] != tb[0] || ta[1] != tb[1]) {
    s.push("translate(", null, ",", null, ")");
    q.push({i: 1, x: d3_interpolateNumber(ta[0], tb[0])}, {i: 3, x: d3_interpolateNumber(ta[1], tb[1])});
  } else if (tb[0] || tb[1]) {
    s.push("translate(" + tb + ")");
  } else {
    s.push("");
  }

  if (ra != rb) {
    if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360; // shortest path
    q.push({i: s.push(s.pop() + "rotate(", null, ")") - 2, x: d3_interpolateNumber(ra, rb)});
  } else if (rb) {
    s.push(s.pop() + "rotate(" + rb + ")");
  }

  if (wa != wb) {
    q.push({i: s.push(s.pop() + "skewX(", null, ")") - 2, x: d3_interpolateNumber(wa, wb)});
  } else if (wb) {
    s.push(s.pop() + "skewX(" + wb + ")");
  }

  if (ka[0] != kb[0] || ka[1] != kb[1]) {
    n = s.push(s.pop() + "scale(", null, ",", null, ")");
    q.push({i: n - 4, x: d3_interpolateNumber(ka[0], kb[0])}, {i: n - 2, x: d3_interpolateNumber(ka[1], kb[1])});
  } else if (kb[0] != 1 || kb[1] != 1) {
    s.push(s.pop() + "scale(" + kb + ")");
  }

  n = q.length;
  return function(t) {
    var i = -1, o;
    while (++i < n) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  };
}

d3.interpolateObject = d3_interpolateObject;

function d3_interpolateObject(a, b) {
  var i = {},
      c = {},
      k;
  for (k in a) {
    if (k in b) {
      i[k] = d3_interpolateByName(k)(a[k], b[k]);
    } else {
      c[k] = a[k];
    }
  }
  for (k in b) {
    if (!(k in a)) {
      c[k] = b[k];
    }
  }
  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

d3.interpolateArray = d3_interpolateArray;

function d3_interpolateArray(a, b) {
  var x = [],
      c = [],
      na = a.length,
      nb = b.length,
      n0 = Math.min(a.length, b.length),
      i;
  for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
  for (; i < na; ++i) c[i] = a[i];
  for (; i < nb; ++i) c[i] = b[i];
  return function(t) {
    for (i = 0; i < n0; ++i) c[i] = x[i](t);
    return c;
  };
}

d3.interpolateString = d3_interpolateString;

function d3_interpolateString(a, b) {
  var m, // current match
      i, // current index
      j, // current index (for coalescing)
      s0 = 0, // start index of current string prefix
      s1 = 0, // end index of current string prefix
      s = [], // string constants and placeholders
      q = [], // number interpolators
      n, // q.length
      o;

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Reset our regular expression!
  d3_interpolate_number.lastIndex = 0;

  // Find all numbers in b.
  for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
    if (m.index) s.push(b.substring(s0, s1 = m.index));
    q.push({i: s.length, x: m[0]});
    s.push(null);
    s0 = d3_interpolate_number.lastIndex;
  }
  if (s0 < b.length) s.push(b.substring(s0));

  // Find all numbers in a.
  for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
    o = q[i];
    if (o.x == m[0]) { // The numbers match, so coalesce.
      if (o.i) {
        if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i - 1] += o.x;
          s.splice(o.i, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        } else { // This match is followed by a string, so coalesce twice.
          s[o.i - 1] += o.x + s[o.i + 1];
          s.splice(o.i, 2);
          for (j = i + 1; j < n; ++j) q[j].i -= 2;
        }
      } else {
          if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i] = o.x;
        } else { // This match is followed by a string, so coalesce twice.
          s[o.i] = o.x + s[o.i + 1];
          s.splice(o.i + 1, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        }
      }
      q.splice(i, 1);
      n--;
      i--;
    } else {
      o.x = d3_interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
    }
  }

  // Remove any numbers in b not found in a.
  while (i < n) {
    o = q.pop();
    if (s[o.i + 1] == null) { // This match is followed by another number.
      s[o.i] = o.x;
    } else { // This match is followed by a string, so coalesce twice.
      s[o.i] = o.x + s[o.i + 1];
      s.splice(o.i + 1, 1);
    }
    n--;
  }

  // Special optimization for only a single match.
  if (s.length === 1) {
    return s[0] == null
        ? (o = q[0].x, function(t) { return o(t) + ""; })
        : function() { return b; };
  }

  // Otherwise, interpolate each of the numbers and rejoin the string.
  return function(t) {
    for (i = 0; i < n; ++i) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  };
}

var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;

d3.interpolate = d3_interpolate;

function d3_interpolate(a, b) {
  var i = d3.interpolators.length, f;
  while (--i >= 0 && !(f = d3.interpolators[i](a, b)));
  return f;
}

function d3_interpolateByName(name) {
  return name == "transform"
      ? d3_interpolateTransform
      : d3_interpolate;
}

d3.interpolators = [
  function(a, b) {
    var t = typeof b;
    return (t === "string" ? (d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString)
        : b instanceof d3_Color ? d3_interpolateRgb
        : t === "object" ? (Array.isArray(b) ? d3_interpolateArray : d3_interpolateObject)
        : d3_interpolateNumber)(a, b);
  }
];
d3.interpolateRound = d3_interpolateRound;

function d3_interpolateRound(a, b) {
  b -= a;
  return function(t) { return Math.round(a + b * t); };
}
function d3_uninterpolateNumber(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return (x - a) * b; };
}

function d3_uninterpolateClamp(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return Math.max(0, Math.min(1, (x - a) * b)); };
}
function d3_identity(d) {
  return d;
}
var d3_format_decimalPoint = ".",
    d3_format_thousandsSeparator = ",",
    d3_format_grouping = [3, 3];


var d3_formatPrefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"].map(d3_formatPrefix);

d3.formatPrefix = function(value, precision) {
  var i = 0;
  if (value) {
    if (value < 0) value *= -1;
    if (precision) value = d3.round(value, d3_format_precision(value, precision));
    i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
    i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
  }
  return d3_formatPrefixes[8 + i / 3];
};

function d3_formatPrefix(d, i) {
  var k = Math.pow(10, Math.abs(8 - i) * 3);
  return {
    scale: i > 8 ? function(d) { return d / k; } : function(d) { return d * k; },
    symbol: d
  };
}
d3.round = function(x, n) {
  return n
      ? Math.round(x * (n = Math.pow(10, n))) / n
      : Math.round(x);
};

d3.format = function(specifier) {
  var match = d3_format_re.exec(specifier),
      fill = match[1] || " ",
      align = match[2] || ">",
      sign = match[3] || "",
      basePrefix = match[4] || "",
      zfill = match[5],
      width = +match[6],
      comma = match[7],
      precision = match[8],
      type = match[9],
      scale = 1,
      suffix = "",
      integer = false;

  if (precision) precision = +precision.substring(1);

  if (zfill || fill === "0" && align === "=") {
    zfill = fill = "0";
    align = "=";
    if (comma) width -= Math.floor((width - 1) / 4);
  }

  switch (type) {
    case "n": comma = true; type = "g"; break;
    case "%": scale = 100; suffix = "%"; type = "f"; break;
    case "p": scale = 100; suffix = "%"; type = "r"; break;
    case "b":
    case "o":
    case "x":
    case "X": if (basePrefix) basePrefix = "0" + type.toLowerCase();
    case "c":
    case "d": integer = true; precision = 0; break;
    case "s": scale = -1; type = "r"; break;
  }

  if (basePrefix === "#") basePrefix = "";

  // If no precision is specified for r, fallback to general notation.
  if (type == "r" && !precision) type = "g";

  // Ensure that the requested precision is in the supported range.
  if (precision != null) {
    if (type == "g") precision = Math.max(1, Math.min(21, precision));
    else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
  }

  type = d3_format_types.get(type) || d3_format_typeDefault;

  var zcomma = zfill && comma;

  return function(value) {

    // Return the empty string for floats formatted as ints.
    if (integer && (value % 1)) return "";

    // Convert negative to positive, and record the sign prefix.
    var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign;

    // Apply the scale, computing it from the value's exponent for si format.
    if (scale < 0) {
      var prefix = d3.formatPrefix(value, precision);
      value = prefix.scale(value);
      suffix = prefix.symbol;
    } else {
      value *= scale;
    }

    // Convert to the desired precision.
    value = type(value, precision);

     // If the fill character is not "0", grouping is applied before padding.
    if (!zfill && comma) value = d3_format_group(value);

    var length = basePrefix.length + value.length + (zcomma ? 0 : negative.length),
        padding = length < width ? new Array(length = width - length + 1).join(fill) : "";

    // If the fill character is "0", grouping is applied after padding.
    if (zcomma) value = d3_format_group(padding + value);

    if (d3_format_decimalPoint) value.replace(".", d3_format_decimalPoint);

    negative += basePrefix;

    return (align === "<" ? negative + value + padding
          : align === ">" ? padding + negative + value
          : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length)
          : negative + (zcomma ? value : padding + value)) + suffix;
  };
};

// [[fill]align][sign][#][0][width][,][.precision][type]
var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?(#)?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;

var d3_format_types = d3.map({
  b: function(x) { return x.toString(2); },
  c: function(x) { return String.fromCharCode(x); },
  o: function(x) { return x.toString(8); },
  x: function(x) { return x.toString(16); },
  X: function(x) { return x.toString(16).toUpperCase(); },
  g: function(x, p) { return x.toPrecision(p); },
  e: function(x, p) { return x.toExponential(p); },
  f: function(x, p) { return x.toFixed(p); },
  r: function(x, p) { return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p)))); }
});

function d3_format_precision(x, p) {
  return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
}

function d3_format_typeDefault(x) {
  return x + "";
}

// Apply comma grouping for thousands.
var d3_format_group = d3_identity;
if (d3_format_grouping) {
  var d3_format_groupingLength = d3_format_grouping.length;
  d3_format_group = function(value) {
    var i = value.lastIndexOf("."),
        f = i >= 0 ? "." + value.substring(i + 1) : (i = value.length, ""),
        t = [],
        j = 0,
        g = d3_format_grouping[0];
    while (i > 0 && g > 0) {
      t.push(value.substring(i -= g, i + g));
      g = d3_format_grouping[j = (j + 1) % d3_format_groupingLength];
    }
    return t.reverse().join(d3_format_thousandsSeparator || "") + f;
  };
}
function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
  var u = uninterpolate(domain[0], domain[1]),
      i = interpolate(range[0], range[1]);
  return function(x) {
    return i(u(x));
  };
}
function d3_scale_nice(domain, nice) {
  var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      dx;

  if (x1 < x0) {
    dx = i0, i0 = i1, i1 = dx;
    dx = x0, x0 = x1, x1 = dx;
  }

  domain[i0] = nice.floor(x0);
  domain[i1] = nice.ceil(x1);
  return domain;
}

function d3_scale_niceStep(step) {
  return step ? {
    floor: function(x) { return Math.floor(x / step) * step; },
    ceil: function(x) { return Math.ceil(x / step) * step; }
  } : d3_scale_niceIdentity;
}

var d3_scale_niceIdentity = {
  floor: d3_identity,
  ceil: d3_identity
};
d3.bisector = function(f) {
  return {
    left: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (f.call(a, a[mid], mid) < x) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (x < f.call(a, a[mid], mid)) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
};

var d3_bisector = d3.bisector(function(d) { return d; });
d3.bisectLeft = d3_bisector.left;
d3.bisect = d3.bisectRight = d3_bisector.right;

function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
  var u = [],
      i = [],
      j = 0,
      k = Math.min(domain.length, range.length) - 1;

  // Handle descending domains.
  if (domain[k] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++j <= k) {
    u.push(uninterpolate(domain[j - 1], domain[j]));
    i.push(interpolate(range[j - 1], range[j]));
  }

  return function(x) {
    var j = d3.bisect(domain, x, 1, k) - 1;
    return i[j](u[j](x));
  };
}

d3.scale.linear = function() {
  return d3_scale_linear([0, 1], [0, 1], d3_interpolate, false);
};

function d3_scale_linear(domain, range, interpolate, clamp) {
  var output,
      input;

  function rescale() {
    var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear,
        uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
    output = linear(domain, range, uninterpolate, interpolate);
    input = linear(range, domain, uninterpolate, d3_interpolate);
    return scale;
  }

  function scale(x) {
    return output(x);
  }

  // Note: requires range is coercible to number!
  scale.invert = function(y) {
    return input(y);
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(Number);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.rangeRound = function(x) {
    return scale.range(x).interpolate(d3_interpolateRound);
  };

  scale.clamp = function(x) {
    if (!arguments.length) return clamp;
    clamp = x;
    return rescale();
  };

  scale.interpolate = function(x) {
    if (!arguments.length) return interpolate;
    interpolate = x;
    return rescale();
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  scale.nice = function(m) {
    d3_scale_linearNice(domain, m);
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_linear(domain, range, interpolate, clamp);
  };

  return rescale();
}

function d3_scale_linearRebind(scale, linear) {
  return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
}

function d3_scale_linearNice(domain, m) {
  return d3_scale_nice(domain, d3_scale_niceStep(m
      ? d3_scale_linearTickRange(domain, m)[2]
      : d3_scale_linearNiceStep(domain)));
}

function d3_scale_linearNiceStep(domain) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0];
  return Math.pow(10, Math.round(Math.log(span) / Math.LN10) - 1);
}

function d3_scale_linearTickRange(domain, m) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  extent[0] = Math.ceil(extent[0] / step) * step;
  extent[1] = Math.floor(extent[1] / step) * step + step * .5; // inclusive
  extent[2] = step;
  return extent;
}

function d3_scale_linearTicks(domain, m) {
  return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
}

function d3_scale_linearTickFormat(domain, m, format) {
  var precision = -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + .01);
  return d3.format(format
      ? format.replace(d3_format_re, function(a, b, c, d, e, f, g, h, i, j) { return [b, c, d, e, f, g, h, i || "." + (precision - (j === "%") * 2), j].join(""); })
      : ",." + precision + "f");
}

d3.scale.log = function() {
  return d3_scale_log(d3.scale.linear().domain([0, Math.LN10]), 10, d3_scale_logp, d3_scale_powp, [1, 10]);
};

function d3_scale_log(linear, base, log, pow, domain) {

  function scale(x) {
    return linear(log(x));
  }

  scale.invert = function(x) {
    return pow(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    if (x[0] < 0) log = d3_scale_logn, pow = d3_scale_pown;
    else log = d3_scale_logp, pow = d3_scale_powp;
    linear.domain((domain = x.map(Number)).map(log));
    return scale;
  };

  scale.base = function(_) {
    if (!arguments.length) return base;
    base = +_;
    return scale;
  };

  scale.nice = function() {

    function floor(x) {
      return Math.pow(base, Math.floor(Math.log(x) / Math.log(base)));
    }

    function ceil(x) {
      return Math.pow(base, Math.ceil(Math.log(x) / Math.log(base)));
    }

    linear.domain(d3_scale_nice(domain, log === d3_scale_logp
        ? {floor: floor, ceil: ceil}
        : {floor: function(x) { return -ceil(-x); }, ceil: function(x) { return -floor(-x); }}).map(log));

    return scale;
  };

  scale.ticks = function() {
    var extent = d3_scaleExtent(linear.domain()),
        ticks = [];
    if (extent.every(isFinite)) {
      var b = Math.log(base),
          i = Math.floor(extent[0] / b),
          j = Math.ceil(extent[1] / b),
          u = pow(extent[0]),
          v = pow(extent[1]),
          n = base % 1 ? 2 : base;
      if (log === d3_scale_logn) {
        ticks.push(-Math.pow(base, -i));
        for (; i++ < j;) for (var k = n - 1; k > 0; k--) ticks.push(-Math.pow(base, -i) * k);
      } else {
        for (; i < j; i++) for (var k = 1; k < n; k++) ticks.push(Math.pow(base, i) * k);
        ticks.push(Math.pow(base, i));
      }
      for (i = 0; ticks[i] < u; i++) {} // strip small values
      for (j = ticks.length; ticks[j - 1] > v; j--) {} // strip big values
      ticks = ticks.slice(i, j);
    }
    return ticks;
  };

  scale.tickFormat = function(n, format) {
    if (!arguments.length) return d3_scale_logFormat;
    if (arguments.length < 2) format = d3_scale_logFormat;
    else if (typeof format !== "function") format = d3.format(format);
    var b = Math.log(base),
        k = Math.max(.1, n / scale.ticks().length),
        f = log === d3_scale_logn ? (e = -1e-12, Math.floor) : (e = 1e-12, Math.ceil),
        e;
    return function(d) {
      return d / pow(b * f(log(d) / b + e)) <= k ? format(d) : "";
    };
  };

  scale.copy = function() {
    return d3_scale_log(linear.copy(), base, log, pow, domain);
  };

  return d3_scale_linearRebind(scale, linear);
}

var d3_scale_logFormat = d3.format(".0e");

function d3_scale_logp(x) {
  return Math.log(x < 0 ? 0 : x);
}

function d3_scale_powp(x) {
  return Math.exp(x);
}

function d3_scale_logn(x) {
  return -Math.log(x > 0 ? 0 : -x);
}

function d3_scale_pown(x) {
  return -Math.exp(-x);
}

d3.scale.pow = function() {
  return d3_scale_pow(d3.scale.linear(), 1, [0, 1]);
};

function d3_scale_pow(linear, exponent, domain) {
  var powp = d3_scale_powPow(exponent),
      powb = d3_scale_powPow(1 / exponent);

  function scale(x) {
    return linear(powp(x));
  }

  scale.invert = function(x) {
    return powb(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    linear.domain((domain = x.map(Number)).map(powp));
    return scale;
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  scale.nice = function(m) {
    return scale.domain(d3_scale_linearNice(domain, m));
  };

  scale.exponent = function(x) {
    if (!arguments.length) return exponent;
    powp = d3_scale_powPow(exponent = x);
    powb = d3_scale_powPow(1 / exponent);
    linear.domain(domain.map(powp));
    return scale;
  };

  scale.copy = function() {
    return d3_scale_pow(linear.copy(), exponent, domain);
  };

  return d3_scale_linearRebind(scale, linear);
}

function d3_scale_powPow(e) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
  };
}

d3.scale.sqrt = function() {
  return d3.scale.pow().exponent(.5);
};

d3.scale.ordinal = function() {
  return d3_scale_ordinal([], {t: "range", a: [[]]});
};

function d3_scale_ordinal(domain, ranger) {
  var index,
      range,
      rangeBand;

  function scale(x) {
    return range[((index.get(x) || index.set(x, domain.push(x))) - 1) % range.length];
  }

  function steps(start, step) {
    return d3.range(domain.length).map(function(i) { return start + step * i; });
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = [];
    index = new d3_Map;
    var i = -1, n = x.length, xi;
    while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
    return scale[ranger.t].apply(scale, ranger.a);
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    rangeBand = 0;
    ranger = {t: "range", a: arguments};
    return scale;
  };

  scale.rangePoints = function(x, padding) {
    if (arguments.length < 2) padding = 0;
    var start = x[0],
        stop = x[1],
        step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
    range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
    rangeBand = 0;
    ranger = {t: "rangePoints", a: arguments};
    return scale;
  };

  scale.rangeBands = function(x, padding, outerPadding) {
    if (arguments.length < 2) padding = 0;
    if (arguments.length < 3) outerPadding = padding;
    var reverse = x[1] < x[0],
        start = x[reverse - 0],
        stop = x[1 - reverse],
        step = (stop - start) / (domain.length - padding + 2 * outerPadding);
    range = steps(start + step * outerPadding, step);
    if (reverse) range.reverse();
    rangeBand = step * (1 - padding);
    ranger = {t: "rangeBands", a: arguments};
    return scale;
  };

  scale.rangeRoundBands = function(x, padding, outerPadding) {
    if (arguments.length < 2) padding = 0;
    if (arguments.length < 3) outerPadding = padding;
    var reverse = x[1] < x[0],
        start = x[reverse - 0],
        stop = x[1 - reverse],
        step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)),
        error = stop - start - (domain.length - padding) * step;
    range = steps(start + Math.round(error / 2), step);
    if (reverse) range.reverse();
    rangeBand = Math.round(step * (1 - padding));
    ranger = {t: "rangeRoundBands", a: arguments};
    return scale;
  };

  scale.rangeBand = function() {
    return rangeBand;
  };

  scale.rangeExtent = function() {
    return d3_scaleExtent(ranger.a[0]);
  };

  scale.copy = function() {
    return d3_scale_ordinal(domain, ranger);
  };

  return scale.domain(domain);
}

/*
 * This product includes color specifications and designs developed by Cynthia
 * Brewer (http://colorbrewer.org/). See lib/colorbrewer for more information.
 */

d3.scale.category10 = function() {
  return d3.scale.ordinal().range(d3_category10);
};

d3.scale.category20 = function() {
  return d3.scale.ordinal().range(d3_category20);
};

d3.scale.category20b = function() {
  return d3.scale.ordinal().range(d3_category20b);
};

d3.scale.category20c = function() {
  return d3.scale.ordinal().range(d3_category20c);
};

var d3_category10 = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

var d3_category20 = [
  "#1f77b4", "#aec7e8",
  "#ff7f0e", "#ffbb78",
  "#2ca02c", "#98df8a",
  "#d62728", "#ff9896",
  "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94",
  "#e377c2", "#f7b6d2",
  "#7f7f7f", "#c7c7c7",
  "#bcbd22", "#dbdb8d",
  "#17becf", "#9edae5"
];

var d3_category20b = [
  "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
  "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
  "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
  "#843c39", "#ad494a", "#d6616b", "#e7969c",
  "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];

var d3_category20c = [
  "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
  "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
  "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
  "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
  "#636363", "#969696", "#bdbdbd", "#d9d9d9"
];
d3.ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};
// R-7 per <http://en.wikipedia.org/wiki/Quantile>
d3.quantile = function(values, p) {
  var H = (values.length - 1) * p + 1,
      h = Math.floor(H),
      v = +values[h - 1],
      e = H - h;
  return e ? v + e * (values[h] - v) : v;
};

d3.scale.quantile = function() {
  return d3_scale_quantile([], []);
};

function d3_scale_quantile(domain, range) {
  var thresholds;

  function rescale() {
    var k = 0,
        q = range.length;
    thresholds = [];
    while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
    return scale;
  }

  function scale(x) {
    if (isNaN(x = +x)) return NaN;
    return range[d3.bisect(thresholds, x)];
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.filter(function(d) { return !isNaN(d); }).sort(d3.ascending);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.quantiles = function() {
    return thresholds;
  };

  scale.copy = function() {
    return d3_scale_quantile(domain, range); // copy on write!
  };

  return rescale();
}

d3.scale.quantize = function() {
  return d3_scale_quantize(0, 1, [0, 1]);
};

function d3_scale_quantize(x0, x1, range) {
  var kx, i;

  function scale(x) {
    return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
  }

  function rescale() {
    kx = range.length / (x1 - x0);
    i = range.length - 1;
    return scale;
  }

  scale.domain = function(x) {
    if (!arguments.length) return [x0, x1];
    x0 = +x[0];
    x1 = +x[x.length - 1];
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_quantize(x0, x1, range); // copy on write
  };

  scale.invertExtent = function(y) {
    y = range.indexOf(y);
    y = y < 0 ? NaN : y / kx + x0;
    return [y, y + 1 / kx];
  };

  return rescale();
}

d3.scale.threshold = function() {
  return d3_scale_threshold([.5], [0, 1]);
};

function d3_scale_threshold(domain, range) {

  function scale(x) {
    return range[d3.bisect(domain, x)];
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain;
    domain = _;
    return scale;
  };

  scale.range = function(_) {
    if (!arguments.length) return range;
    range = _;
    return scale;
  };

  scale.invertExtent = function(y) {
    y = range.indexOf(y);
    return [domain[y - 1], domain[y]];
  };

  scale.copy = function() {
    return d3_scale_threshold(domain, range);
  };

  return scale;
};

d3.scale.identity = function() {
  return d3_scale_identity([0, 1]);
};

function d3_scale_identity(domain) {

  function identity(x) { return +x; }

  identity.invert = identity;

  identity.domain = identity.range = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(identity);
    return identity;
  };

  identity.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  identity.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  identity.copy = function() {
    return d3_scale_identity(domain);
  };

  return identity;
}
var DEFAULTS = { };
DEFAULTS['HGRAPH_WIDTH'] = 960;
DEFAULTS['HGRAPH_HEIGHT'] = 720;
DEFAULTS['HGRAPH_RANGE_MINIMUM'] = 60;
DEFAULTS['HGRAPH_RANGE_MAXIMUM'] = 240;
DEFAULTS['HGRAPH_POINT_RADIUS'] = 10;
DEFAULTS['HGRAPH_SUBPOINT_RADIUS'] = 8;

DEFAULTS['HGRAPH_CANVAS_TEXTALIGN'] = 'center';
DEFAULTS['HGRAPH_CANVAS_TEXT'] = '20px Arial';
DEFAULTS['HGRAPH_POINT_COLOR_HEALTHY'] = '#616363';
DEFAULTS['HGRAPH_POINT_COLOR_UNHEALTHY'] = '#e1604f';
DEFAULTS['HGRAPH_APP_BOOTSTRAPS'] = ['data-hgraph-app','hgraph-app'];
DEFAULTS['HGRAPH_GRAPH_BOOTSTRAPS'] = ['data-hgraph-graph','hgraph-graph'];
DEFAULTS['HGRAPH_PAYLOAD_TRIGGERS'] = ['data-hgraph-payload','hgraph-payload'];
DEFAULTS['HGRAPH_RING_FILL_COLOR'] = '#97be8c';
// hGraph.Error
// a generic error class that handles any errors
hGraph.Error = function( message ) {
    return new Error( message );  
};
// math functions
var ceil = Math.ceil;
var floor = Math.floor;
var abs = Math.abs;
var toInt = function( num ) { return parseInt( num, 10 ); };
var toFloat = function( num ) { return parseFloat( num ); };
var toRad = function( ang ) { return ang * ( Math.PI / 180 ); };

// array shortcuts
var slice = [ ].slice;
var push = [ ].push;
var splice = [ ].splice;

// obj shortcuts
var hasOwn = { }.hasOwnProperty;
var toStr = { }.toString;

// type-related functions
var type = (function( ) { 
    
    var types = [ "", true, 12, /^$/, [ ], function(){ }, { }, null ],
        str, results = { };
        
    while( types.length > 0 ) { 
        str = toStr.call( types.pop( ) );
        results[str] = str.replace(/^\[object\s(.*)\]$/,"$1").toLowerCase( );
    }
    
    return (function( thing ) {
        return results[ toStr.call( thing ) ];  
    });
    
})( );

var isArr = function( thing ) { return type(thing) === "array"; };
var isObj = function( thing ) { return type(thing) === "object"; };
var isStr = function( thing ) { return type(thing) === "string"; };
var isFn = function( thing ) { return type(thing) === "function"; };
var isDef = function( thing ){ return type(thing) !== undefined; };
var isUndef = function( thing ) { return !isDef( thing ); };

// createUID
// returns a new unique identifier string to be used in hashes
// @returns {string} a unique identifier that is useable on the client-side
var createUID = (function( ) {
    var uid = 0;
    return (function( ) {
        return "uid-" + (++uid);
    });
})( );


// inject
// creates a function that calls the function being passed in as the first 
// parameter with references to the specific objects that are passed in as the second
// @param {function} the function that will be used
// @param [array] the parameters that should be used in the new function
// @param {self} the context (if any) to use when calling 'apply' on the function
// @returns {function} a new function that calls the parameter function with the appropriate params and context
var inject = function( fn, params, self ) {

    if( !isArr( params ) || !isFn( fn ) )
        return function( ) { };
    
    var context = self ? self : { };
    
    return function( ) {
        if( arguments.length > 0 )
            return fn.apply( context, params.concat( slice.call( arguments, 0 ) ) );
            
        fn.apply( context, params );
    };
    
};

// forEach
// iterates over an object or array, calling the iterator function with 
// the context and key,value pair of the current element in the iteration
// @param {object|array} the array/object that is going to be looped over
// @param {function} the function to loop over
// @param {context} what the 'this' should be while looping
var forEach = function(obj, iterator, context) {
    var key;
    if (obj) {
        if( isFn(obj) ) {
            for (key in obj) {
                if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
    	} else if (isArr(obj)) {
    	    for (key = 0; key < obj.length; key++) { 
    	        iterator.call(context, obj[key], key);
            }
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
};


// extend
// using a list of objects passed in as parameters, this function will
// copy those object's properties onto the first parametered object.
// @param {object} the object being copied onto
// @param [object,object] a list of objects to copy information to the destination
var extend = function( dest ) {
    
    if( !isObj( dest ) || arguments.length < 2 )
        return dest;
    
    forEach( splice.call( arguments, 1 ), function( obj ){
        forEach( obj, function( value, key ){
    	    dest[key] = value;
        });
    });

}


// a hash of parse functions used to aggregate all data into a a common format
var Parsers = { };

// Parsers.string
// used when the data being sent into the parse call is a string
// @param {string} the string to be converted to valid json/object format
// @returns {object} a formatted data object
Parsers.string = function( blob ) {
    // attempt to turn the string into json
    var json;
    try { 
        json = JSON.parse( blob );
    } catch( e ) {
        // throw an hgraph error if the call fails
        throw hGraph.Erorr('unable to parse the data string');
    }
    return Parsers['object']( json );
}; 

// Parsers.object
// called when the data being sent into the parse call is an object
// @param {object} the object that is to be checked for proper data information
// @param {object} a formatted data object
Parsers.object = function( blob ) {
    blob.formatted = true;
    return blob;
};


hGraph.Data = function( ) { };
// Data.parse
// for the time being, the state of the data API is volitile, which means not
// having a pre-defined payload data 
// @param {object} an information blob that will be turned into useable data
hGraph.Data.parse = function( blob ) {
    var formatted = false;
    
    if( isStr( blob ) )
        formatted = Parsers['string']( blob );
    else if( isObj( blob ) )
        formatted = Parsers['object']( blob );
    else 
        return false;

    return formatted;
};
// hGraph.graph
// the graph class that is used to create every graph on the page
// with their canvas (as long as they have the 'hgraph-graph' trigger attribute)
hGraph.Graph = (function( config ){ 

function InternalDraw( locals ) {
    if( !this.ready )
        return false;
    
    var transform = locals.GetComponent( 'transform' );
    locals.device.clearRect( 0, 0, transform.size.width, transform.size.height );
    
    // loop through all components and draw them
    var components = locals['components'], name;
    for( name in components )
        components[name].Draw( );
    
};

function InternalUpdate( locals ) {
    if( !this.ready )
        return false;
    
    var transform = locals.GetComponent('transform');
        
    // update the scale
    var minRange = DEFAULTS['HGRAPH_RANGE_MINIMUM'] * transform.scale,
        maxRange = DEFAULTS['HGRAPH_RANGE_MAXIMUM'] * transform.scale;
        
    locals.scoreScale.range([ minRange, maxRange ]);    
    
    // loop through all components and update them
    var components = locals['components'], name;
    for( name in components )
        components[name].Update( );
        
    this.invokeQueue.push( inject( InternalDraw, [ locals ], this ) );
    return this.ExecuteQueue( );  
};

function InternalMouseMove( locals, evt ) {
    if( !this.ready )
        return false;
    
    if( evt['touches'] )
        evt = evt['touches'][0];
        
    locals['mouse'].currentPositon.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].currentPositon.y = evt.pageY - locals['container'].offsetTop;
    
    var dx = locals['mouse'].currentPositon.x - locals['mouse'].lastPosition.x,
        dy = locals['mouse'].currentPositon.y - locals['mouse'].lastPosition.y;
    
    if( locals['mouse'].isDown ) {
        var transform = locals.GetComponent('transform');
        transform.scale += dy / 100;
        if( transform.scale < 1.0 ) transform.scale = 1.0;
        transform.rotation += dx;
    }    
    
    locals['mouse'].lastPosition.x = locals['mouse'].currentPositon.x;
    locals['mouse'].lastPosition.y = locals['mouse'].currentPositon.y;
    
    evt.preventDefault && evt.preventDefault( );
    
    // mouse move is an event where we need to update, add it to the queue and execute
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalMouseUp( locals, evt ) {
    if( !this.ready )
        return false;
    
    locals['mouse'].isDown = false;
    
    return evt.preventDefault && evt.preventDefault( );
};

function InternalMouseDown( locals, evt ) {
    if( !this.ready )
        return false;
        
    if( evt['touches'] )
        evt = evt['touches'][0];
    
    locals['mouse'].lastPosition.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].lastPosition.y = evt.pageY - locals['container'].offsetTop;
    
    locals['mouse'].isDown = true;
    
    return evt.preventDefault && evt.preventDefault( );

};

function InternalZoom( locals ) {    
    var transform = locals.GetComponent('transform');
    
    // increate the scale (zooming in)
    transform.scale = ( this.zoomed ) ? 1.0 : 2.0;
    transform.position.x = ( this.zoomed ) ? transform.size.width / 2.0 : 0.0;
    
    this.zoomed = !this.zoomed;
    
    // execute the new stack
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalClick( locals, evt ) {
    
    var clickX = evt.pageX - locals['container'].offsetLeft,
        clickY = evt.pageY - locals['container'].offsetTop,
        pointManager = locals.GetComponent('pointManager');
    
    if( pointManager.CheckClick( clickX, clickY ) )
        return this.invokeQueue.push( inject( InternalZoom, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalInitialize( locals ) {
    if( !this.ready )
        return false;
    
    // add points to the point manager
    var pointManager = locals.GetComponent('pointManager'),
        healthPoints = locals['payload'].points;
    for( var i = 0; i < healthPoints.length; i++ )
        healthPoints[i] = pointManager.AddPoint( healthPoints[i] );
    
    // loop through all components and initialize them
    var components = locals['components'], name;
    for( name in components )
        components[name].Initialize( locals );
    
    // set default graph text properties
    locals['device'].font = DEFAULTS['HGRAPH_CANVAS_TEXT'];
    locals['device'].textAlign = DEFAULTS['HGRAPH_CANVAS_TEXTALIGN'];
    
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function Graph( config ) {
    // while the graph is being prepared, it is not ready
    this.ready = false;
    
    // if no configuration was passed in for this graph, end    
    if( !config )
        return false;
    
    var // local references
        _uid = config.uid || createUID( ),
        _container = config.container,
        _canvas = document.createElement('canvas'),
        _device = _canvas.getContext('2d'),
        _mouse = { 
            currentPositon : {
                x : 0, 
                y : 0
            },
            lastPosition : {
                x : 0,
                y : 0
            },
            isDown : false
        },
        _components = { };
        
    try { 
        // add the canvas to the container
    	_container.appendChild( _canvas );
    } catch( e ) {
        this.ready = false;
        throw hGraph.Error('unable to insert a graph canvas into the specified container');
    }
    
    
    // add the components that will make up this graph
    _components['transform'] = new hGraph.Graph.Transform( );
    _components['ring'] = new hGraph.Graph.Ring( );
    _components['web'] = new hGraph.Graph.Web( );
    _components['pointManager'] = new hGraph.Graph.PointManager( );
    
    // save all of those locals into a local object to be injected
    var locals = {
        uid : _uid,
        container : _container,
        canvas : _canvas,
        device : _device,
        mouse : _mouse,
        components : _components,
        scoreScale : d3.scale.linear( )
                        .domain([0,100])
                        .range([ DEFAULTS['HGRAPH_RANGE_MINIMUM'], DEFAULTS['HGRAPH_RANGE_MAXIMUM'] ])
    };
    
    // GetComponent
    // a helper function that will return a component in the local component list based on a name
    // @param {string} the name of the component in the hash
    // @returns {object} a component that was created in the ComponentFactory
    locals.GetComponent = function( name ) {
        if( !this.components[name] )
            throw hGraph.Error('that component does not exist');
            
        return this.components[name];
    };
    
    _components['transform'].size.width = window.innerWidth;
    _components['transform'].size.height = window.innerHeight;
    
    
    var MouseMove = inject( InternalMouseMove, [ locals ], this ),
        MouseDown = inject( InternalMouseDown, [ locals ], this ),
        MouseUp = inject( InternalMouseUp, [ locals ], this ),
        CheckClick = inject( InternalClick, [ locals ], this );
            
    $( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .bind( 'mousemove', MouseMove )
        .bind( 'mousedown', MouseDown )
        .bind( 'mouseup', MouseUp )
        .bind( 'click', CheckClick )
        .attr( 'width', _components['transform'].size.width )
        .attr( 'height', _components['transform'].size.height );
    
    $( document )
        .bind( 'mouseup', MouseUp )
        .bind( 'touchstart', MouseDown )
        .bind( 'touchend', MouseUp )
        .bind( 'touchmove', MouseMove );
     
    // attempt to access payload data
    var payload = false;
    $( DEFAULTS['HGRAPH_PAYLOAD_TRIGGERS'] ).each(function(indx,trigger) {
        $( _container ).find('['+trigger+']').each(function( ) {
            if( this.value ) {
                payload = hGraph.Data.parse( this.value );
            }
        });
    });
    
    if( !payload || !payload.formatted || !payload.points )
        throw hGraph.Error('no payload information found for the graph');
    
    // if the payload object exists, it must be okay (save it)
    locals['payload'] = payload;

    // flag the graph as being ready for initialization
    this.ready = true;
    this.zoomed = false;
    
    // the invoke queue starts with initialization 
    this.invokeQueue = [ inject( InternalInitialize, [ locals ], this ) ];
    
};

Graph.prototype = {
        
    constructor : Graph,    
    
    Initialize : function( ) {
        if( this.ready )
            this.ExecuteQueue( );
    },
    
    ExecuteQueue : function( ) {
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
};

return Graph;

})( );

// hGraph.Graph.ComponentFacory
// creates a constructor that will have a prototype with the 
// properies modified by the factory function being passed as 
// the parameter
hGraph.Graph.ComponentFacory = function( factory ) {
    // create the public scope object 
    var proto = { };
        
    // allow the factory function to change the public scope (by reference) 
    factory( proto );
    
    // create the constructor for this component
    var Component = (function( fn ) {
        // the returned function is used as the constuctor for all component
        // instances. it handles calling the constructor specific to the component
        // defined by the factory function, and setting up all important stuff
        return function( ) {
            fn.apply( this, splice.call( arguments, 0 ) );
        };
    })( hasOwn.call( factory, 'constructor') ? factory['constructor'] : function( ) { } );
    
    Component.prototype = {
        
        Initialize : function( locals ) {
            // all components are not ready till proven otherwise
            this.ready = false;            
            // save a reference to the local variables on this object
            this.locals = locals || false;
            // do not move forward if there is no locals information in this component
            if( !this.locals || !this.locals['uid'] )
                throw new hGraph.Error('the component was unable to initialize with the information provided');
            // call the post initialize method for any component-specific initialization
            return this.PostInitialize( );
        },
        
        // placeholder functions that are overridden during extension
        Draw : function( ) { },
        Update : function( ) { },
        PostInitialize : function( ) { }
        
    };
    
    // extend the component's prototype with the modified scope 
    extend( Component.prototype, proto );
    
    // return the constructor to be used
    return Component;
};

// hGraph.Graph.Transform
// the transform component

// TransformFactory
function TransformFactory( proto ) {
    
    proto.Move = function( dx, dy ) {
        this.position.x += dx;
        this.position.y += dy;
    };
    
};

// TransformFactory (constructor)
TransformFactory['constructor'] = function( ) {
    // initialize everything with starting values
    this.size = { width : DEFAULTS['HGRAPH_WIDTH'], height : DEFAULTS['HGRAPH_HEIGHT'] };
    this.position = { x : ( this.size.width * 0.5 ), y : ( this.size.height * 0.5 ) };
    this.scale = 1;
    this.rotation = 0;
};

// create the constructor from the component factory
hGraph.Graph.Transform = hGraph.Graph.ComponentFacory( TransformFactory );

// hGraph.Graph.PointManager

// PointManagerFactory
function PointManagerFactory( proto ) {
    
    function CalculatePointIncrement( ) {
        var amt = this.points.length,
            inc = ( this.maxDegree - this.minDegree ) / amt;
        return inc;
    };
    
    proto.CheckClick = function( mx, my ) {
        for( var i = 0; i < this.points.length; i++ )
            if( this.points[i].CheckBoundingBox( mx, my ) ) return true;
    };
    
    proto.Update = function( ) { 
        var transform = this.locals.GetComponent('transform');
        this.opacity = ( this.subFlag ) ? abs( 1.0 - transform.scale ) : 1.0;
        this.drawFlag = this.opacity > 0 ? true : false;
        // loop through the points, updating them
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Update( );
    };
    
    proto.Draw = function( ) {
        // loop through the points, drawing them
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Draw( );
    };
        
    proto.AddPoint = function( data ) { 
        // create the point
        var point = new hGraph.Graph.Point( data );
        
        // make sure the point knows what his index is
        point.index = this.points.length;
        
        // expose this manager to the point so it will be able to calc it's degree
        point.manager = this;
        
        // if this is a sub-point list, make this dot smaller
        if( this.subFlag )
            point.radius = DEFAULTS['HGRAPH_SUBPOINT_RADIUS'];
            
        // add the point to the manager's 'points' array
        this.points.push( point );
        
        // return the point for local storage
        return point;
    };
    
    proto.PostInitialize = function( ) { 
        // update the manager's 'pointIncrement' property
        this.pointIncrement = CalculatePointIncrement.call( this );
        
        // initialize the points with the local variable hash
        for( var i = 0; i < this.points.length; i++ )
        	this.points[i].Initialize( this.locals );  
    };

};

// PointManagerFactory (constructor)
PointManagerFactory['constructor'] = function( subManagerFlag ) {
    // initialize everything to 0
    this.points = [ ];
    this.pointIncrement = 0;
    this.minDegree = 0;
    this.maxDegree = 360;
    this.subFlag = ( subManagerFlag === true ) ? true : false;
    this.drawFlag = true;
};

// create the constructor from the component factory
hGraph.Graph.PointManager = hGraph.Graph.ComponentFacory( PointManagerFactory );

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class.

// RingFactory
function RingFactory( proto ) {
    
    proto.Draw = function( ) {
        // get the graph's transform and device components
        var transform = this.locals.GetComponent('transform'),
            device = this.locals.device,
            scoreScale = this.locals.scoreScale;
        
        device.globalAlpha = 1.0;
        // draw the outer circle first
        device.beginPath( );
        device.arc( transform.position.x, transform.position.y, scoreScale(66), 0, Math.PI * 20 );
        device.fillStyle = DEFAULTS['HGRAPH_RING_FILL_COLOR'];
        device.fill( );
        
        // draw the outer circle first
        device.beginPath( );
        device.arc( transform.position.x, transform.position.y, scoreScale(33), 0, Math.PI * 20 );
        device.fillStyle = "#fff";
        device.fill( );
        
    };

};

RingFactory['constructor'] = function( ) {
    this.innerRadius = DEFAULTS['HGRAPH_INNER_RADIUS'];  
    this.outerRadius = DEFAULTS['HGRAPH_OUTER_RADIUS'];
};

// create the Ring constructor from the component factory
hGraph.Graph.Ring = hGraph.Graph.ComponentFacory( RingFactory );

// hGraph.Graph.PointText
// points 

// PointFactory
function PointTextFactory( proto ) {
    
    function GetFullText( ) {
        var str = this.name;
        if( this.value && this.value !== "")
            str += " " + this.value;  
        if( this.units && this.units !== "")
            str += " (" + this.units + ")";
        return str;
    };
    
    function GetShortText( ) {
        return this.name;  
    };
    
    proto.Update = function( rotation ) {
        var graphTransform = this.locals.GetComponent('transform'),
            scoreScale = this.locals.scoreScale,
            dist;
        
        // get the distance the point is away
        dist = scoreScale( 110 );
        
        // update the transform of this point
        this.transform.position.x = Math.cos( toRad( rotation ) ) * dist;
        this.transform.position.y = Math.sin( toRad( rotation ) ) * dist;
                                    
        this.text = graphTransform.scale > 1.5 
                        ? GetFullText.call( this )
                        : GetShortText.call( this );
    };
    
    proto.Draw = function( ) {
        var device = this.locals['device'],
            graphTransform = this.locals.GetComponent('transform');
        
        if( this.transform.position.x > 40 * graphTransform.scale ) 
            device.textAlign = 'start';
        else if( this.transform.position.x < -(40 * graphTransform.scale) )
            device.textAlign = 'end';
        else
            device.textAlign = 'center';
        
        var xpos = graphTransform.position.x + this.transform.position.x,
            ypos = graphTransform.position.y + this.transform.position.y;
            
        device.fillText( this.text, xpos, ypos );
    };
      
};

PointTextFactory['constructor'] = function( config ) {
    if( !config )
        return false;
        
    this.name  = config['name'];    
    this.units = config['units'];
    this.value = config['value'];
    this.healthyRange = config['healthyRange']; 
    this.text = this.name;
    
    this.transform = new hGraph.Graph.Transform( );   
};

// create the constructor from the component factory
hGraph.Graph.PointText = hGraph.Graph.ComponentFacory( PointTextFactory );

// hGraph.Graph.Point
// points 

// PointFactory
function PointFactory( proto ) {

    proto.Update = function( ) {    
        var graphTransform = this.locals.GetComponent('transform'),
            graphWeb = this.locals.GetComponent('web'),
            scoreScale = this.locals.scoreScale,
            dist;
        
        // get the distance the point is away
        dist = scoreScale( this.score );
        
        // update the transform of this point
        this.transform.position.x = graphTransform.position.x + 
                                    Math.cos( toRad( this.transform.rotation + graphTransform.rotation ) ) *
                                    dist;
        this.transform.position.y = graphTransform.position.y + 
                                    Math.sin( toRad( this.transform.rotation + graphTransform.rotation ) ) *
                                    dist;
        
        // the point color will be updated
        this.pointColor = ( this.score < 66 && this.score > 33 ) 
                                ? DEFAULTS['HGRAPH_POINT_COLOR_HEALTHY']
                                : DEFAULTS['HGRAPH_POINT_COLOR_UNHEALTHY'];
        
        // add this point to the graph's web path if it needs to be drawn
        if( this.manager.drawFlag === true )
            graphWeb.AddPoint( this.transform );
        
        // update any children this point may have
        this.subManager.Update( );   
        // udpate the point's text
        this.text.Update( this.transform.rotation + graphTransform.rotation );
    };
    
    proto.Draw = function( ) {         
        var device = this.locals['device'];
        // set opacity based on point manager
        device.globalAlpha = this.manager.opacity;
        // draw the circle
        device.beginPath( );
        device.arc( this.transform.position.x, this.transform.position.y, this.radius, 0, Math.PI * 20 );
        device.fillStyle = this.pointColor;
        device.fill( );
        // draw the text for this point
        this.text.Draw( );
        // draw any sub points
        if( this.subManager.points.length > 0 )
        	this.subManager.Draw( );
    };
    
    proto.CheckBoundingBox = function( mx, my ) {
        var graphTransform = this.locals.GetComponent('transform'),
            distX = mx - this.transform.position.x,
            distY = my - this.transform.position.y,
            distA = ( distX * distX ) + ( distY * distY ),
            ownClick = distA < ( this.radius * this.radius ),
            childClick = this.subManager.CheckClick( mx, my );
            
        return ownClick || childClick;
    };
    
    proto.PostInitialize = function( ) {
        var manager = this.manager,
            dependencies = this.dependencies,
            subData, subPoint;
        
        // loop through the dependencies data and addd points into the sub manager
        while( subData = dependencies.pop( ) )
            subPoint = this.subManager.AddPoint( subData );
        
        // calculate the sub-manager's rotational degree information
        var start = manager.pointIncrement * this.index,
            end = start + manager.pointIncrement,
            subSpace = end - start,
            subInc = subSpace / ( this.subManager.points.length + 2 );
        // save the degree information
        this.subManager.minDegree = start + subInc;
        this.subManager.maxDegree = end - subInc;
        // initialize the sub manager, which initializes sub points
        this.subManager.Initialize( this.locals );
        this.text.Initialize( this.locals );
        // update this point's rotation value
        this.transform.rotation = ( this.manager.pointIncrement * this.index ) + this.manager.minDegree;
    };
          
};

PointFactory['constructor'] = function( config ) {  
    if( !config || !isObj( config ) )
        throw hGraph.Error('not enough information provided to create point');
    this.radius = DEFAULTS['HGRAPH_POINT_RADIUS'];
    // grab values from the configuration
    this.score = toInt( config['score'] );
    // every point has a tranform to use
    this.transform = new hGraph.Graph.Transform( );
    // create the text from the configuration
    this.text = new hGraph.Graph.PointText( config );
    // create a sub manager in case of dependent points
    this.subManager = new hGraph.Graph.PointManager( true );
    // save an array of the dependent points
    this.dependencies = config.dependencies || [ ];    
    this.pointColor = "#333";
};

// create the constructor from the component factory
hGraph.Graph.Point = hGraph.Graph.ComponentFacory( PointFactory );

function WebFactory( proto ) {
    
    proto.Draw = function( ) {
        var device = this.locals['device'],
            point;
        
        device.globalAlpha = "0.1";
        device.fillStyle = '#000';
        device.beginPath( );
        // loop through points, adding their location to the current path
        while( point = this.path.pop( ) )
            device.lineTo( point.position.x, point.position.y );
            
        device.fill( );
        device.globalAlpha = "1.0";
    };
        
    proto.AddPoint = function( transform ) {
        this.path.push( transform );
    };
    
};

WebFactory['constructor'] = function( ) {
    this.path = [ ];  
};

// create the constructor from the component factory
hGraph.Graph.Web = hGraph.Graph.ComponentFacory( WebFactory );

// ----------------------------------------
// hGraph bootstrapping

// hCreateGraph
// creates the hgraph inside the container parameter
function hCreateGraph( container ){
    var uid = createUID( );
    hGraphInstances[uid] = new hGraph.Graph({ uid : uid, container : container });
};

// hGraphInit
// called once the root element has been found during the bootstrapping
// function call. takes care of populating the graphs on the page
function hGraphInit( ) {

    // try using the bootstrap selections to find elements
    $( DEFAULTS['HGRAPH_GRAPH_BOOTSTRAPS'] ).each(function(indx, trigger) {
        var matches = $("["+trigger+"]");
        // loop through the elements to create graphs inside them
        for( var i = 0; i < matches.length; i++ )
            hCreateGraph( matches[i] );
    });
    for( var uid in hGraphInstances )
        hGraphInstances[uid].Initialize( );
};

// hGraphBootStrap
// document ready callback. will search the page for an element with either
// a 'data-hgraph-app' or 'hgraph-app' attribute and save it as the root element
function hGraphBootStrap( ) {
    $( DEFAULTS['HGRAPH_APP_BOOTSTRAPS'] ).each(function(indx, trigger) {
        // try to find an element with the application bootstrap attribute
        var matches = $("["+trigger+"]");
        if( matches.length > 0 )
            hRootElement = matches.first( );
    });
    // if the 'hgraph-app' attribute was found, we can initialize
    if( hRootElement !== false )
        return hGraphInit( );
};

$(document).ready( hGraphBootStrap );

// expose hGraph to the window
global.hGraph = hGraph;

})( window );
