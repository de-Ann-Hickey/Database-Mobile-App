// Must have this event listener for the Cordova code to work.
// It listens for the event 'device ready' to confirm the app infrastructure has loaded.
document.addEventListener("deviceready", onDeviceReady, false);

// Define the onDeviceReady function, where all our future code needs to be.
function onDeviceReady() {
  console.log("Device Ready!");

// ----------------Variables-------------- (go at the top)
// Objects for the sign up, log in, log out buttons
// $ for a jQuery powered Variable (Object)
// el representing an HTML Element
const $elFmSignUp = $("#formSignUp"),
      $elFmLogIn = $("#formLogin"),
      $elBtnLogOut = $("#btnLogOut"),
      $elFmSaveComic = $("#formSaveComic"),
      $elBtnDeleteCollection = $("#btnDeleteCollection");
      $elBtnDeleteCollection2 = $("#btnDeleteCollection2");

// Var to keep track of who is logged in
let uid = localStorage.getItem("whoIsLoggedIn");
// var to keep track of which comic to update
let comicWIP = "";
// Var for strong password, based on regEx
let strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$\^&\*])(?=.{7,})");
// create a variable not assigned to anything yet for DB
let myComicsDB;

// Auto-login code
// function to initialize a DB per user
function fnInitDB() {
  console.log("fnInitDB is running");
  // Read whoIsLoggedIn to get their email. UID won't work when app is brand new
  let emailForDB = localStorage.getItem("whoIsLoggedIn");
  // Pouch DB is smart enough to either load or create a DB
  myComicsDB = new PouchDB(emailForDB);
  // return the initialized DB to the rest of the app
  return myComicsDB;
} // End fnInitDB()

if(uid === "" || uid === null || uid === undefined) {
  console.log("No one is logged in, keep them at welcome page");
} else {
  console.log("Someone last logged in. Move them to home page" + uid);
 // Move them to the homepage
 $(":mobile-pagecontainer").pagecontainer("change", "#homePage");
 $(".userEmail").html(uid);
 // Initialize DB for user
 fnInitDB();
} // End If-Else

// ----------------Functions-------------- (go in the middle)
function fnSignUp(event) {
  // Stop the refresh - don't kick us out of the app
  event.preventDefault();
  console.log("fnSignUp(event) is running");
  // Object to read inputs in the form
  let $elInEmailSignUp = $("#signUpInputEmail"),
      $elInPasswordSignUp = $("#signUpInputPassword"),
      $elInPasswordConfirmSignUp = $("#confirmPassword");

  // Check to see if password is strong enough
  if (strongPassword.test($elInPasswordSignUp.val())) {
    console.log("Password is strong enough");

  // Conditional Statement to check if password matches and account exists
  if ($elInPasswordSignUp.val() != $elInPasswordConfirmSignUp.val()) {
    console.log("Passwords do not match!");
    // On-screen popup for the user
    window.alert("Passwords do not match!");
    // Clear the Password <inputs> so they can try again
    $elInPasswordSignUp.val("");
    $elInPasswordConfirmSignUp.val("");
  } else {
    console.log("Passwords DO match");
    // Read the values of the email and password fields to check if account already exists
    // Note: the email is UPPERCASED so there is no problem in the future
    let $tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(), 
        $tmpValInPasswordSignup = $elInPasswordSignUp.val();

    // Conditional statement to confirm if account has been saved to localStorage or not
    if (localStorage.getItem($tmpValInEmailSignUp) == null) {
      console.log("New user detected");
      localStorage.setItem($tmpValInEmailSignUp, $tmpValInPasswordSignup);
      window.alert("Welcome new user!");
      // Then clear the form for a new user
      $elFmSignUp[0].reset();
      console.log("User saved: " + $tmpValInEmailSignUp);
    } else {
      console.log("Returning user");
      window.alert("Account already exists");
    } // End User check
  } // END Password check
  } else {
    console.log("Password is weak");
    window.alert("Password should be 7 characters, uppercase and lowercase letters.");
    $elInPasswordSignUp.val("");
    $elInPasswordConfirmSignUp.val("");
  } // END password strength check

}  // END fnSignup(event)

// Function for Log In subroutine 
function fnLogIn(event) {
  event.preventDefault();
  console.log("fnLogIn(event) is running");
  // Objects for Email & Password, plus their Values
  let $elInEmailLogIn = $("#inputEmailLogIn"),
      $elInPasswordLogIn = $("#inputPasswordLogIn"),
      $tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
      $tmpValInPasswordLogIn = $elInPasswordLogIn.val();
  
  // Conditional Statement to check if account exists or not
  if(localStorage.getItem($tmpValInEmailLogIn) === null) { 
    console.log("Account doesn't exist");
    window.alert("Account doesn't exist");
  } else {
    console.log("Accound DOES exist");

    // Conditional Statement to check if the current password matches saved password
    if($tmpValInPasswordLogIn === localStorage.getItem($tmpValInEmailLogIn)) { 
      console.log("Passwords DO match");
      // Move them from current screen to a new screen/set whoIsLoggedIn for auto-login
      $(":mobile-pagecontainer").pagecontainer("change", "#homePage");
      // Write their email on screen
      $(".userEmail").html(uid);
      localStorage.setItem("whoIsLoggedIn", $tmpValInEmailLogIn);
      console.log("Moved to #homePage as " + $tmpValInEmailLogIn);
      // Initialize DB
      fnInitDB();
      // Load current set of comics
    } else {
      console.log("Wrong password!");
      window.alert("Wrong password!");
      $elInPasswordLogIn.val("");
    } // END password check
  } // END check for account
} // END fnLogIn(event)

