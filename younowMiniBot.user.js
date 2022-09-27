// ==UserScript==
// @name         Mini commands chat bot
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
    let local = 'en';
    const userName = '123FreshLikeMe';
    const commands = {
        discord: 'The discord message',
        otherone: '',
        otherone2: ''
    }

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

    const sendMessage = (userId, text) =>
    {
        fetch("//api.younow.com/php/api/broadcast/chat", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-by": localStorage.getItem("requestBy")
            },
            "body": "userId=" + userId + "&channelId=" + userId + "&comment=" + text + "&tsi=qTARYFhKsb&tdi=tV16GrJcrS&lang=" + local,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }


    const setupPusher = (userId, giftCallback) =>
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

        const connectToWebsocket = (callBack, userId) =>
        {
            console.log('Connecting to websocket');
            let pusher = new Pusher('d5b7447226fc2cd78dbb', {
                cluster: "younow"
            });
            console.log('Used userid:', userId);

            let channel = pusher.subscribe("public-channel_" + userId);

            channel.bind('onChat', function (data)
            {
                for (let i = 0; i < data.message.comments.length; i++)
                {
                    let obj = data.message.comments[i];
                    callBack(obj)
                }
            });
        }

        installPusherLibrary().then(() => connectToWebsocket(giftCallback, userId));
        return 'Done';
    }

    const triggerEvent = (name, text, userId) =>
    {
        for (const [command, message] of Object.entries(commands))
        {
            if (text.toLowerCase().includes(command.toLowerCase()))
            {
                sendMessage(userId, '@' + name + ' ' + message);
            }
        }
    }

    //MAIN ----------------------------------------------------
    async function runCode()
    {
        const {userId} = await getUserInfo(userName);
        setupPusher(userId, async (data) =>
        {
            triggerEvent(data.name, data.comment, userId);
        })
    }

    runCode();

})();





