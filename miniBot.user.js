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
    const MESSAGE = 'YOYO MOTHERFUGAAA';
    const TIMETOWAITINSECONDS = 10;
    'use strict';
    let publicUserId, publicBroadcastId;

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

    function sleep(milliseconds)
    {
        if (milliseconds < 0)
            return new Promise(resolve =>
            {
                resolve()
            })

        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function assignReferees(userId, channelId, comment)
    {
        fetch("//api.younow.com/php/api/broadcast/chat", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-by": localStorage.getItem("requestBy")
            },
            "body": "userId=" + userId + "&channelId=" + channelId + "&comment=" + comment + "&tsi=qTARYFhKsb&tdi=tV16GrJcrS&lang=es",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }


    async function runCode()
    {
        console.log('Lets go!');
        setInterval(() =>
        {
            assignReferees(58421006, 58421006, MESSAGE);
        }, TIMETOWAITINSECONDS * 1000)
        await sleep(5000);
    }

    runCode();

})();
