var mergeDeep = (...objects) => {
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
};


var getSlackData = () => new Promise((resolve, reject) => {
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

var getBackupData = () => {
    let oldBackup;
    try {
        oldBackup = JSON.parse(localStorage.getItem("backup") || "{}") || {};
    } catch (e) {
        oldBackup = {};
    }
    return oldBackup;
};

var backup = async () => {
    const {channels, members, messages} = await getSlackData();
    const oldBackup = getBackupData();
    const newBackup = mergeDeep(oldBackup, {channels, members, messages});

    localStorage.setItem("backup", JSON.stringify(newBackup))
    console.log(newBackup);
};

var getMessages = (real_name, options = {}) => {
    real_name = real_name.toLowerCase();
    let backupData = options.data ? options.data : getBackupData();
    let memberId = Object.values(backupData.members).find(item => (item.real_name || '').toLowerCase().includes(real_name)).id;
    let channelId = Object.values(backupData.channels).find(item => (item.user || '').includes(memberId)).id;

    if (options.compact) {
        if (!backupData.messages[channelId]) {
            return undefined
        }

        function leftPad(value, length) {
            return ('0'.repeat(length) + value).slice(-length);
        }

        return Object.entries(backupData.messages[channelId]).reduce((acc, [ts, obj]) => {
            const {text, user} = obj;
            const timestamp = Number(ts.split('.')[0]) * 1000;
            const date = new Date(timestamp);
            return {
                ...acc,
                [`${date.getFullYear()
                }.${leftPad(date.getMonth(), 2)
                }.${leftPad(date.getDate(), 2)
                }-${leftPad(date.getHours(), 2)
                }:${leftPad(date.getMinutes(), 2)
                }:${leftPad(date.getSeconds(), 2)
                }`]: {text, user}
            }
        }, null)
    }

    return backupData.messages[channelId]
};

var getAllMessages = async () => {
    const {channels, members, messages} = await getDatabaseData();

    const onlyUserChannelsList = Object.values(channels).filter(item => item.user);
    const membersList = Object.values(members);

    return onlyUserChannelsList.map(channel => {
        const name = ((membersList.find(member => member.id === channel.user)) || {}).real_name;
        const msgs = getMessages(name || '', {compact: true, data:{channels, members, messages}});

        return {
            name,
            messages: msgs,
        }
    }).filter(item => item.messages).reduce((acc, {name, messages}) => {
        return {
            ...acc,
            [name]: messages
        }
    }, null)
};

var getMessagesFromChannel = async (channelName) => {
    const {messages, channels, members} = await getDatabaseData();
    const foundChannel = Object.values(channels)
        .filter(ch => ch.is_channel || ch.is_group || ch.is_general)
        .find(ch => ch.name.includes(channelName)) || {};
    const foundMessages = (
        Object.entries(messages)
            .find(([idCh, msgs]) => foundChannel.id === idCh) || []
    )[1] || {};
    return Object.entries(foundMessages)
        .reduce((acc, [ts, {text, user}]) => ({
            ...acc,
            [ts]: {
                text,
                user
            }
        }), {});
};

var syncDatabase = async () => {
    var data = await getTransformedSlackData();

    fetch('http://localhost:3000/backup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json());
};

var getDatabaseData = async () => {
    try {
        const {messages, channels, members} = await fetch('http://localhost:3000/backup/')
            .then(res => res.json())
            .then(res => {
                if (res.messages && res.channels && res.members) {
                    return res;
                }
                throw Error('Invalid data')
            });

        const respToInternalData = {
            channels: channels.reduce((acc, next) => ({
                ...acc,
                [next.id]: next,
            }), {}),
            members: members.reduce((acc, next) => ({
                ...acc,
                [next.id]: next,
            }), {}),
            messages: messages.reduce((acc, next) => ({
                ...acc,
                [next.channel]: {...(acc[next.channel] || {}), [next.ts]: next},
            }), {})
        };

        return respToInternalData;
    } catch (e) {
        return {};
    }
};

var mergeFromDatabase = async () => {
    const dbData = await getDatabaseData();
    const lcData = getBackupData();

    const mergedData = mergeDeep(dbData, lcData);

    localStorage.setItem('backup2', JSON.stringify(mergedData));
};

var getTransformedSlackData = async () => {
    const {channels, members, messages} = await getSlackData();

    const data = {
        channels: Object.values(channels)
            .map(chnl => ({
                ...chnl,
                _id: chnl.id
            })),
        members: Object.values(members)
            .map(member => ({
                ...member,
                _id: member.id
            })),
        messages: Object.values(messages)
            .map(obj =>
                Object.values(obj)
                    .map(msg => {
                        const ts = Number((msg.ts || '').replace(/\./, ''));
                        if (Number.isNaN(ts)) {
                            throw new Error('Catch NaN')
                        }
                        return ({
                            ...msg,
                            _id: ts
                        });
                    })
            )
            .reduce((acc, next) => [
                ...acc,
                ...next
            ], [])
    }

    return data;
};


// setTimeout(backup, 60 * 1000);

window.con = window.console;

window.console = Object.entries(con)
    .map(([methodName, methodFun]) => typeof methodFun === 'function' ? [methodName, () => {}] : [methodName, methodFun])
    .reduce((acc, [methodName, methodFun]) => ({
        ...acc,
        [methodName]: methodFun,
    }), {});

// window.console = {
//     ...window.con,
//     log: () => {},
//     error: () => {},
//     debug: () => {},
//     info: () => {},
//     warn: () => {},
// };

// window.fetchOriginal = window.fetch;
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
