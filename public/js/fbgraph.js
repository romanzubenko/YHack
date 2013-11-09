(function() {
//$(document).on('click',"#fbRegistration") {
  FB.init({
    appId      : '182257815299017', // App ID
    channelUrl : '//0.0.0.0:3000/channel.html', // Channel File
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });
  // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
  // for any authentication related change, such as login, logout or session refresh. This means that
  // whenever someone who was previously logged out tries to log in again, the correct case below
  // will be handled.
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    // Here we specify what we do with the response anytime this event occurs.
    if (response.status === 'connected') {
      // The response object is returned with a status field that lets the app know the current
      // login status of the person. In this case, we're handling the situation where they
      // have logged in to the app.
      //testAPI();
    } else if (response.status === 'not_authorized') {
      // In this case, the person is logged into Facebook, but not into the app, so we call
      // FB.login() to prompt them to do so.
      // In real-life usage, you wouldn't want to immediately prompt someone to login
      // like this, for two reasons:
      // (1) JavaScript created popup windows are blocked by most browsers unless they
      // result from direct interaction from people using the app (such as a mouse click)
      // (2) it is a bad experience to be continually prompted to login upon page load.
      //FB.login();
      FB.login(function(response) {},{scope: 'read_mailbox'});
      //FB.login(cb, { scope: 'email' });
    } else {
      // In this case, the person is not logged into Facebook, so we call the login()
      // function to prompt them to do so. Note that at this stage there is no indication
      // of whether they are logged into the app. If they aren't then they'll see the Login
      // dialog right after they log in to Facebook.
      // The same caveats as above apply to the FB.login() call here.
      //FB.login();
      FB.login(function(response) {},{scope: 'read_mailbox'});
      //FB.login(cb, { scope: 'email' });
    }
  });
})();

  // Load the SDK asynchronously
  (function(d){
   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "//connect.facebook.net/en_US/all.js";
   ref.parentNode.insertBefore(js, ref);
  }(document));

  // Here we run a very simple test of the Graph API after login is successful.
  // This testAPI() function is only called in those cases.
  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Good to see you, ' + response.name + '.');
    });
  }

  function testMe(){
    // remove icon change it to loading bar
    window.lang = $($("#nl-form").find("select")).val();

    $("#nl-form").remove();
    $("#sig").show();
    $("#sig").css("visibility","visible");
    $("#list").show().css("visibility","visible");
    $(".topspace, .main").hide(200);





    //FB.login();
    console.log('log')
    FB.login(function(response) {
      if (response.authResponse) {
      var access_token = FB.getAuthResponse()['accessToken'];
      FB.api('/me/inbox', function(response) {
        //console.log('Good to see you, ' + response + '.');
        console.log(response.data);
        var messages = response.data;
        userdata = 'test';
        //messages[0].comments.data[0].message
        //console.log(userdata.toString())
        //console.log(userdata)

        for (var key in messages){
          //console.log(messages[key].comments.data[0].message);
          var tmp = messages[key].comments.data;
          for (var key1 in tmp){
            userdata = userdata + tmp[key1].message;
          }
          //userdata = userdata + messages[key].comments.data[0].message

        }
        console.log(userdata)
        window.socket.emit('fbUserData', userdata);
        //FB.logout()
        //return userdata
/*
        http.get("https://graph.facebook.com/me/inbox", function(res) {
          console.log("Got response: " + res.statusCode);
        }).on('error', function(e) {
          console.log("Got error: " + e.message);
        });*/
        //FB.logout();

      // $(document).on('click',"#submitRegistration",function(e){
      // var form = $('#registration'),
      // req = {};
      // req['display_name'] = $(form.find("input")[0]).val();
      // req['name'] = $(form.find("input")[1]).val();
      // req['email'] = $(form.find("input")[2]).val();
      // req['password'] = $(form.find("input")[3]).val();

      // console.log(req);
      // $(this).html("Please Wait...");
      // socket.emit('register',req);
      // });
      });
      }
    },{scope: 'read_mailbox'});
    //extendedprem();
  }
  /*function extendedprem(){
    FB.api('/me', function(response) {
      alert('Your name is ' + response.name);
    });*/


$(document).on('click',"#fbgraph",testMe);


