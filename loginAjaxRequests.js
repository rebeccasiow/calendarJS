function loginRequest(username, password){

    $.ajax({                                      
      url: 'loginUser.php',  	  //the script to call to get data 
	  
      data: {
		type: "login",
      	username: username,
      	password: password
      },                       
                                      
      dataType: 'json',     
	  
      type: "POST", 
	  
      success: function(json)          
      {
        //var username = data.username;              //get username
     	if(json.hasOwnProperty("success")){
			if(json.success === true) {
				$("#usernameinfo").text("You are now logged in," + username);
				
				// Update message on top (change to welcome message with visible logout link)
				$("#userMessage").text("Welcome, " + username + "!");
				$("#logoutButton").attr("class","visibleButton");
				
				// store our CSRF token
				token = json.token;
				
				writeMonthToCalendar(m);
				ajaxGetEvents(m); // now that we're in, load our events
			}
			else {
				$('#usernameinfo').text("login failed. Message: " + json.message); 
			}
		}
	}		
	  
    });
}

function registrationRequest(username, password){

    $.ajax({                                      
      url: 'register.php',  	  //the script to call to get data 
	  
      data: {
      	username: username,
      	password: password
      },                       
                                      
      dataType: 'json',     
	  
      type: "POST", 
	  
      success: function(json)          
      {
        //var username = data.username;              //get username
     	if(!json.hasOwnProperty("success")){
     		$("#usernameinfo").text("Username Taken!");

     	}
        else {
			$('#usernameinfo').text("You have registered with username: "+username); 
			
			// Update message on top (change to welcome message with visible logout link)
			$("#userMessage").text("Welcome, " + username + "!");
			$("#logoutButton").attr("class","visibleButton");
			
			// store our CSRF token
			token = json.token;
			
			writeMonthToCalendar(m);
			ajaxGetEvents(m); // now that we're in, load our events
      	}
      }
	});
}

function logoutRequest(){

    $.ajax({                                      
      url: 'loginUser.php',  	  //the script to call to get data 
	  
      data: {
      	type: "logout"
      },                       
                                      
      dataType: 'json',     
	  
      type: "POST", 
	  
      success: function(json)          
      {
		if(json.hasOwnProperty("success")) {
			if(json.success === true){
				$("#usernameinfo").text("Logout successful");
				
				// Update message on top (change to inviting them to login and logout link is hidden)
				$("#userMessage").text("You are not signed in. Sign in or register below!");
				$("#logoutButton").attr("class","hiddenButton");
				
				writeMonthToCalendar(m);
				ajaxGetEvents(m); // now that we're out, load our (lack of) events
			}
			
			else {
				$('#usernameinfo').text("Logout Failed! Message: " + json.message); 
			}
		}
      } 
	  
    });
}