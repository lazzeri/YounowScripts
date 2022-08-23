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

    function assignReferees(broadcastId, existingReferees, moderatorUserId, userId)
    {

        fetch("//api.younow.com/php/api/doAdminAction", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-by": localStorage.getItem("requestBy")
            },
            "body": "actionId=" + '10' + "&userId=" + userId + "&onUserId=" + moderatorUserId + "&broadcastId=" + broadcastId + "&broadcaster=0",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }

    function checkIfReadyForManipulation(callback)
    {
        let interval = setInterval(() =>
        {
            if (document.getElementsByClassName("chat-list").length !== 0)
            {
                clearInterval(interval);
                callback();
            }
        }, 1000)
    }

    const checkForNewStream = function ()
    {
        let userName = '';
        let lastName = '';
        let userId = '';

        noDelaySetInterval(async function ()
        {
            userName = document.URL.replaceAll('https://www.younow.com/', '');

            console.log('Checking for new Stream...');
            //If we are on the explore page, we return.
            if (document.URL.includes('/explore'))
                return;

            //If we are on some empty page:
            if ('' === document.URL.replaceAll('https://www.younow.com/', ''))
                return;

            //If we already triggered the event for the same page, we can go back.
            if (lastName === userName)
                return;

            //We now know that we are on a Page and its a new Page so we get the data needed:
            lastName = document.URL.replaceAll('https://www.younow.com/', '');
            userName = lastName;
            userId = await getUserId(userName);
            console.log('New User set!', userName, userId);

            //If the iFrame is already created, like switching from one stream we just change the iFrame src:
            if (document.getElementById('iFrameThing'))
            {
                console.log('iFrame was already created, so we just change url.');
                document.getElementById('iFrameThing').src = 'https://streamnow.pro/popupchat?cid=' + userId;
                return;
            }

            console.log('No iFrame found, waiting for chat to load.')
            checkIfReadyForManipulation(function ()
            {
                console.log('Chat found, creating iFrame');
                let div = document.getElementsByClassName("chat-list");
                let iFrameElem = document.createElement('iframe');
                iFrameElem.id = 'iFrameThing';
                iFrameElem.style.height = '100%';
                iFrameElem.style.width = '100%';
                iFrameElem.src = 'https://streamnow.pro/popupchat?cid=' + userId;
                iFrameElem.classList = div[0].parentNode.classList;
                document.getElementsByClassName('chat-list')[0].append(iFrameElem);
            })

        }, 1000);
    };

    function noDelaySetInterval(func, interval)
    {
        func();
        return setInterval(func, interval);
    }

    function addParentListener()
    {
        window.addEventListener('message', function (e)
        {
            // Get the sent data
            const data = e.data;
            const test = document.querySelectorAll('[title="' + data + '"][class="truncate ng-star-inserted"]');
            if (test.length === 0)
            {
                return;
            } else
                test[0].click();

            console.log(data);

            // If you encode the message in JSON before sending them,
            // then decode here
            // const decoded = JSON.parse(data);
        });
    }

    function removeNormalChat()
    {
        let styles = `.comment-wrapper
                {
                          display:none;
                }
                `
        let styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    }

    function runCode()
    {
        console.log('Start Chat Script...');
        removeNormalChat();
        addParentListener();
        checkForNewStream();
    }

    runCode();

})();
