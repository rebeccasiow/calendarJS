"use strict";

function writeMonthToCalendar(month) {

    // remove all rows currently in table
    var calendarBody = document.getElementById("calendarbody");
    removeAllChildren(calendarBody);
    
    
    // repopulate the row with the days of the week listed
    var weekLabels = document.createElement("tr");
    
    function getTdNodeWithString(str) {
        var tdEl = document.createElement("td");
        tdEl.appendChild(document.createTextNode(str));
        tdEl.setAttribute("class","heading");
        return tdEl;
    }
    
    weekLabels.appendChild(getTdNodeWithString("Sunday"));
    weekLabels.appendChild(getTdNodeWithString("Monday"));
    weekLabels.appendChild(getTdNodeWithString("Tuesday"));
    weekLabels.appendChild(getTdNodeWithString("Wednesday"));
    weekLabels.appendChild(getTdNodeWithString("Thursday"));
    weekLabels.appendChild(getTdNodeWithString("Friday"));
    weekLabels.appendChild(getTdNodeWithString("Saturday"));
    calendarBody.appendChild(weekLabels);
    
    // add rows to the table for the given month
    var weeks = month.getWeeks();
    weeks.forEach(function(week) {
        // make a calendar week (row) and add it to the table
        var weekRow =  document.createElement("tr");
        
        week.getDates().forEach(function(day) {
            // make a table cell for the date and add it to the row
            var dayBox = document.createElement("td");
            dayBox.appendChild(document.createTextNode(day.getDate()));
            
            // assign this td an id that allows us to find it when looking for a certain day&month (for attaching objects later)
            dayBox.setAttribute("id",getDateSquareID(day));
            
            weekRow.appendChild(dayBox);
        });
        
        calendarBody.appendChild(weekRow);
    });
}

function displayEvents(events) {
    
    events.forEach(function(e) {
        var id = e.id;
        var name = e.name;
        var timeStr = e.time;
        var dateObj = mysqlDateToDateObject(e.date);
        
        var squareId = getDateSquareID(dateObj);
        
        var dayBox = document.getElementById(squareId);
        
        // Another safety: events that don't belong in any existing box will not cause error
        if (dayBox !== null) {
            
            // build a <span> element with the name of the class in it, and then append it after a line break
            var eventText = document.createElement("span");
            eventText.setAttribute("class","eventNameLabel"); // class for clickable events (brings up dialog w/ info and editting)
            eventText.setAttribute("id","event"+id);
            
            eventText.appendChild(document.createElement("br"));
            eventText.appendChild(document.createTextNode(name));
            
            dayBox.appendChild(eventText);
        }
    });
    
    setUpEventDialogs(); // add the event-popup event for all the damn events we just made

}