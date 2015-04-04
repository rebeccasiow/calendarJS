/** Re-add the event dialog action to all events (since we just made new tags of the class).
 * Probably in real life this is a memory leak or something equally undesirable.
 */
function setUpEventDialogs() {
    $("[class='eventNameLabel']").click(function(event)
    {
        var id = event.target.id.slice(5); // the event id # starts in id[5] (prefixed with "event")
        buildEventDialog(id)
        $("#eventDialog").dialog();
    });
}

/** set up the event dialog for modifying an event or creating a new one. If id is a number, it
 * is the id number of the event that we want to set up to modify. If it is the string "create",
 * we're trying to create a completely new event (show blank fields)
 */
function buildEventDialog(id) {
    var eDialog = document.getElementById("eventDialog");
    
    // All the parts of the dialog box which we'll be changing (in the same order as in the html)
    var debugTextSpan = $("#eventDialogDebugText");
    var eventNameInput = $("#eventDialogName");
    var eventLocationInput = $("#eventDialogLocation");
    var eventDateInput = $("#eventDialogDate");
    var eventTimeInput = $("#eventDialogTime");
    var eventSubmitButton = $("#eventDialogSubmit");
    var eventResultsTextSpan = $("#eventDialogResultsText");
    var eventDeleteButton = $("#eventDialogDelete");
    
    if (id=="create") { // creating an event: give user a blank slate
        
        debugTextSpan.text("You are creating an event");
        
        eventNameInput.val("");
        eventLocationInput.val("");
        eventDateInput.val("");
        eventTimeInput.val("");
        
        eventSubmitButton.val("Create"); // Button has appropriate name for current task
        eventDeleteButton.attr("class","hiddenButton"); // Delete button unnecessary in this view
        eventResultsTextSpan.text(""); // remove anything that might have been in here before
        
    } else { // we are modifying an event: set up boxes with the current values
        // get the event's info from our global list
        var event = $.grep(eventList,function(ev){return ev.id==id;})[0];
        
        debugTextSpan.text("You clicked on event with id=" + id);
        
        eventNameInput.val(event.name);
        eventLocationInput.val(event.location);
        eventDateInput.val(event.date);
        eventTimeInput.val(event.time);
        
        eventSubmitButton.val("Modify"); // Button has appropriate name for current task
        eventDeleteButton.attr("class","shownButton"); // Delete button is necessary: this class (not mentioned elsewhere) will make sure that it appears
        eventResultsTextSpan.text(""); // remove anything that might have been in here before
    }
    
    // Set up the submit button to do the appropriate submit-y thing
    
    eventSubmitButton.off('click'); // Remove any previous handlers
    eventSubmitButton.click(function(e){
        var newName = eventNameInput.val();
        var newLoc = eventLocationInput.val();
        var newDate = eventDateInput.val();
        var newTime = eventTimeInput.val();
        
        if (id=="create") { // creating event
            
            ajaxCreateEvent(newDate,newTime,newName,newLoc);
            
        } else { // modifying event
            
            ajaxModifyEvent(id,{name: newName, location: newLoc, date: newDate, time: newTime});
            
        }
    });
    
    
    // Set up the delete button so it can delete whichever event we looked at last
    eventDeleteButton.off('click'); // Remove any previous handlers
    eventDeleteButton.click(function(e){
        
        ajaxDeleteEvent(id);
        
    })
}