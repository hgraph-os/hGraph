/*
File: hUsers.js

Description:
    Devises a multiuser environment. This includes user selection, menus and calling
    hGraph drawing routines

Requires:
    d3.js
    hammer.js
    mustache.js

Authors:
    Michael Bester <michael@kimili.com>
    Ivan DiLernia <ivan@goinvo.com>
    Danny Hadley <danny@goinvo.com>
    Matt Madonna <matthew@myimedia.com>

License:
    Copyright 2012, Involution Studios <http://goinvo.com>

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// multiuser example namespace
var mu = mu  || {};

mu.users = function(){

var usermenu,       // user selection menu bar
    users,          // user data
    userinfo,       // user information bar
    usertimeline,   // user timeline document
    selected;       // currently selected user




initialize = function(opts){

    usermenu = opts.usermenu || null;
    users = opts.users || null;
    userinfo = opts.userinfo || null;
    transitionTime = 300;             // transition time
    transitionDelayTime = 200;        // transition delay

    var self = this;

    /*
    * Loads user.json which contains user names, ids, and descriptions
    * Example data:
    * [
    *   {
    *      "name":"Juhan Sonin",
    *      "id":"sonin_juhan",
    *      "intro":"41yo Male"
    *   },
    *   {
    *       "name":"Kate Sonin",
    *   ...
    */
    d3.json("data/users.json", function(json, error) {
        if (error) return;
        users = json;

        // render user menu
        usermenu.html(Mustache.render($('#user-menu-template').html(), json));
        // center user images
        $('.user').center();
        // enable click and touch actions
        $('.user').click(function(){
            selectUser($(this).attr('uid'));
            showUserMenu();
        });
        $(".user").bind('touchstart', function(e) {
            selectUser($(this).attr('uid'));
            showUserMenu();
        });
        // load first user in menu
        $('.user').first().trigger('click');
        $('.hline').height(userinfo.height()*0.75);

    });
},

/*
* Initializes user context give user id
*
* uid - (*string*) user id
*/
selectUser = function(uid){
    for(var i=0; i<users.length; i++) {
        if(uid === users[i].id) {
            initializeUser(users[i]);
            return;
        }
    }
},

/*
* Brings timeline in user context
*/
showTimeline = function(){
    // enable scrolling on touch devices
    //document.ontouchmove = function(e){ return true; }
    usertimeline.active = true;
    //center timeline horizontally
    usertimeline.css({ left : (userinfo.width() - usertimeline.width()) / 2  });
    // hides user menu as the window is now scrollable
    hideUserMenu(function(){
        usermenu.hide();
    });
    usertimeline.fadeIn();

}

/*
* Hides timeline from user context
*/
hideTimeline = function(user){
    // disable scrolling on touch devices
    //document.ontouchmove = function(e){ e.preventDefault(); }
    usertimeline.active = false;
    usertimeline.fadeOut();
    showUserMenu();

}

/*
* Initializes user context (user information bar, timeline and hGraph)
*
* user - (object)
* Example structure:
* 
* {
*      "name":"Juhan Sonin",
*      "id":"sonin_juhan",
*      "intro":"41yo Male"
* }
*
*/
initializeUser = function(user) {

    // initializes user information section
    function initUserinfo(user){

        // timeline toggled
        function timelineclick(e){
            e.preventDefault();
            if(!usertimeline.active) showTimeline();
            else hideTimeline();
        }

        // render user information div
        userinfo.html(Mustache.render($('#user-info-template').html(), user));
        usertimeline = userinfo.find('#user-timeline');
        usertimeline.active = false;
        // approximate horizontal bar positioning

        // enable timeline toggling
        userinfo.find('.user').unbind();
        userinfo.find('.user').click(timelineclick);
        userinfo.find('.user').bind('touchstart', timelineclick);

        var selected = $('.user[uid*="' + user.id + '"]').addClass('selected');
        return selected;
    }

    // switches active user
    function switchUser(user){
        selected.removeClass('selected');
        // transition to new user data
        hideUserInfo(false, function(){
            selected = initUserinfo(user);
            showUserInfo();
        });
    }

    // return if selected is active
    if(selected && selected.attr('uid') === user.id){
        return
    }
    // play transition when switching users
    else if(selected) {
        switchUser(user);
    // don't play transitions on first page load
    } else {
        selected = initUserinfo(user);
    }

    // loads user json datafile
    d3.json("data/user-data/" + user.id + ".json", function(json, error) {
        if (error) return;
        // converts the data to a hGraph friendly format
        var dataPoints = mu.data.process(json);
        // renders hGraph
        renderHgraph(dataPoints);
    });

},

/*
* Hides user information from window
*/
hideUserInfo = function(hideline, callback) {
    if(hideline === undefined) hideline=true;
    userinfo.animate({top : -$(userinfo).outerHeight() - 15}, transitionTime, callback);
    if(hideline) $('.hline').hide();
},

/*
* Shows user information (Image, name and short description) in window
*/
showUserInfo = function() {
    userinfo.delay(transitionDelayTime).animate({top : 0}, transitionTime);
    $('.hline').fadeIn(500);
},


/*
* Shows user menu in window
*/
showUserMenu = function() {
    usermenu.show();
    usermenu.animate({bottom : '0'}, transitionTime);

},

/*
* Hides user menu from window
*
* callback - (*function*) optional callback
*/
hideUserMenu = function(callback){
    usermenu.animate({bottom : -$(usermenu).outerHeight() - 15}, transitionTime, callback);
    usermenu.hide();

},

/*
* Hides user menu and information from window
*/
hide = function(){
    hideUserMenu();
    hideUserInfo();

},

/*
* Shows user menu and informatio in window
*/
show = function(){
    showUserMenu();
    showUserInfo();

    // solves glitch while resizing window on a zoomed hGraph
    window.setTimeout(function(){
        resize();
    }, 500);
};

return{
       initialize : initialize,
       show : show,
       hide : hide,
       hideUserInfo : hideUserInfo
   }
}();