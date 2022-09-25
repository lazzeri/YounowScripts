// ==UserScript==
// @name         Pelinka Queue System
// @namespace    https://streamnow.pro
// @version      0.1
// @description  A queue system I use for the pelinka games
// @author       Lazzeri
// @match        https://www.younow.com/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(async function ()
{
    'use strict';
    //Both initiated in the beginning
    let broadcasterUserId;
    let broadcasterBroadcastId;
    let local = 'en';
    const userName = 'Mini_Pearl_Pelinka';
    const giftQueue = {};
    const maxGifts = 5;
    const maxTime = 5;
    const blockTimeInHours = 1;
    let blockedList = [];

    //Helper Functions ---------------------------------------------------
    function sleep(milliseconds)
    {
        if (milliseconds < 0)
            return new Promise(resolve =>
            {
                resolve()
            })

        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    //Normal Functions ---------------------------------------------------
    const addBlockedUserToLocalStorage = (userId) =>
    {
        let oldItem = localStorage.getItem('blockedUsers');

        //If it's not set at all update
        if (!oldItem)
        {
            localStorage.setItem('blockedUsers', JSON.stringify([userId]));
            blockedList = [userId];
            return;
        }

        let oldArray = JSON.parse(oldItem);

        localStorage.setItem('blockedUsers', JSON.stringify([...oldArray, userId]));
        blockedList = [...oldArray, userId];
    }

    const removeBlockedUserFromLocalStorage = (userId) =>
    {
        let oldItem = JSON.parse(localStorage.getItem('blockedUsers'));
        const filteredItem = oldItem.filter((elem) =>
        {
            return userId !== elem
        });

        blockedList = blockedList.filter((elem) =>
        {
            return userId !== elem
        });

        localStorage.setItem('blockedUsers', JSON.stringify(filteredItem));

    }

    function getUserInfo(userName)
    {
        return new Promise((resolve) =>
        {
            fetch("https://api.younow.com/php/api/broadcast/info/curId=0/user=" + userName).then(response => response.json()).then((broadcastInfo) =>
            {
                return resolve(broadcastInfo);
            });
        });
    }

    const sendMessage = (text) =>
    {
        fetch("//api.younow.com/php/api/broadcast/chat", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-by": localStorage.getItem("requestBy")
            },
            "body": "userId=" + broadcasterUserId + "&channelId=" + broadcasterUserId + "&comment=" + text + "&tsi=qTARYFhKsb&tdi=tV16GrJcrS&lang=" + local,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }

    const blockUser = async (targetUserId) =>
    {
        addBlockedUserToLocalStorage(targetUserId);
        fetch("//api.younow.com/php/api/doAdminAction", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-by": localStorage.getItem("requestBy")
            },
            "body": "actionId=" + 281474976710656 + "&userId=" + broadcasterUserId + "&onUserId=" + targetUserId + "&tsi=FXm2qPfg0D&tdi=yt12B0GFdq&lang=" + local,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        await sleep(1000 * 60 * 60 * blockTimeInHours);
        unblockUser(targetUserId);
    }

    const unblockUser = (targetUserId) =>
    {
        removeBlockedUserFromLocalStorage(targetUserId);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://api.younow.com/php/api/doAdminAction");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.setRequestHeader("X-Requested-By", localStorage.getItem("requestBy"));
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.withCredentials = true;

        xhr.send("actionId=" + 562949953421312 + "&userId=" + broadcasterUserId + "&onUserId=" + targetUserId + "&tsi=FXm2qPfg0D&tdi=yt12B0GFdq&broadcaster=0&lang=" + local + "&comment=autoBan&broadcastId=" + broadcasterBroadcastId);
    }

    const setupPusher = (giftCallback) =>
    {
        const installPusherLibrary = () =>
        {
            return new Promise(async resolve =>
            {
                console.log('Installing Pusher Library')
                let head = document.getElementsByTagName('head')[0];
                let link = document.createElement('script');
                link.src = 'https://js.pusher.com/7.0/pusher.min.js';
                head.appendChild(link);
                await sleep(2000);
                return resolve();
            })
        }

        const connectToWebsocket = (callBack) =>
        {
            console.log('Connecting to websocket');
            let pusher = new Pusher('d5b7447226fc2cd78dbb', {
                cluster: "younow"
            });
            let channel = pusher.subscribe("public-channel_" + broadcasterUserId);


            channel.bind('onGift', function (data)
            {
                for (let i = 0; i < data.message.stageGifts.length; i++)
                {
                    let obj = data.message.stageGifts[i];
                    switch (obj.giftId)
                    {
                        case 1178:
                            obj.type = 'pearlsTipJarPlinko'
                            break;
                        case 1065:
                            obj.type = 'pearlsTipJar'
                            break;
                        default:
                            obj.type = 'notNeeded'
                    }
                    callBack(obj);
                }
            });
        }

        installPusherLibrary().then(() => connectToWebsocket(giftCallback));
        return 'Done';
    }


    const addToGiftQueue = (userId) =>
    {
        //First we add the gift to the corresponding path;
        if (giftQueue[userId])
        {
            giftQueue[userId].push(getTimeInSeconds());
        } else
        {
            giftQueue[userId] = [getTimeInSeconds()];
        }

        return giftQueue[userId];
    }

    const filterGifts = (userId) =>
    {
        return giftQueue[userId].filter(elem =>
        {
            return (getTimeInSeconds() - elem) < 60 * maxTime;
        })
    }

    const secondsToTime = (timeInSeconds) =>
    {
        var sec_num = parseInt(timeInSeconds, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10)
        {
            hours = "0" + hours;
        }
        if (minutes < 10)
        {
            minutes = "0" + minutes;
        }
        if (seconds < 10)
        {
            seconds = "0" + seconds;
        }
        return minutes + ':' + seconds;
    }

    const checkLength = (length, userId, userName, firstGiftTime) =>
    {
        switch (length)
        {
            //Send first Warning
            case maxGifts - 2:
                sendMessage('⚠ @' + userName + ' WARNING 3/5 SENT. NEXT GIFTS: ' + firstGiftTime + ' ADVERTENCIA 3/5 ENVIADO. PRÓXIMOS REGALOS: ' + firstGiftTime);
                break;
            //Send second Warning
            case maxGifts - 1:
                sendMessage('⚠ @' + userName + ' WARNING 4/5 SENT. NEXT GIFTS: ' + firstGiftTime + ' ADVERTENCIA 4/5 ENVIADO. PRÓXIMOS REGALOS: ' + firstGiftTime);
                break;
            //Block time baby!
            case maxGifts:
                sendMessage('🚨 USER ' + userName + ' BLOCKED FOR 1 HOUR');
                blockUser(userId);
                break;
        }

    }

    const getTimeInSeconds = () =>
    {
        return Math.round(Date.now() / 1000);
    }

    const firstGiftTime = (array) =>
    {
        if (array.length === 0)
            return 0;

        return secondsToTime(maxTime * 60 - (getTimeInSeconds() - array[0]));
    }

    const checkGift = (userId, userName) =>
    {
        if (blockedList.includes(userId))
            return;

        //First we add the gift
        addToGiftQueue(userId);
        //Next filter out all the gifts that are too old
        giftQueue[userId] = filterGifts(userId);
        // Now we check the length
        checkLength(giftQueue[userId].length, userId, userName, firstGiftTime(giftQueue[userId]));
    }

    //MAIN ----------------------------------------------------
    async function runCode()
    {
        let {userId, broadcastId} = await getUserInfo(userName);
        broadcasterBroadcastId = broadcastId;
        broadcasterUserId = userId;

        setupPusher(async (data) =>
        {
            checkGift(data.userId, data.name);
        })
    }

    runCode();

})();