// Function for Logging Out
function fnLogOut() {
  console.log("fnLogOut() is running");

  // Conditional Statement (a Switch) to confirm if they really want to log out
  switch(window.confirm("Do you want to log out?")) {
    case true:
      console.log("User logged out");
      $elFmSignUp[0].reset();
      $elFmLogIn[0].reset();
      $(":mobile-pagecontainer").pagecontainer("change", "#welcomePage");
      localStorage.setItem("whoIsLoggedIn", "");
      break;
    case false:
      console.log("User does not want to log out");
      break;
    case "Admin":
      console.log("Hello admin!");
      break;
    default:
      console.log("Unkown error");
      break;
  } // END switch to log out
} // END fnLogOut()


// Function to prepare the comic data before saving
function fnPrepComic() {
  console.log("fnPrepComic() is running");

  let $valInTitleSave = $("#inputTitleSave").val(),
      $valInNumberSave = $("#inputNumberSave").val(),
      $valInYearSave = $("#inputYearSave").val(),
      $valInPublisherSave = $("#inputPublisherSave").val(),
      $valInNotesSave = $("#inputNotesSave").val();

// JSON data variables
  let tmpComic = {
    "_id" : $valInTitleSave.replace(/\W/g,"") + $valInYearSave + $valInNumberSave,
    "title" : $valInTitleSave,
    "number" : $valInNumberSave,
    "year" : $valInYearSave,
    "publisher" : $valInPublisherSave,
    "notes" : $valInNotesSave
  }; //End JSON data

  // After, return the bundle of data for further use
  return tmpComic;

} // End fnPrepComic()

// Function to save a comic
function fnSaveComic(event) {
  event.preventDefault();
  console.log("fnSaveComic() is running");

  // Run the function to get and prepare the data
  let aComic = fnPrepComic();

// Attempt to save the data to the DB
myComicsDB.put(aComic, function(failure, success){
  if(failure) {
    console.log("Error: " + failure.message);
    window.alert("Comic already saved!");
  } else {
    console.log("Saved the comic: " + success.ok);
    window.alert("Comic saved!");
    // Clear the form
    $elFmSaveComic[0].reset();
    fnViewComics();
  } // End If..Else fail/success
}); // End .put()
} // End fnSaveComic()

// Fucntion to view Database
function fnViewComics() {
  console.log("fnViewComics() is running");
  myComicsDB.allDocs( {"ascending":true, "include_docs":true},
  function(failure, success){
    if(failure) {
      console.log("Failure retrieving data: " + failure);
    } else {
      console.log("Success, there is data: " + success);
      // if/else for data checking
      if(success.rows[0] === undefined) {
        $("#divViewComics").html("No comics saved yet");
      } else {
        console.log("Number of comics to display: " + success.rows.length);

        // create variable to store the table that will be displayed. the first line is the heading info
        let comicData = "<table> <tr> <th>Title</th> <th>#</th> <th>Year</th> <th>Pub</th> <th>Notes</th> </tr>";
        // iterate through all comics
        for(let i = 0; i < success.rows.length; i++) {
          comicData+= "<tr class='btnShowComicInfo' id='" + success.rows[i].doc._id + "'> <td>" 
          + success.rows[i].doc.title +
          "</td><td>" + success.rows[i].doc.number + 
          "</td><td>" + success.rows[i].doc.year + 
          "</td><td>" + success.rows[i].doc.publisher + 
          "</td><td>" + success.rows[i].doc.notes + 
          "</td></tr>";
        } // End for loop
        comicData += "</table>";

        // takes all the information stored in the comicData variable and displays it on-screen, in the waiting <div> element.
        $("#divViewComics").html(comicData);
      } // End if/else for data checking
  } // End if/else for allDocs()
  }); // End .allDocs()
} // End fn fnViewComics()
fnViewComics();

