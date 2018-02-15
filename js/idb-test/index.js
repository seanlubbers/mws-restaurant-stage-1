debugger;

import idb from 'idb';

var dbPromise = idb.open('test-db', 1, function(upgradeDB) {
	var keyValStore = upgradeDB	.createObjectStore('keyval');
	keyValStore.put('world', 'hello');
});