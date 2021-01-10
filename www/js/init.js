﻿/**
 * init.js : Configuration for the library require.js
 * This file handles the dependencies between javascript libraries
 * 
 * Copyright 2013-2020 Mossroy and contributors
 * License GPL v3:
 * 
 * This file is part of Kiwix.
 * 
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */
'use strict';

// Set a global error handler to prevent app crashes
window.onerror = function (msg, url, line, col, error) {
    console.error('Error caught in app [' + url + ':' + line + ']:\n' + msg, error);
    return true;
};

/**
 * Provides caching for assets contained in ZIM (variable needs to be available app-wide)
 * It significantly speeds up subsequent page display. See kiwix-js issue #335
 */
var assetsCache = new Map();

/**
 * A global parameter object for storing variables that need to be remembered between page loads,
 * or across different functions and modules
 * 
 * @type Object
 */
var params = {};

/**
 * A global state object
 * 
 * @type Object
 */
var appstate = {};
/******** UPDATE VERSION IN pwabuilder-sw.js TO MATCH VERSION *******/
params['version'] = "1.1.4"; //DEV: Manually update this version when there is a new release: it is compared to the Settings Store "version" in order to show first-time info, and the cookie is updated in app.js
/******* UPDATE THIS ^^^^^^ IN serveice worker!! ********************/
params['packagedFile'] = "wikipedia_en_100_maxi.zim"; //For packaged Kiwix JS (e.g. with Wikivoyage file), set this to the filename (for split files, give the first chunk *.zimaa) and place file(s) in default storage
params['archivePath'] = "archives"; //The directory containing the packaged archive(s) (relative to app's root directory)  
params['fileVersion'] = "wikipedia_en_100_maxi_2020-12.zim (23-Dec-2020)"; //Use generic name for actual file, and give version here
params['cachedStartPage'] = false; //If you have cached the start page for quick start, give its URI here
params['kiwixDownloadLink'] = "https://download.kiwix.org/zim/"; //Include final slash

params['storeType'] = getBestAvailableStorageAPI();
params['keyPrefix'] = 'kiwixjs-'; // Prefix to use for localStorage keys
params['maxResults'] = ~~(getSetting('maxResults') || 25); //Number of search results to display
params['relativeFontSize'] = ~~(getSetting('relativeFontSize') || 100); //Sets the initial font size for articles (as a percentage) - user can adjust using zoom buttons
params['relativeUIFontSize'] = ~~(getSetting('relativeUIFontSize') || 100); //Sets the initial font size for UI (as a percentage) - user can adjust using slider in Config
params['cssSource'] = getSetting('cssSource') || "auto"; //Set default to "auto", "desktop" or "mobile"
params['removePageMaxWidth'] = getSetting('removePageMaxWidth') != null ? getSetting('removePageMaxWidth') : "auto"; //Set default for removing max-width restriction on Wikimedia pages ("auto" = removed in desktop, not in mobile; true = always remove; false = never remove)
params['openAllSections'] = getSetting('openAllSections') != null ? getSetting('openAllSections') : true; //Set default for opening all sections in ZIMs that have collapsible sections and headings ("auto" = let CSS decide according to screen width; true = always open until clicked by user; false = always closed until clicked by user)
params['cssCache'] = getSetting('cssCache') != null ? getSetting('cssCache') : true; //Set default to true to use cached CSS, false to use Zim only
params['cssTheme'] = getSetting('cssTheme') || 'light'; //Set default to 'auto', 'light', 'dark' or 'invert' to use respective themes for articles
params['cssUITheme'] = getSetting('cssUITheme') || 'light'; //Set default to 'auto', 'light' or 'dark' to use respective themes for UI
params['imageDisplay'] = getSetting('imageDisplay') != null ? getSetting('imageDisplay') : true; //Set default to display images from Zim
params['hideToolbars'] = getSetting('hideToolbars') != null ? getSetting('hideToolbars') : true; //Set default to true (hides both), 'top' (hides top only), or false (no hiding)
params['rememberLastPage'] = getSetting('rememberLastPage') != null ? getSetting('rememberLastPage') : true; //Set default option to remember the last visited page between sessions
params['useMathJax'] = getSetting('useMathJax') != null ? getSetting('useMathJax') : true; //Set default to true to display math formulae with MathJax, false to use fallback SVG images only
//params['showFileSelectors'] = getCookie('showFileSelectors') != null ? getCookie('showFileSelectors') : false; //Set to true to display hidden file selectors in packaged apps
params['showFileSelectors'] = true; //False will cause file selectors to be hidden on each load of the app (by ignoring cookie)
params['hideActiveContentWarning'] = getSetting('hideActiveContentWarning') != null ? getSetting('hideActiveContentWarning') : false;
params['allowHTMLExtraction'] = getSetting('allowHTMLExtraction') == true;
params['alphaChar'] = getSetting('alphaChar') || 'A'; //Set default start of alphabet string (used by the Archive Index)
params['omegaChar'] = getSetting('omegaChar') || 'Z'; //Set default end of alphabet string
params['contentInjectionMode'] = getSetting('contentInjectionMode') || 'jquery'; //Defaults to jquery mode (widest compatibility)

