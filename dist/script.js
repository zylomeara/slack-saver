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

const getBackupData = () => {
    let oldBackup;
    try {
        oldBackup = JSON.parse(localStorage.getItem("backup") || "{}") || {};
    } catch (e) {
        oldBackup = {};
    }
    return oldBackup;
}

const backup = async () => {
    const {channels, members, messages} = await getSlackData();
    const oldBackup = getBackupData();
    const newBackup = mergeDeep(oldBackup, {channels, members, messages});

    localStorage.setItem("backup", JSON.stringify(newBackup))
    console.log(newBackup);
}

const getMessages = (real_name, options = {}) => {
    real_name = real_name.toLowerCase();
    let backupData = getBackupData();
    let memberId = Object.values(backupData.members).find(item => (item.real_name || '').toLowerCase().includes(real_name)).id;
    let channelId = Object.values(backupData.channels).find(item => (item.user || '').includes(memberId)).id;

    if (options.compact) {
        if (!backupData.messages[channelId]) {
            return undefined
        }

        return Object.entries(backupData.messages[channelId]).reduce((acc, [ts, obj]) => {
            const {text, user} = obj;
            return {
                ...acc,
                [ts]: {text, user}
            }
        }, null)
    }

    return backupData.messages[channelId]
}

const getAllMessages = () => {
    const {messages, channels, members} = getBackupData();

    const onlyUserChannelsList = Object.values(channels).filter(item => item.user);
    const membersList = Object.values(members);
    const messagesList = Object.values(messages);

    return onlyUserChannelsList.map(channel => {
        const name = ((membersList.find(member => member.id === channel.user)) || {}).real_name
        const messages = getMessages(name || '', {compact: true});

        return {
            name,
            messages
        }
    }).filter(item => item.messages).reduce((acc, {name, messages}) => {
        return {
            ...acc,
            [name]: messages
        }
    }, null)
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
