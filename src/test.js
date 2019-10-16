var getAll = () => new Promise((resolve, reject) => {
    var storeName = "reduxPersistence";
    var objectName = "reduxPersistenceStore";
    var openRequest = indexedDB.open(storeName);

// openRequest.onupgradeneeded = function() {
//     // срабатывает, если на клиенте нет базы данных
//     // ...выполнить инициализацию...
// };

    openRequest.onerror = function() {
        // console.error("Error", openRequest.error);
        reject(openRequest.error);
    };

    openRequest.onsuccess = function() {
        let db = openRequest.result;
        // продолжить работу с базой данных, используя объект db

        function getAllItems(callback) {
            var trans = db.transaction(objectName, "readwrite");
            var store = trans.objectStore(objectName);
            var items = [];

            trans.oncomplete = function(evt) {
                callback(items);
            };

            var cursorRequest = store.openCursor();

            cursorRequest.onerror = function(error) {
                console.log(error);
            };

            cursorRequest.onsuccess = function(evt) {
                var cursor = evt.target.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                }
            };
        }

        getAllItems(items => resolve(items[0]));
    };
});


var lst = await getAll();

Object.values(lst.members).filter(item => item.real_name).find(member => member.real_name.includes('Голубев'))




function mergeDeep(...objects) {
    const isObject = obj => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            }
            else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}

// Test objects
const obj1 = {
    a: 1,
    b: 1,
    c: { x: 1, y: 1 },
    d: [ 1, 1 ]
}
const obj2 = {
    b: 2,
    c: { y: 2, z: 2 },
    d: [ 2, 2 ],
    e: 2
}
const obj3 = mergeDeep(obj1, obj2);

// Out
console.log(obj3);