//Do not touch these values unless you know what they do! Some are global variables, some are set programmatically
params['imageDisplayMode'] = params.imageDisplay ? 'progressive' : 'manual';
params['storedFile'] = getSetting('lastSelectedArchive') || params['packagedFile'];
params.storedFile = launchArguments ? launchArguments.files[0].name : params.storedFile;
params['storedFilePath'] = getSetting('lastSelectedArchivePath');
params.storedFilePath = params.storedFilePath ? decodeURIComponent(params.storedFilePath) : params.archivePath + '/' + params.packagedFile;
params.storedFilePath = launchArguments ? launchArguments.files[0].path || '' : params.storedFilePath;
params.originalPackagedFile = params.packagedFile;
params['falFileToken'] = params['falFileToken'] || "zimfile"; //UWP support
params['falFolderToken'] = params['falFolderToken'] || "zimfilestore"; //UWP support
params['localStorage'] = params['localStorage'] || "";
params['pickedFile'] = launchArguments ? launchArguments.files[0] : "";
params['pickedFolder'] = params['pickedFolder'] || "";
params['lastPageVisit'] = getSetting('lastPageVisit') || "";
params.lastPageVisit = params.lastPageVisit ? decodeURIComponent(params.lastPageVisit): "";
params['themeChanged'] = params['themeChanged'] || false;
params['allowInternetAccess'] = params['allowInternetAccess'] || false; //Do not get value from cookie, should be explicitly set by user on a per-session basis
params['printIntercept'] = false;
params['printInterception'] = false;
params['appIsLaunching'] = true; //Allows some routines to tell if the app has just been launched
params['PWAInstalled'] = decodeURIComponent(getSetting('PWAInstalled'));
params.pagesLoaded = 0; // Page counter used to show PWA Install Prompt only after user has played with the app for a while

//Prevent app boot loop with problematic pages that cause an app crash
if (getSetting('lastPageLoad') === 'failed') {
    params.lastPageVisit = "";
} else {
    //Cookie will signal failure until article is fully loaded
    if (params.storeType === 'cookie') {
        document.cookie = 'lastPageLoad=failed;expires=Fri, 31 Dec 9999 23:59:59 GMT';
    } else if (params.storeType === 'local_storage') {
        localStorage.setItem(params.keyPrefix + 'lastPageLoad', 'failed');
    }
}

