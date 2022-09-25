// ==UserScript==
// @name         Yonow Chat 2.0
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
    const userId = 48065241;


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

    const setupPusher = (giftCallback) =>
    {
        const installPusherLibrary = () =>
        {
            return new Promise(async resolve =>
            {
                console.log('Installing Pusher Library')
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('script');
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
            let channel = pusher.subscribe("public-channel_" + userId);
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
        setupPusher((data) =>
        {
            console.log(data);
        })
    }

    runCode();

})();
