const mergeDeep = (...objects) => {
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


const getSlackData = () => new Promise((resolve, reject) => {
    let storeName = "reduxPersistence";
    let objectName = "reduxPersistenceStore";
    let openRequest = indexedDB.open(storeName);

// openRequest.onupgradeneeded = function() {
//     // срабатывает, если на клиенте нет базы данных
//     // ...выполнить инициализацию...
// };

    openRequest.onerror = function() {
        // console.error("Error", openRequest.error);
        reject({});
        // reject(openRequest.error);
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

const backup = async () => {
    const {channels, members, messages} = await getSlackData();
    let oldBackup;
    try {
        oldBackup = JSON.parse(localStorage.getItem("backup") || "{}") || {};
    } catch (e) {
        oldBackup = {};
    }
    const newBackup = mergeDeep(oldBackup, {channels, members, messages});

    localStorage.setItem("backup", JSON.stringify(newBackup))
    console.log(newBackup);
}

setTimeout(backup, 60 * 1000)

// (function() {
//     var XHR = XMLHttpRequest.prototype;
//     // Remember references to original methods
//     var open = XHR.open;
//     var send = XHR.send;
//
//     // Overwrite native methods
//     // Collect data:
//     XHR.open = function(method, url) {
//         this._method = method;
//         this._url = url;
//         return open.apply(this, arguments);
//     };
//
//     // Implement "ajaxSuccess" functionality
//     XHR.send = function(postData) {
//         this.addEventListener('load', function() {
//             if (this._url.includes('conversations')) {
//                 console.log({
//                     method: this._method,
//                     url: this._url,
//                     responseText: JSON.parse(this.responseText),
//                     postData: postData
//                 });
//             }
//         });
//         return send.apply(this, arguments);
//     };
// })();