// function to edit comics
function fnEditComic(thisComic) {
  console.log("fnEditComic() is running: " + thisComic.context.id);
  // function to detect which row was tapped, loads the data
  myComicsDB.get(thisComic.context.id, function(failure, success){ 
    if(failure) {    
      console.log("Error getting the comic: " + failure.message);  
    } else { 
      console.log("Success getting the comic: " + success.title + success._rev);    
      $("#inTitleEdit").val(success.title);    
      $("#inNumberEdit").val(success.number);    
      $("#inYearEdit").val(success.year);    
      $("#inPublisherEdit").val(success.publisher);    
      $("#inNotesEdit").val(success.notes);    
      comicWIP = success._id;  
    } // END If/Else .get()
  }) // END .get()
  $(":mobile-pagecontainer").pagecontainer("change", "#pgComicViewEdit", {"role":"dialog"});
} // End fnEditComic(thisComic)

// function for the cancel button in the edit view
function fnEditComicCancel() {  
  console.log("fnEditComicCancel() is running");  
  $("#pgComicViewEdit").dialog("close");
} // END fnEditComicCancel()

function fnEditComicConfirm(event) {  
    event.preventDefault();  
    console.log("fnEditComicConfirm() is running with " + comicWIP);
    // This code re-reads the edit fields and confirms the comic about to be updated exists.
    let $valInTitleEdit = $("#inTitleEdit").val(),
        $valInNumberEdit = $("#inNumberEdit").val(),  
        $valInYearEdit = $("#inYearEdit").val(),  
        $valInPublisherEdit = $("#inPublisherEdit").val(),  
        $valInNotesEdit = $("#inNotesEdit").val();
    myComicsDB.get(comicWIP, function(failure, success){  
      if(failure) {    
        console.log("Error: " + failure.message);  
        } else {    
          console.log("About to update " + success._id);
          // This code re-reads the edit fields and re-inserts them into the DB
          myComicsDB.put({
          "_id": success._id, "_rev": success._rev, "title": $valInTitleEdit,
          "number": $valInNumberEdit, "year": $valInYearEdit, "publisher":
          $valInPublisherEdit, "notes": $valInNotesEdit}, function(failure, success){
          if(failure){
            console.log("Error: " + failure.message);
          } else {
            console.log("Updated comic: " + success.id);
            fnViewComics();
            $("#pgComicViewEdit").dialog("close");
          } // End if/else .put()
          }) // End .put()
        } // END If/Else .get()
    }); // END .get()
} // END fnEditComicConfirm(event)

// Function to delete just one entry
function fnEditComicDelete() {
  console.log("fnEditComicDelete() is running"); 
  myComicsDB.get(comicWIP, function(failure, success){      
    if(failure) {        
      console.log("Error: " + failure.message);
      } else {        
        console.log("Deleting: " + success._id);
        if(window.confirm("Are you sure you want to delete the comic?")) {
          console.log("Confirmed deletion");
          myComicsDB.remove(success, function(failure,success){
            if(failure) {
              console.log("Couldn't delete: " + failure.message);
            } else {
              console.log("Deleted comic: " + success.ok);
              fnViewComics();
              $("#pgComicViewEdit").dialog("close");
            } // End if/else .remove()
          }) // End .remove()
        } // if/else confirm
    } // END If/Else .get()    
  }); // END .get()
}// END fnEditComicDelete()

// function to delete collection
function fnDeleteCollection() {
  console.log("fnDeleteCollection() is running");
  if(window.confirm("Are you sure you want to delete the whole collection?")) {
    console.log("They want to delete the collection");
    if(window.confirm("Are you sure? There is NO undo!")) {
      console.log("They have chosen again to delete");
      // After two confirmations, the method to destroy (delete) the database is straightforward, and includes error-checking code, reinitialization of the database, plus a refresh of the data on-screen.
      myComicsDB.destroy(function(failure, success){
        if(failure) {       
          console.log("Error in deleting database: " + failure.message);     
        } else {      
          console.log("Database deleted: " + success.ok);       
          fnInitDB();      
          fnViewComics();
          window.alert("All comics are gone!");     
        } // END If/Else of .destroy() 
      }) //END .destroy()
    } else {
      console.log("They changed their mind");
    } // End second if/else confirmation

  } else {
    console.log("They chose not to delete the collection");
  } // End first if/else confirmation
} // End fnDeleteCollection()

// ----------------Event Listeners-------------- (go at the end)
// Event listeners to wait for interaction with objects
$elFmSignUp.submit(function(){ fnSignUp(event); });
$elFmLogIn.submit(function(){ fnLogIn(event); });
// Note how the EL for the simple button does not need to capture the event (to prevent refresh)
$elBtnLogOut.on("click", fnLogOut);
// I put 2 delete collection buttons, one on viewComic page, and one in options box
$elBtnDeleteCollection.on("click", fnDeleteCollection);
$elBtnDeleteCollection2.on("click", fnDeleteCollection);
$elFmSaveComic.submit(function(){ fnSaveComic(event); });
$("#divViewComics").on("click", "tr.btnShowComicInfo",function(){fnEditComic( $(this) )});
$("#fmEditComicInfo").submit(function(event){fnEditComicConfirm(event);});
$("#btnEditComicCancel").on("click", fnEditComicCancel);
$("#btnDeleteComic").on("click", fnEditComicDelete);
}