//require("http://ajax.googleapis.com/ajax/libs/jquery/x.x.x/jquery.min.js");

/** Requests an array of JSON events from the server
    given a month, and calls display functions to put them on the page
*/
function ajaxGetEvents(month) {
    // make start- and end-date values 
    Array.prototype.getLastEl = function() {
        return this.slice(-1)[0];
    }
    var startDate = month.getWeeks()[0].getDates()[0];
    var endDate = month.getWeeks().getLastEl().getDates().getLastEl();
    
    var events;
    
    $.ajax({
        url: "processEvent.php",
        
        data: {
            mode: "view", // request list of events
            start: toMysqlDate(startDate),
            end: toMysqlDate(endDate),
			token: token // pass in global CSRF token
        },
        
        type: "POST",
        
        dataType : "json",
        
        success: function(json) {
            events = json;
            displayEvents(events);
            
            eventList = events; // our exposed global
        }
    });
    
    return events;
}

/** Given date & time strings, a name, and optionally a
 * location, sends server an ajax request to create an event
 * with those properties for the current user
*/
function ajaxCreateEvent(date,time,name,location) {
    //var mysqlDate = toMysqlDate(date);
    //var mysqlTime = toMysqlTime(date);
    
    $.ajax({
        url: "processEvent.php",
        
        data: {
            mode: "create", // send an event to be added to database
            //date: mysqlDate,
            //time: mysqlTime,
            date: date,
            time: time,
            name: name,
            location: location,
			token: token // pass in global CSRF token
        },
        
        type: "POST",
        
        dataType : "json",
        
        success: function(json) {
            // check value of "success" property to determine action
            if (!json.hasOwnProperty("success")) {
                $("#eventDialogResultsText").text("The request did not return a success value... (fix, devs!)");
            } else {
                if (json.success) { // request returns good: event is now in system
                    // show the event on our local calendar, too
                    // (we extract the id from the response-json)
                    var newEvent = {name: name, location: location, time: time, date: date, id: json.id};
                    displayEvents([newEvent]);
                    eventList.push(newEvent);
                    
                    $("#eventDialogResultsText").text("Success! The event was added to your calendar");
                } else {
                    $("#eventDialogResultsText").text("Request failed: " + json.message);
                }
            }
        }
    });
}

/** Given an event id, tells server that we want it gone
*/
function ajaxDeleteEvent(id) {
    $.ajax({
        url: "processEvent.php",
        
        data: {
            mode: "delete",
            id: id,
			token: token // pass in global CSRF token
        },
        
        type: "POST",
        
        dataType : "json",
        
        success: function(json) {
            if (!json.hasOwnProperty("success")) {
                $("#eventDialogResultsText").text("The request did not return a success value... (fix, devs!)");
            } else {
                if (json.success) { // request returns good: event is now in system
                    // remove the event's element on the calendar
                    $("#event"+id).remove();
                    
                    /* NOTE: the event is still present in eventList array,
                     * but this isn't a big deal: it is inaccessible, and
                     * will be out of the list as soon as the user refreshes
                     * or changes the month view
                     */
                    
                    $("#eventDialogResultsText").text("Success! The event was deleted from your calendar");
                } else {
                    $("#eventDialogResultsText").text("Request failed: " + json.message);
                }
            }
        }
    });
}

/** Given an event id and a properties object that may contain
 * a new "date" & "time",
 * "name", and/or "location" (strings), converts these properties
 * for sending off to the server in a modification request.
*/
function ajaxModifyEvent(id,properties) {
    var propertiesFormatted = properties;
    
    // Add the additional info the server will need when it makes this request
    propertiesFormatted.mode = "modify";
    propertiesFormatted.id = id;
	propertiesFormatted.token = token;// pass in our global CSRF token
    
    // and we'll just assume that location and/or name are in there if the user wants them to be
    
    $.ajax({
        url: "processEvent.php",
        
        data: propertiesFormatted,
        
        type: "POST",
        
        dataType : "json",
        
        success: function(json) {
            if (!json.hasOwnProperty("success")) {
                $("#eventDialogResultsText").text("The request did not return a success value... (fix, devs!)");
            } else {
                if (json.success) { // request returns good: event is now changed in system
                    
                    // We want to modify the properties of this event in eventList
                    var event = $.grep(eventList,function(ev){return ev.id==id;})[0];
                    var pos = eventList.indexOf(event);
                    
                    // update the event's internal fields
                    if(properties.name!=undefined) { eventList[pos].name = properties.name; }
                    if(properties.location!=undefined) { eventList[pos].location = properties.location; }
                    if(properties.time!=undefined) { eventList[pos].time = properties.time; }
                    if(properties.date!=undefined) { eventList[pos].date = properties.date; }
                    
                    // delete current display & make a new (which will in the function also be given a click handler)
                    $("#event" + id).remove();
                    displayEvents([eventList[pos]]);
                    
                    $("#eventDialogResultsText").text("Success! The event was modified");
                } else {
                    $("#eventDialogResultsText").text("Request failed: " + json.message);
                }
            }
        }
    });
}