//Initialize checkbox, radio and other values
document.getElementById('cssCacheModeCheck').checked = params.cssCache;
document.getElementById('imageDisplayModeCheck').checked = params.imageDisplay;
document.getElementById('removePageMaxWidthCheck').checked = params.removePageMaxWidth === true; // Will be false if false or auto
document.getElementById('removePageMaxWidthCheck').indeterminate = params.removePageMaxWidth == "auto";
document.getElementById('removePageMaxWidthCheck').readOnly = params.removePageMaxWidth == "auto";
document.getElementById('pageMaxWidthState').innerHTML = (params.removePageMaxWidth == "auto" ? "auto" : params.removePageMaxWidth ? "always" : "never");
document.getElementById('openAllSectionsCheck').checked = params.openAllSections;
document.getElementById('cssUIDarkThemeCheck').checked = params.cssUITheme == "dark"; // Will be true, or false if light or auto
document.getElementById('cssUIDarkThemeCheck').indeterminate = params.cssUITheme == "auto";
document.getElementById('cssUIDarkThemeCheck').readOnly = params.cssUITheme == "auto";
document.getElementById('cssUIDarkThemeState').innerHTML = params.cssUITheme;
document.getElementById('cssWikiDarkThemeCheck').checked = /dark|invert/.test(params.cssTheme);
document.getElementById('cssWikiDarkThemeCheck').indeterminate = params.cssTheme == "auto";
document.getElementById('cssWikiDarkThemeCheck').readOnly = params.cssTheme == "auto";
document.getElementById('cssWikiDarkThemeState').innerHTML = params.cssTheme;
document.getElementById('darkInvert').style.display = /dark|invert/i.test(params.cssTheme) ? "inline" : "none";
document.getElementById('cssWikiDarkThemeInvertCheck').checked = params.cssTheme == 'invert';
document.getElementById('useMathJaxRadio' + (params.useMathJax ? 'True' : 'False')).checked = true;
document.getElementById('rememberLastPageCheck').checked = params.rememberLastPage;
document.getElementById('displayFileSelectorsCheck').checked = params.showFileSelectors;
document.getElementById('hideActiveContentWarningCheck').checked = params.hideActiveContentWarning;
document.getElementById('allowHTMLExtractionCheck').checked = params.allowHTMLExtraction;
document.getElementById('alphaCharTxt').value = params.alphaChar;
document.getElementById('omegaCharTxt').value = params.omegaChar;
document.getElementById('maxResults').value = params.maxResults;
document.getElementById('hideToolbarsCheck').checked = params.hideToolbars === true; // Will be false if false or 'top'
document.getElementById('hideToolbarsCheck').indeterminate = params.hideToolbars === "top";
document.getElementById('hideToolbarsCheck').readOnly = params.hideToolbars === "top";
document.getElementById('hideToolbarsState').innerHTML = (params.hideToolbars === "top" ? "top" : params.hideToolbars ? "both" : "never");

//Set up storage types
if (params.storedFile && typeof Windows !== 'undefined' && typeof Windows.Storage !== 'undefined') { //UWP
    Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync(params.archivePath).done(function (folder) {
        params.localStorage = folder;
    }, function (err) {
        console.error("This app doesn't appear to have access to local storage!");
    });
    var futureAccessList = Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList;
    if (futureAccessList.containsItem(params.falFolderToken)) {
        futureAccessList.getFolderAsync(params.falFolderToken).done(function (folder) {
            params.pickedFolder = folder;
        }, function (err) {
            console.error("The previously picked folder is no longer accessible: " + err.message);
        });
    }
    //If we don't already have a picked file (e.g. by launching app with click on a ZIM file), then retrieve it from futureAccessList if possible
    var listOfArchives = getSetting('listOfArchives');
    // But don't get the picked file if we already have access to the folder and the file is in it!
    if (listOfArchives && ~listOfArchives.indexOf(params.storedFile) && params.pickedFolder) {
        params.pickedFile = '';
    } else {
        if (!params.pickedFile && futureAccessList.containsItem(params.falFileToken)) {
            params.pickedFile = '';
            futureAccessList.getFileAsync(params.falFileToken).done(function (file) {
                if (file.name === params.storedFile) params.pickedFile = file;
            }, function (err) {
                console.error("The previously picked file is no longer accessible: " + err.message);
            });
        }
    }
}

// Routine for installing the app adapted from https://pwa-workshop.js.org/

var deferredPrompt;
var divInstall1 = document.getElementById('divInstall1');
var btnInstall1 = document.getElementById('btnInstall1');
var divInstall2 = document.getElementById('divInstall2');
var btnInstall2 = document.getElementById('btnInstall2');
var btnLater = document.getElementById('btnLater');

window.addEventListener('beforeinstallprompt', function(e) {
    console.log('beforeinstallprompt fired');
    // Prevent Chrome 76 and earlier from automatically showing a prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Show the install buttons
    // Don't display prompt if the PWA for this version is already installed
    if (!params.beforeinstallpromptFired && params.PWAInstalled !== params.version) {
        params.beforeinstallpromptFired = true;
        var config = document.getElementById('configuration');
        btnInstall1.addEventListener('click', installApp);
        btnLater.addEventListener('click', function (e) {
            e.preventDefault();
            divInstall1.innerHTML = '<b>You can install this app later from Configuration</b>';
            setTimeout(function() {
                divInstall1.style.display = 'none';
            }, 4000);
            params.installLater = true;
        });
        divInstall2.style.display = 'block';
        btnInstall2.addEventListener('click', installApp);
    }
});

