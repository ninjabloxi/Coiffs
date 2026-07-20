//------------------//
// API
//------------------//


const API_URL =

"/api";




//------------------//
// REQUÊTES
//------------------//


async function sendRequest(


action,
data = {}


){


try{


const response =

await fetch(


API_URL,


{


method:

"POST",


headers:{


"Content-Type":

"application/json"


},


body:

JSON.stringify({


action,
data


})


}


);



return await response.json();


}


catch(error){


console.error(error);


return {


success:false


};


}


}




//------------------//
// COMPTES
//------------------//


async function createUser(data){


return await sendRequest(


"create-user",

data


);


}




async function loginUser(


id,
password


){


return await sendRequest(


"login-user",


{


id,
password


}


);


}




async function getUser(id){


return await sendRequest(


"get-user",


{


id


}


);


}




//------------------//
// FAMILLES
//------------------//


async function createUserFamily(data){


return await sendRequest(


"create-family",

data


);


}




async function getFamily(


familyID


){


return await sendRequest(


"get-family",


{


familyID


}


);


}




async function joinUserFamily(


userID,
familyID,
password


){


return await sendRequest(


"join-family",


{


userID,
familyID,
password


}


);


}

//------------------//
// QUITTER
//------------------//


async function leaveUserFamily(


userID


){


return await sendRequest(


"leave-family",


{


userID


}


);


}




//------------------//
// MEMBRES
//------------------//


async function removeFamilyMember(


familyID,
memberID


){


return await sendRequest(


"remove-member",


{


familyID,
memberID


}


);


}




async function transferFamilyAdmin(


familyID,
adminID,
memberID


){


return await sendRequest(


"transfer-admin",


{


familyID,
adminID,
memberID


}


);


}




async function removeFamily(


familyID


){


return await sendRequest(


"delete-family",


{


familyID


}


);


}

//------------------//
// INVITATIONS
//------------------//


async function createInvitation(data){


return await sendRequest(


"create-invitation",

data


);


}




async function joinInvitationFamily(data){


return await sendRequest(


"join-invitation",

data


);


}




async function getInvitation(


invitationID


){


return await sendRequest(


"get-invitation",


{


invitationID


}


);


}




async function deleteInvitation(


invitationID


){


return await sendRequest(


"delete-invitation",


{


invitationID


}


);


}




//------------------//
// PROFIL
//------------------//


async function updateProfile(data){


return await sendRequest(


"update-profile",

data


);


}




async function updateProfilePicture(


userID,
picture


){


return await sendRequest(


"update-picture",


{


userID,
picture


}


);


}




async function changePassword(


userID,
oldPassword,
newPassword


){


return await sendRequest(


"change-password",


{


userID,
oldPassword,
newPassword


}


);


}

//------------------//
// VÉRIFICATIONS
//------------------//


async function accountExists(


userID


){


return await sendRequest(


"account-exists",


{


userID


}


);


}




async function familyExists(


familyID


){


return await sendRequest(


"family-exists",


{


familyID


}


);


}




async function invitationExists(


invitationID


){


return await sendRequest(


"invitation-exists",


{


invitationID


}


);


}




//------------------//
// UTILITAIRES
//------------------//


function isSuccess(response){


if(!response){

return false;

}


return Boolean(

response.success

);


}




function hasError(response){


if(!response){

return true;

}


return Boolean(

response.error

);


}




function getMessage(response){


if(!response){

return "Une erreur est survenue.";

}


return (

response.message ||

""

);


}

//------------------//
// RÉCUPÉRATIONS
//------------------//


async function getFamilyMembers(
familyID
){

return await sendRequest(

"get-family-members",

{

familyID

}


);


}




async function getFamilyAdmin(
familyID
){

return await sendRequest(

"get-family-admin",

{

familyID

}


);


}




async function getUserFamilies(
userID
){

return await sendRequest(

"user-families",

{

userID

}


);


}




//------------------//
// INVITATIONS
//------------------//


async function getFamilyInvitations(
familyID
){

return await sendRequest(

"get-family-invitations",

{

familyID

}


);


}




async function revokeInvitation(
invitationID
){

return await sendRequest(

"revoke-invitation",

{

invitationID

}


);


}




async function incrementInvitationUse(
invitationID
){

return await sendRequest(

"increment-invitation",

{

invitationID

}


);


}

//------------------//
// DONNÉES
//------------------//


function isConnected(){


return Boolean(

localStorage.getItem(
"coiffs-user-id"
)

);


}




function getConnectedID(){


return localStorage.getItem(

"coiffs-user-id"

);


}




function clearConnection(){


localStorage.removeItem(

"coiffs-user-id"

);


}




//------------------//
// SÉCURITÉS
//------------------//


function isValidID(id){


return (

String(id).length === 10

);


}




function isValidInvitationID(
id
){


return (

String(id).length === 10

);


}




function isValidAge(
age
){


return (

age >= 1 &&

age <= 120

);


}

//------------------//
// INITIALISATION
//------------------//


async function pingServer(){


    return await sendRequest(

        "ping"

    );


}




async function getServerVersion(){


    return await sendRequest(

        "server-version"

    );


}




//------------------//
// NETTOYAGE
//------------------//


async function cleanExpiredInvitations(){


    return await sendRequest(

        "clean-invitations"

    );


}




async function cleanDeletedFamilies(){


    return await sendRequest(

        "clean-families"

    );


}




//------------------//
// INFORMATIONS
//------------------//


function getAPIURL(){


    return API_URL;


}




function hasConnection(){


    return navigator.onLine;


}




//------------------//
// EXPORTS
//------------------//


window.createUser =
createUser;


window.loginUser =
loginUser;


window.getUser =
getUser;


window.createUserFamily =
createUserFamily;


window.getFamily =
getFamily;


window.joinUserFamily =
joinUserFamily;


window.leaveUserFamily =
leaveUserFamily;


window.removeFamilyMember =
removeFamilyMember;


window.transferFamilyAdmin =
transferFamilyAdmin;


window.removeFamily =
removeFamily;


window.createInvitation =
createInvitation;


window.joinInvitationFamily =
joinInvitationFamily;


window.getInvitation =
getInvitation;


window.deleteInvitation =
deleteInvitation;


window.updateProfile =
updateProfile;


window.changePassword =
changePassword;


window.accountExists =
accountExists;


window.familyExists =
familyExists;


window.invitationExists =
invitationExists;


window.getFamilyMembers =
getFamilyMembers;


window.getFamilyAdmin =
getFamilyAdmin;


window.getFamilyInvitations =
getFamilyInvitations;


window.revokeInvitation =
revokeInvitation;


window.incrementInvitationUse =
incrementInvitationUse;


window.pingServer =
pingServer;


window.getServerVersion =
getServerVersion;


window.hasConnection =
hasConnection;