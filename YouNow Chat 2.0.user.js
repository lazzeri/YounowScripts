// ==UserScript==
// @name         YouNow Mute Overview
// @namespace    https://zerody.one
// @version      0.3
// @description  A simple moderator audit feature for YouNow
// @author       ZerodyOne
// @match        https://www.younow.com/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(async function ()
{
    'use strict';

    function getUserId(userName)
    {
        return new Promise((resolve) =>
        {
            fetch("https://api.younow.com/php/api/broadcast/info/curId=0/user=" + userName).then(response => response.json()).then((broadcastInfo) =>
            {
                return resolve(broadcastInfo.userId);
            });
        });
    }


    const startScanRoutineForNewUserName = function ()
    {
        console.log('scan for routine created');
        setInterval(async function ()
        {
            if (!document.getElementById('iFrameThing'))
                return;

            if (lastName !== document.URL.replaceAll('https://www.younow.com/', ''))
            {
                lastName = document.URL.replaceAll('https://www.younow.com/', '');
                userName = lastName;
                userId = await getUserId(userName);
                console.log('new User set!', userName, userId);
                document.getElementById('iFrameThing').src = 'https://streamnow.pro/popupchat?cid=' + userId;
            }

        }, 1000);
    };


    function checkIfReadyForManipulation(callback)
    {
        console.log('check for manip created');
        let interval = noDelaySetInterval(() =>
        {
            console.log('checking for chat-list');
            if (document.getElementsByClassName("chat-list").length !== 0)
            {
                console.log('chat list found: cleared and starts function');
                clearInterval(interval);
                callback();
            }
        }, 1000)
    }

    function noDelaySetInterval(func, interval)
    {
        func();
        return setInterval(func, interval);
    }

    function sleep(delay)
    {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay) ;
    }


    console.log('Running Chat');
    let lastName;
    let userName = document.URL.replaceAll('https://www.younow.com/', '');
    let userId = await getUserId(userName);

    lastName = userName;

    console.log(userName, userId);

    checkIfReadyForManipulation(function ()
    {
        console.log('change executed');
        let div = document.getElementsByClassName("chat-list");
        let iFrameElem = document.createElement('iframe');
        iFrameElem.id = 'iFrameThing';
        iFrameElem.style.height = '100%';
        iFrameElem.style.width = '100%';
        console.log(userId);
        iFrameElem.src = 'https://streamnow.pro/popupchat?cid=' + userId;
        iFrameElem.classList = div[0].parentNode.classList;
        document.getElementsByClassName('chat-list')[0].append(iFrameElem);
        let styles = `.comment-wrapper
                {
                          display:none;
                }
                `
        let styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

    })
    startScanRoutineForNewUserName();


})();