function installApp(e) {
    e.preventDefault();
    // Show the prompt
    deferredPrompt.prompt();
    btnInstall1.disabled = true;
    btnInstall2.disabled = true;
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
            console.log('PWA installation accepted');
            divInstall1.style.display = 'none';
            divInstall2.style.display = 'none';
        } else {
            console.log('PWA installation rejected');
        }
        btnInstall1.disabled = false;
        btnInstall2.disabled = false;
        deferredPrompt = null;
        params.beforeinstallpromptFired = false;
    });
}

window.addEventListener('appinstalled', function(e) {
    params.PWAInstalled = params.version;
    if (params.storeType === 'cookie') {
        document.cookie = 'PWAInstalled=' + encodeURIComponent(params.PWAInstalled) + ';expires=Fri, 31 Dec 9999 23:59:59 GMT';
    } else if (params.storeType === 'local_storage') {
        localStorage.setItem(params.keyPrefix + 'PWAInstalled', params.PWAInstalled);
    }
});

function getSetting(name) {
    var result;
    if (params.storeType === 'cookie') {
        var regexp = new RegExp('(?:^|;)\\s*' + name + '=([^;]+)(?:;|$)');
        result = document.cookie.match(regexp);
        result = result && result.length > 1 ? result[1] : null;
    } else if (params.storeType === 'local_storage') {
        // Use localStorage instead
        result = localStorage.getItem(params.keyPrefix + name);
    }
    return result === null || result === "undefined" ? null : result === "true" ? true : result === "false" ? false : result;
}

 // Tests for available Storage APIs (document.cookie or localStorage) and returns the best available of these
 // DEV: This function is replicated from settingsStore.js because RequireJS has not yet loaded it,
 // except that it returns 'cookie' if the always-present lastContentInjectionMode is still in cookie, which
 // means the store previously used cookies and hasn't upgraded yet: this won't be done till app.js is loaded
 function getBestAvailableStorageAPI() {
    var type = 'none';
    var localStorageTest;
    try {
      localStorageTest = 'localStorage' in window && window['localStorage'] !== null;
      if (localStorageTest) {
        localStorage.setItem('tempKiwixStorageTest', '');
        localStorage.removeItem('tempKiwixStorageTest');
      }
    } catch (e) {
      localStorageTest = false;
    }
    document.cookie = 'tempKiwixCookieTest=working; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=Strict';
    var kiwixCookieTest = /tempKiwixCookieTest=working/.test(document.cookie);
    document.cookie = 'tempKiwixCookieTest=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    if (kiwixCookieTest) type = 'cookie';
    if (localStorageTest && !/lastContentInjectionMode=(?:jquery|serviceworker)/.test(document.cookie)) type = 'local_storage';
    return type;
  }


require.config({
    //enforceDefine: true, //This is for debugging IE errors
    baseUrl: 'js/lib',
    config: { '../app': { params: params } },
    paths: {
        'jquery': 'jquery-3.2.1.slim',
        //'jquery': 'jquery-3.2.1',
        //'bootstrap': 'bootstrap'
        'bootstrap': 'bootstrap.min',
        'webpHeroBundle': 'webpHeroBundle_0.0.0-dev.27',
        'webpHeroPolyfills': 'webpHeroPolyfills_0.0.0-dev.27'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'webpHeroBundle': {
            deps: ['webpHeroPolyfills']
        }
    }
});

requirejs(['bootstrap'], function (bootstrap) {
    requirejs(['../app']);
});

// Load the WebP Polyfills only if needed
var webpMachine = false;
// Using self-invoking function to avoid defining global functions and variables
(function (callback) {
    // Tests for native WebP support
    var webP = new Image();
    webP.onload = webP.onerror = function () {
        callback(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
})(function (support) {
    if (!support) {
        webpMachine = true;
    }
});