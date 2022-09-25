// ==UserScript==
// @name         Plinko Queue System
// @namespace    https://streamnow.pro
// @version      0.1
// @description  Integrates the Streamnow Chat into Younow
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
    const userName = '123FreshLikeMe';
    let giftQueue = [];

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


    }

    const blockUser = (targetUserId) =>
    {
        fetch("//api.younow.com/php/api/doAdminAction", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-by": localStorage.getItem("requestBy")
            },
            "body": "actionId=" + 281474976710656 + "&userId=" + broadcasterUserId + "&onUserId=" + targetUserId + "&tsi=FXm2qPfg0D&tdi=yt12B0GFdq&lang=de",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }

    const unblockUser = (targetUserId) =>
    {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://api.younow.com/php/api/doAdminAction");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.setRequestHeader("X-Requested-By", localStorage.getItem("requestBy"));
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.withCredentials = true;

        let dataToSend = `actionId: 562949953421312,
            userId: 55936410,
            onUserId: 58583141,
            comment: 'yo',
            broadcastId: 216124010,
            broadcaster: 0,
            tsi: 'FXm2qPfg0D',
            tdi: 'yt12B0GFdq',
            lang: 'de'`

        xhr.send("actionId=" + 562949953421312 + "&userId=" + broadcasterUserId + "&onUserId=" + targetUserId + "&tsi=FXm2qPfg0D&tdi=yt12B0GFdq&broadcaster=0&lang=de&comment=autoBan&broadcastId=" + broadcasterBroadcastId);
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

            channel.bind('onChat', function (data)
            {
                let comment = data.message.comments[0];
                callBack(comment);
            });


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


    //MAIN ----------------------------------------------------
    async function runCode()
    {
        let {userId, broadcastId} = await getUserInfo(userName);
        broadcasterBroadcastId = broadcastId;
        broadcasterUserId = userId;

        console.log(broadcastId);

        setupPusher(async (data) =>
        {
            blockUser(data.userId);
            await sleep(2000);
            unblockUser(data.userId);
        })
    }

    runCode();

})();
