//------------------//
// CONSTANTES
//------------------//


const website =

document.getElementById(
"website"
);


const welcomeScreen =

document.getElementById(
"welcome-screen"
);


const loadingScreen =

document.getElementById(
"loading-screen"
);


const app =

document.getElementById(
"app"
);


const header =

document.getElementById(
"header"
);


const mainContainer =

document.getElementById(
"main-container"
);


const popupBackground =

document.getElementById(
"popup-background"
);


const popupContainer =

document.getElementById(
"popup-container"
);


const profileButton =

document.getElementById(
"profile-button"
);


const profileLetter =

document.getElementById(
"profile-letter"
);


const accountID =

document.getElementById(
"account-id"
);




//------------------//
// VARIABLES
//------------------//


let currentUser = null;

let currentFamily = null;

let currentInvitation = null;

let currentRole = null;

let currentPage = "home";

let currentPopup = null;

let currentMembers = [];

let currentNotifications = [];

let isConnected = false;

let isLoading = false;

let websiteStarted = false;

let websiteReady = false;

let firstConnection = true;

let refreshInterval = null;

let familyInterval = null;




//------------------//
// VERSION
//------------------//


const COIFFS_VERSION =

"1.0.0";


const COIFFS_NAME =

"Coiffs";


const WELCOME_TIME =

2000;


const REFRESH_TIME =

30000;




//------------------//
// LOCAL STORAGE
//------------------//


const USER_STORAGE =

"coiffs-user-id";


const INVITATION_STORAGE =

"coiffs-invitation";


const SETTINGS_STORAGE =

"coiffs-settings";




//------------------//
// DÉMARRAGE
//------------------//


window.onload = ()=>{


startWebsite();


};




function startWebsite(){


if(

websiteStarted

){

return;

}


websiteStarted = true;


showLoading();


setTimeout(()=>{


hideWelcomeScreen();


initialization();


},WELCOME_TIME);


}




//------------------//
// INITIALISATION
//------------------//


async function initialization(){


try{


await checkConnection();


await checkInvitation();


await loadSettings();


startSynchronisation();


websiteReady = true;


hideLoading();


}


catch(error){


console.error(error);


hideLoading();


showConnection();


}


}




//------------------//
// WELCOME SCREEN
//------------------//


function hideWelcomeScreen(){


if(

welcomeScreen

){

welcomeScreen.style.display =

"none";

}


if(

app

){

app.classList.add(

"active"

);

}


}




//------------------//
// LOADING
//------------------//


function showLoading(){


isLoading = true;


if(

loadingScreen

){

loadingScreen.style.display =

"flex";

}


}




function hideLoading(){


isLoading = false;


if(

loadingScreen

){

loadingScreen.style.display =

"none";

}


}




//------------------//
// SYNCHRONISATION
//------------------//


function startSynchronisation(){


if(

refreshInterval

){

clearInterval(

refreshInterval

);


}


if(

familyInterval

){

clearInterval(

familyInterval

);


}



refreshInterval =

setInterval(


async()=>{


if(

currentUser

){

await refreshUser();

}


},

REFRESH_TIME


);




familyInterval =

setInterval(


async()=>{


if(

currentFamily

){

await refreshFamily();

}


},

REFRESH_TIME


);


}




//------------------//
// ARRÊT
//------------------//


function stopSynchronisation(){


if(

refreshInterval

){

clearInterval(

refreshInterval

);

refreshInterval = null;


}


if(

familyInterval

){

clearInterval(

familyInterval

);

familyInterval = null;


}


}




//------------------//
// PARAMÈTRES
//------------------//


async function loadSettings(){


try{


const settings =

localStorage.getItem(

SETTINGS_STORAGE

);


if(

!settings

){

return;

}


JSON.parse(
settings
);


}


catch(error){


console.error(error);


}


}




//------------------//
// UTILITAIRES
//------------------//


function getCurrentDate(){


return Date.now();


}




function getCurrentVersion(){


return COIFFS_VERSION;


}




function getWebsiteName(){


return COIFFS_NAME;


}

//------------------//
// CONNEXION API
//------------------//


async function callAPI(
action,
data = {}
){

try{


const response =

await fetch(

"/api/index",

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


const result =

await response.json();


return result;


}


catch(error){


console.error(error);


return{


success:false,


message:
"Le serveur est indisponible."


};


}


}




//------------------//
// CONNEXION
//------------------//


async function checkConnection(){


const userID =

localStorage.getItem(

USER_STORAGE

);


if(

!userID

){

showConnection();

return;

}


try{


const result =

await callAPI(

"get-user",

{

id:
userID

}

);


if(

!result.success

){

localStorage.removeItem(

USER_STORAGE

);


showConnection();

return;


}


currentUser =

result.user;


isConnected = true;


updateHeader();


showHome();


}


catch(error){


console.error(error);


showConnection();


}


}




//------------------//
// CONNEXION
//------------------//


function showConnection(){


currentPage =

"connection";


mainContainer.innerHTML =

`

<div class="card">


<h2
class="section-title">

Connexion

</h2>


<p
class="small-title">

ID du compte

</p>


<input
id="login-id"
type="text"
maxlength="10">


<p
class="small-title">

Mot de passe

</p>


<input
id="login-password"
type="password">


<br>
<br>


<button
class="primary-button"
onclick="login()">

SE CONNECTER

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showRegister()">

CRÉER UN COMPTE

</button>


</div>

`;


}




//------------------//
// CONNEXION
//------------------//


async function login(){


const id =

document.getElementById(

"login-id"

).value.trim();



const password =

document.getElementById(

"login-password"

).value;



if(

!id ||

!password

){

return;

}


showLoading();


const result =

await callAPI(

"login",

{

id,
password

}

);



hideLoading();



if(

!result.success

){

showMessage(

"Erreur",

result.message

);

return;


}



currentUser =

result.user;


localStorage.setItem(

USER_STORAGE,

currentUser.id

);


isConnected = true;


updateHeader();


showHome();


}




//------------------//
// INSCRIPTION
//------------------//


function showRegister(){


currentPage =

"register";


mainContainer.innerHTML =

`

<div class="card">


<h2
class="section-title">

Créer un compte

</h2>


<p
class="small-title">

Prénom

</p>


<input
id="register-firstname"
type="text"
maxlength="25">


<p
class="small-title">

Âge

</p>


<input
id="register-age"
type="number">


<p
class="small-title">

Mot de passe

</p>


<input
id="register-password"
type="password">


<p
class="small-title">

Lien de la photo (optionnel)

</p>


<input
id="register-picture"
type="url"
placeholder="https://exemple.com/image.png">


<br>
<br>


<button
class="primary-button"
onclick="register()">

CRÉER LE COMPTE

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showConnection()">

RETOUR

</button>


</div>

`;


}




//------------------//
// INSCRIPTION
//------------------//


async function register(){


const firstname =

document.getElementById(

"register-firstname"

).value.trim();



const age =

Number(

document.getElementById(

"register-age"

).value

);



const password =

document.getElementById(

"register-password"

).value;



const pictureURL =

document.getElementById(
"register-picture"
).value.trim();



if(

!firstname ||

!age ||

!password

){

return;

}


const color =

generateColor();



showLoading();


const result =

await callAPI(

"create-user",

{

firstname,
age,
password,
pictureURL,
color

}


);


hideLoading();



if(

!result.success

){

showMessage(

"Erreur",

result.message

);


return;


}



currentUser =

result.user;


localStorage.setItem(

USER_STORAGE,

currentUser.id

);


isConnected = true;


updateHeader();


showHome();


}




//------------------//
// DÉCONNEXION
//------------------//


function logout(){


localStorage.removeItem(

USER_STORAGE

);


localStorage.removeItem(

INVITATION_STORAGE

);


currentUser = null;

currentFamily = null;

currentRole = null;

currentInvitation = null;

isConnected = false;


updateHeader();


showConnection();


}




//------------------//
// INFORMATIONS
//------------------//


function userIsConnected(){


return Boolean(

currentUser

);


}




function userHasFamily(){


if(

!currentUser

){

return false;

}


return Boolean(

currentUser.familyID

);


}




function userIsAdmin(){


if(

!currentUser

){

return false;

}


return (

currentUser.role ===

"admin"

);


}

//------------------//
// HEADER
//------------------//


function updateHeader(){


if(

!currentUser

){


if(accountID){

accountID.textContent =

"Non connecté";

}


if(profileButton){

profileButton.style.background =

"transparent";


profileButton.innerHTML =

`

<span
id="profile-letter">

?

</span>

`;


}


return;


}




if(accountID){

accountID.textContent =

currentUser.id;

}




if(

currentUser.photo

){

profileButton.innerHTML =

`

<img
class="profile-picture"
src="${currentUser.photo}">

`;


}


else{


profileButton.innerHTML =

`

<span
id="profile-letter">

${

currentUser.firstname[0]
.toUpperCase()

}

</span>

`;


profileButton.style.background =

currentUser.color;


}


}




//------------------//
// PROFIL
//------------------//


function showProfile(){


if(

!currentUser

){

return;

}


openPopup();


popupContainer.innerHTML =

`

<div class="profile-card">


<h2>

${currentUser.firstname}

</h2>


<p>

ID :
${currentUser.id}

</p>


<p>

Âge :
${currentUser.age}
ans

</p>


<p>

Version :

${COIFFS_VERSION}

</p>


<br>


<button
class="primary-button"
onclick="showAccountSettings()">

PARAMÈTRES

</button>


<br>
<br>


<button
class="secondary-button"
onclick="logout()">

DÉCONNEXION

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

FERMER

</button>


</div>

`;


}




//------------------//
// PARAMÈTRES
//------------------//


function showAccountSettings(){


popupContainer.innerHTML =

`

<h2
class="section-title">

Paramètres

</h2>


<button
class="primary-button"
onclick="showInformations()">

MON COMPTE

</button>


<br>
<br>


<button
class="primary-button"
onclick="showApplicationInformations()">

L'APPLICATION

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showProfile()">

RETOUR

</button>

`;


}




function showInformations(){


popupContainer.innerHTML =

`

<h2>

Informations

</h2>


<p>

Prénom :

${currentUser.firstname}

</p>


<p>

ID :

${currentUser.id}

</p>


<p>

Âge :

${currentUser.age}
ans

</p>


<p>

Rôle :

${

currentUser.role ||

"Aucun"

}

</p>


<br>


<button
class="secondary-button"
onclick="showAccountSettings()">

RETOUR

</button>

`;


}




function showApplicationInformations(){


popupContainer.innerHTML =

`

<h2>

Coiffs

</h2>


<p>

Version :

${COIFFS_VERSION}

</p>


<p>

Plateforme :

${

navigator.platform

}

</p>


<p>

Langue :

${

navigator.language

}

</p>


<br>


<button
class="secondary-button"
onclick="showAccountSettings()">

RETOUR

</button>

`;


}




//------------------//
// POP-UPS
//------------------//


function openPopup(){


popupBackground.style.display =

"flex";


}




function closePopup(){


popupBackground.style.display =

"none";


popupContainer.innerHTML =

"";


currentPopup = null;


}




function clearPopup(){


popupContainer.innerHTML =

"";


}




popupBackground.onclick =

(event)=>{


if(

event.target ===

popupBackground

){

closePopup();

}


};




//------------------//
// NOTIFICATIONS
//------------------//


function showMessage(

title,
message

){


openPopup();


popupContainer.innerHTML =

`

<h2>

${title}

</h2>


<p>

${message}

</p>


<br>


<button
class="primary-button"
onclick="closePopup()">

OK

</button>

`;


}




function showError(
message
){


showMessage(

"Erreur",

message

);


}




function showSuccess(
message
){


showMessage(

"Succès",

message

);


}




function addNotification(
title,
message
){


currentNotifications.push({


title,
message,


date:

Date.now()


});


}




function clearNotifications(){


currentNotifications = [];


}




function getNotifications(){


return currentNotifications;


}




//------------------//
// PROFIL
//------------------//


if(

profileButton

){

profileButton.onclick =

()=>{


if(

currentUser

){

showProfile();

}


};


}

//------------------//
// ACCUEIL
//------------------//


async function showHome(){


currentPage =

"home";


if(

!currentUser

){

showConnection();

return;

}


if(

await hasInvitation()

){

await checkInvitation();

}


if(

currentUser.familyID

){

showFamilyCard();

return;

}


if(

currentUser.age < 18

){

showMinorHome();

return;

}


showAdultHome();


}




//------------------//
// -18 ANS
//------------------//


function showMinorHome(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

Rejoindre une famille

</h2>


<p>

Vous pouvez rejoindre
une famille avec un
identifiant ou un lien
d'invitation.

</p>


<br>


<button
class="primary-button"
onclick="showJoinFamily()">

REJOINDRE

</button>


</div>

`;


}




//------------------//
// +18 ANS
//------------------//


function showAdultHome(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

Rejoindre une famille

</h2>


<p>

Utilisez l'identifiant
de la famille ainsi que
son mot de passe.

</p>


<br>


<button
class="primary-button"
onclick="showJoinFamily()">

REJOINDRE

</button>


</div>


<br>


<div class="family-card">


<h2>

Créer une famille

</h2>


<p>

Créez votre propre
famille et gérez
vos invitations.

</p>


<br>


<button
class="primary-button"
onclick="showCreateFamily()">

CRÉER

</button>


</div>

`;


}




//------------------//
// CARTE
//------------------//


function showFamilyCard(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

${

currentUser.familyName

}

</h2>


<p>

Votre famille est
prête à être ouverte.

</p>


<br>


<button
class="primary-button"
onclick="openFamily()">

OUVRIR

</button>


</div>

`;


}




//------------------//
// REJOINDRE
//------------------//


function showJoinFamily(){

openPopup();

popupContainer.innerHTML =

`

<h2>

Rejoindre une famille

</h2>


<p class="small-title">

Token d'invitation

</p>


<input
id="family-token"
type="text"
maxlength="50"
placeholder="COIFFS-XXXXXXXX">


<br>

<p
style="
font-size:14px;
opacity:0.8;
">

Si vous venez d'une
invitation Coiffs,
copiez puis collez
votre token ici.

</p>


<br>


<button
class="primary-button"
onclick="joinWithToken()">

REJOINDRE

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

ANNULER

</button>

`;

}



//------------------//
// CRÉER
//------------------//


function showCreateFamily(){


if(

currentUser.age < 18

){

showError(

"Vous devez avoir 18 ans."

);

return;


}


openPopup();


popupContainer.innerHTML =

`

<h2>

Créer une famille

</h2>


<p
class="small-title">

Nom

</p>


<input
id="family-name"
type="text"
maxlength="30">


<p
class="small-title">

Mot de passe

</p>


<input
id="family-create-password"
type="password">


<br>
<br>


<button
class="primary-button"
onclick="createFamily()">

CRÉER

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

ANNULER

</button>

`;


}




//------------------//
// INFORMATIONS
//------------------//


function hasFamily(){


if(

!currentUser

){

return false;

}


return Boolean(

currentUser.familyID

);


}




function isAdult(){


if(

!currentUser

){

return false;

}


return (

currentUser.age >= 18

);


}




function canCreateFamily(){


if(

!currentUser

){

return false;

}


if(

currentUser.familyID

){

return false;

}


return (

currentUser.age >= 18

);


}




function canJoinFamily(){


if(

!currentUser

){

return false;

}


return !(

currentUser.familyID

);


}

//------------------//
// CRÉATION
//------------------//


async function createFamily(){


if(

!canCreateFamily()

){

return;

}


const name =

document.getElementById(
"family-name"
).value.trim();


const password =

document.getElementById(
"family-create-password"
).value;



if(

!name ||

!password

){

showError(

"Veuillez compléter tous les champs."

);

return;

}


showLoading();


const result =

await callAPI(

"create-family",

{

name,
password,

userID:
currentUser.id


}


);


hideLoading();



if(

!result.success

){

showError(

result.message

);

return;


}



currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"admin";


currentFamily =

result.family;


closePopup();


showSuccess(

"Votre famille a été créée."

);


showHome();


}




//------------------//
// REJOINDRE
//------------------//

async function joinWithToken(){

if(!canJoinFamily()){

return;

}


const token =

document.getElementById(
"family-token"
).value.trim();


if(!token){

showError(
"Veuillez entrer votre token."
);

return;

}


showLoading();


const result =

await callAPI(

"join-token",

{

token,

userID:
currentUser.id

}

);


hideLoading();


if(!result.success){

showError(
result.message
);

return;

}


currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"member";


currentFamily =

result.family;


closePopup();


showSuccess(

"Vous avez rejoint votre famille."

);


showHome();

}

//------------------//
// OUVRIR
//------------------//


async function openFamily(){


if(

!currentUser.familyID

){

return;

}


showLoading();


const result =

await callAPI(

"get-family",

{

id:
currentUser.familyID

}


);


hideLoading();



if(

!result.success

){

showError(

"Cette famille n'existe plus."

);


currentUser.familyID =

null;


currentUser.familyName =

null;


currentUser.role =

null;


showHome();


return;


}



currentFamily =

result.family;


showFamily();


}




//------------------//
// QUITTER
//------------------//


async function leaveFamily(){


if(

!currentUser

||

!currentUser.familyID

){

return;

}



if(

currentUser.role ===

"admin"

){

showError(

"L'administrateur doit transférer l'administration avant de quitter."

);

return;


}



showLoading();


const result =

await callAPI(

"leave-family",

{

userID:
currentUser.id

}


);


hideLoading();



if(

!result.success

){

showError(

result.message

);

return;


}



currentUser.familyID =

null;


currentUser.familyName =

null;


currentUser.role =

null;


currentFamily =

null;


showSuccess(

"Vous avez quitté votre famille."

);


showHome();


}




//------------------//
// ACTUALISATION
//------------------//


async function refreshFamily(){


if(

!currentUser

||

!currentUser.familyID

){

return;

}


try{


const result =

await callAPI(

"get-family",

{

id:
currentUser.familyID

}


);



if(

!result.success

){

return;

}


currentFamily =

result.family;


}


catch(error){


console.error(

error

);


}


}




//------------------//
// UTILITAIRES
//------------------//


function getCurrentFamily(){


return currentFamily;


}




function getCurrentRole(){


return currentRole;


}




function familyExists(){


return Boolean(

currentFamily

);


}




function getMembersNumber(){


if(

!currentFamily

){

return 0;

}


return (

currentFamily.members
.length

);


}




function formatMembers(
number
){


if(

number <= 1

){

return "1 membre";

}


return (

`${number} membres`

);


}

//------------------//
// AFFICHAGE
//------------------//


function showFamily(){


currentPage =

"family";


let membersHTML = "";


currentMembers =

currentFamily.members;



currentMembers.forEach(


(member)=>{


membersHTML +=

`

<div
class="member">


<div>

${


member.photo


?


`

<img
class="profile-picture"
src="${member.photo}">

`


:


`

<div
class="profile-default"
style="background:${member.color};">

${

member.firstname[0]
.toUpperCase()

}

</div>

`


}


</div>



<div
class="member-information">


<p
class="member-name">

${

member.firstname

}

</p>


<p
class="member-role">

${

member.role ===
"admin"

?

"Administrateur"

:

"Membre"

}

</p>


</div>


</div>

`;


}


);




let administration =

"";



if(

currentUser.role ===
"admin"

){

administration =

`

<div class="admin-card">


<h2>

Administration

</h2>


<button
class="yellow-button"
onclick="showInvitationSettings()">

INVITER

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showKickMembers()">

EXPULSER
UN MEMBRE

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showTransferAdmin()">

TRANSFÉRER
L'ADMINISTRATION

</button>


<br>
<br>


<button
class="delete-button"
onclick="showDeleteFamily()">

SUPPRIMER
LA FAMILLE

</button>


</div>

`;


}




let leaveButton =

"";


if(

currentUser.role !==
"admin"

){

leaveButton =

`

<br>

<button
class="secondary-button"
onclick="leaveFamily()">

QUITTER
LA FAMILLE

</button>

`;


}




mainContainer.innerHTML =

`

<div class="family-card">


<h2>

${

currentFamily.name

}

</h2>


<p>

${

formatMembers(

currentFamily.members
.length

)

}

</p>


</div>


<div class="members-list">


${

membersHTML

}


</div>


${

leaveButton

}


<br>


${

administration

}


`;


}




//------------------//
// MEMBRES
//------------------//


function getAdmins(){


if(

!currentFamily

){

return [];


}


return currentFamily
.members
.filter(


(member)=>{


return (

member.role ===

"admin"

);


}


);


}




function getNormalMembers(){


if(

!currentFamily

){

return [];


}


return currentFamily
.members
.filter(


(member)=>{


return (

member.role ===

"member"

);


}


);


}




function isFamilyAdmin(){


if(

!currentUser

){

return false;

}


return (

currentUser.role ===

"admin"

);


}




//------------------//
// INFORMATIONS
//------------------//


function getFamilyName(){


if(

!currentFamily

){

return "";

}


return (

currentFamily.name

);


}




function getFamilyID(){


if(

!currentFamily

){

return "";

}


return (

currentFamily.id

);


}




function getFamilyMembers(){


if(

!currentFamily

){

return [];


}


return (

currentFamily.members

);


}




//------------------//
// ACTUALISATION
//------------------//


async function updateFamily(){


if(

!currentUser

||

!currentUser.familyID

){

return;

}


await refreshFamily();


if(

currentPage ===

"family"

){

showFamily();

}


}




//------------------//
// SYNCHRONISATION
//------------------//


setInterval(


async()=>{


if(

currentFamily

){

await updateFamily();

}


},

15000


);




//------------------//
// SÉCURITÉS
//------------------//


function hasMembers(){


if(

!currentFamily

){

return false;

}


return (

currentFamily.members
.length > 0

);


}




function hasMoreThanOneMember(){


if(

!currentFamily

){

return false;

}


return (

currentFamily.members
.length > 1

);


}

//------------------//
// INVITATIONS
//------------------//


function showInvitationSettings(){


if(

!isFamilyAdmin()

){

return;

}


openPopup();


popupContainer.innerHTML =

`

<h2
class="section-title">

Créer une invitation

</h2>


<p
class="small-title">

Expiration

</p>


<select
id="invitation-expiration">


<option value="24h">

24 heures

</option>


<option value="7d">

7 jours

</option>


<option value="30d">

30 jours

</option>


<option value="never">

Jamais

</option>


</select>


<br>
<br>


<p
class="small-title">

Nombre maximum
d'utilisations

</p>


<select
id="invitation-limit">


<option value="1">

1 personne

</option>


<option value="5">

5 personnes

</option>


<option value="10">

10 personnes

</option>


<option value="25">

25 personnes

</option>


<option value="50">

50 personnes

</option>


<option value="100">

100 personnes

</option>


</select>


<br>
<br>


<button
class="primary-button"
onclick="generateInvitation()">

GÉNÉRER

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

ANNULER

</button>

`;


}




//------------------//
// GÉNÉRATION
//------------------//


async function generateInvitation(){


if(

!currentFamily

){

return;

}


const expiration =

document.getElementById(
"invitation-expiration"
).value;


const limit =

Number(

document.getElementById(
"invitation-limit"
).value

);



showLoading();



const result =

await callAPI(

"create-invitation",

{

familyID:
currentFamily.id,

adminID:
currentUser.id,

expiration,
limit


}


);



hideLoading();



if(

!result.success

){

showError(

result.message

);


return;


}



const link =

`${window.location.origin}/invitation.html?id=${result.id}`;



popupContainer.innerHTML =

`

<h2>

Invitation créée

</h2>


<p>

Votre lien est prêt.

</p>


<div
class="invitation-link">

${link}

</div>


<br>


<button
class="primary-button"
onclick="copyInvitationLink(

'${link}'

)">

COPIER LE LIEN

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

FERMER

</button>

`;


}




//------------------//
// COPIER
//------------------//


async function copyInvitationLink(
link
){


try{


await navigator
.clipboard
.writeText(

link

);


showSuccess(

"Le lien a été copié."

);


}


catch(error){


console.error(

error

);


showError(

"Impossible de copier le lien."

);


}


}




//------------------//
// REJOINDRE
//------------------//


function joinInvitation(

familyID,
invitationID

){


if(

!currentUser

){


localStorage.setItem(

INVITATION_STORAGE,


JSON.stringify({


familyID,
invitationID


})


);


showConnection();


return;


}


acceptInvitation(

familyID,
invitationID

);


}




async function acceptInvitation(

familyID,
invitationID

){


showLoading();



const result =

await callAPI(

"join-invitation",

{

userID:
currentUser.id,

familyID,
invitationID


}


);



hideLoading();



if(

!result.success

){

showError(

result.message

);


return;


}



currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"member";


currentFamily =

result.family;


showSuccess(

"Vous avez rejoint votre famille."

);


showHome();


}

//------------------//
// INVITATIONS
//------------------//


async function hasInvitation(){


const invitation =

localStorage.getItem(

INVITATION_STORAGE

);


return Boolean(
invitation
);


}




async function checkInvitation(){


const invitation =

localStorage.getItem(

INVITATION_STORAGE

);


if(

!invitation

){

return;

}


try{


const data =

JSON.parse(
invitation
);


currentInvitation =

data;


}


catch(error){


console.error(
error
);


localStorage.removeItem(

INVITATION_STORAGE

);


}


}




//------------------//
// APRÈS CONNEXION
//------------------//


async function checkPendingInvitation(){


if(

!currentUser ||

!currentInvitation

){

return;

}



if(

currentUser.familyID

){

localStorage.removeItem(

INVITATION_STORAGE

);

return;


}



await acceptInvitation(

currentInvitation.familyID,

currentInvitation.invitationID

);


localStorage.removeItem(

INVITATION_STORAGE

);


currentInvitation = null;


}




//------------------//
// INFORMATIONS
//------------------//


function invitationExists(){


return Boolean(

currentInvitation

);


}




function clearInvitation(){


localStorage.removeItem(

INVITATION_STORAGE

);


currentInvitation = null;


}




//------------------//
// ACTUALISATION
//------------------//


async function refreshInvitation(){


if(

!currentInvitation

){

return;

}


const result =

await callAPI(

"get-invitation",

{

invitationID:

currentInvitation
.invitationID


}


);



if(

!result.success

){

clearInvitation();

return;


}


}




//------------------//
// SYNCHRONISATION
//------------------//


setInterval(


async()=>{


if(

currentInvitation

){

await refreshInvitation();

}


},

30000


);




//------------------//
// EXPIRATION
//------------------//


function invitationIsExpired(


invitation


){


if(

!invitation

){

return true;

}



if(

invitation.expiration ===

"never"

){

return false;

}



let duration = 0;



switch(

invitation.expiration

){


case "24h":


duration =

24 * 60 * 60 * 1000;

break;



case "7d":


duration =

7 * 24 * 60 * 60 * 1000;

break;



case "30d":


duration =

30 * 24 * 60 * 60 * 1000;

break;


}



return (

Date.now() >

invitation.createdAt +

duration

);


}




//------------------//
// UTILITAIRES
//------------------//


function invitationRemainingUses(


invitation


){


if(

!invitation

){

return 0;

}


return (

invitation.limit -

invitation.uses

);


}




function invitationIsFull(


invitation


){


if(

!invitation

){

return true;

}


return (

invitation.uses >=

invitation.limit

);


}




function formatExpiration(


expiration


){


switch(


expiration


){


case "24h":

return "24 heures";


case "7d":

return "7 jours";


case "30d":

return "30 jours";


case "never":

return "Jamais";


default:

return "Inconnue";


}


}




//------------------//
// PROTECTION
//------------------//


window.addEventListener(

"storage",

()=>{


checkInvitation();


}


);




//------------------//
// DÉMARRAGE
//------------------//


window.addEventListener(

"load",

async()=>{


await checkInvitation();


await checkPendingInvitation();


}


);

//------------------//
// ADMINISTRATION
//------------------//


function showKickMembers(){


if(

!isFamilyAdmin()

){

return;

}


let membersHTML = "";


getNormalMembers().forEach(


(member)=>{


membersHTML +=

`

<button
class="secondary-button"
onclick="confirmKickMember(

'${member.id}'

)">

${member.firstname}

</button>


<br>
<br>

`;


}


);



if(

membersHTML === ""

){

membersHTML =

`

<p>

Aucun membre à
expulser.

</p>

`;


}



openPopup();


popupContainer.innerHTML =

`

<h2>

Expulser un membre

</h2>


${membersHTML}


<button
class="primary-button"
onclick="closePopup()">

FERMER

</button>

`;


}




//------------------//
// EXPULSION
//------------------//


function confirmKickMember(
userID
){


popupContainer.innerHTML =

`

<h2>

Confirmation

</h2>


<p>

Voulez-vous vraiment
expulser ce membre ?

</p>


<br>


<button
class="delete-button"
onclick="kickMember(

'${userID}'

)">

EXPULSER

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showKickMembers()">

ANNULER

</button>

`;


}




async function kickMember(
userID
){


showLoading();


const result =

await callAPI(

"kick-member",

{

adminID:
currentUser.id,

userID,

familyID:
currentFamily.id


}


);


hideLoading();



if(

!result.success

){

showError(

result.message

);

return;


}



await refreshFamily();


closePopup();


showSuccess(

"Le membre a été expulsé."

);


showFamily();


}




//------------------//
// TRANSFERT
//------------------//


function showTransferAdmin(){


let membersHTML = "";


getNormalMembers().forEach(


(member)=>{


membersHTML +=

`

<button
class="secondary-button"
onclick="transferAdmin(

'${member.id}'

)">

${member.firstname}

</button>


<br>
<br>

`;


}


);



openPopup();


popupContainer.innerHTML =

`

<h2>

Nouvel administrateur

</h2>


${membersHTML}


<button
class="primary-button"
onclick="closePopup()">

FERMER

</button>

`;


}




async function transferAdmin(
userID
){


showLoading();


const result =

await callAPI(

"transfer-admin",

{

familyID:
currentFamily.id,

adminID:
currentUser.id,

userID


}


);


hideLoading();



if(

!result.success

){

showError(

result.message

);

return;


}



currentUser.role =

"member";


await refreshFamily();


closePopup();


showSuccess(

"L'administration a été transférée."

);


showFamily();


}

//------------------//
// SUPPRESSION
//------------------//


function showDeleteFamily(){


if(

!isFamilyAdmin()

){

return;

}


openPopup();


popupContainer.innerHTML =

`

<h2>

Supprimer la famille

</h2>


<p>

Cette action est
définitive et supprimera
également toutes les
invitations associées.

</p>


<br>


<button
class="delete-button"
onclick="deleteFamily()">

SUPPRIMER

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

ANNULER

</button>

`;


}




async function deleteFamily(){


showLoading();


const result =

await callAPI(

"delete-family",

{

familyID:
currentFamily.id,

adminID:
currentUser.id

}


);


hideLoading();



if(

!result.success

){

showError(

result.message

);

return;


}



currentFamily = null;


currentUser.familyID =

null;


currentUser.familyName =

null;


currentUser.role =

null;


closePopup();


showSuccess(

"La famille a été supprimée."

);


showHome();


}




//------------------//
// SÉCURITÉS
//------------------//


function canDeleteFamily(){


if(

!currentUser

||

!currentFamily

){

return false;

}


return (

currentUser.role ===

"admin"

);


}




function canKickMembers(){


if(

!currentUser

){

return false;

}


return (

currentUser.role ===

"admin"

);


}




function canTransferAdmin(){


if(

!currentUser

){

return false;

}


return (

currentUser.role ===

"admin"

);


}




//------------------//
// MEMBRES
//------------------//


function getMemberByID(
id
){


return currentFamily
.members
.find(


(member)=>{


return (

member.id === id

);


}


);


}




function memberExists(
id
){


return Boolean(

getMemberByID(
id
)

);


}




function memberIsAdmin(
id
){


const member =

getMemberByID(
id
);


if(

!member

){

return false;

}


return (

member.role ===

"admin"

);


}




//------------------//
// ACTUALISATION
//------------------//


async function refreshAdministration(){


if(

!currentFamily

){

return;

}


await refreshFamily();


if(

currentPage ===

"family"

){

showFamily();

}


}




//------------------//
// SYNCHRONISATION
//------------------//


setInterval(


async()=>{


if(

currentUser &&

currentFamily &&

currentUser.role ===

"admin"

){

await refreshAdministration();

}


},

10000


);




//------------------//
// NETTOYAGE
//------------------//


function resetFamilyData(){


currentFamily = null;


currentMembers = [];


currentRole = null;


}




function resetUserFamily(){


if(

!currentUser

){

return;

}


currentUser.familyID =

null;


currentUser.familyName =

null;


currentUser.role =

null;


}




//------------------//
// PROTECTIONS
//------------------//


window.addEventListener(

"beforeunload",

()=>{


if(

currentPopup

){

closePopup();

}


}


);




//------------------//
// INFORMATIONS
//------------------//


function familyHasAdmin(){


if(

!currentFamily

){

return false;

}


return (

getAdmins().length > 0

);


}




function familyCanBeDeleted(){


return (

canDeleteFamily()

);


}

//------------------//
// UTILISATEUR
//------------------//


async function refreshUser(){


if(

!currentUser

){

return;

}


try{


const result =

await callAPI(

"get-user",

{

id:
currentUser.id

}


);



if(

!result.success

){

logout();

return;

}


currentUser =

result.user;


updateHeader();


}


catch(error){


console.error(
error
);


}


}




//------------------//
// SYNCHRONISATION
//------------------//


async function refreshAll(){


await refreshUser();


await refreshFamily();


await refreshInvitation();


}




async function synchroniseWebsite(){


try{


await refreshAll();


}


catch(error){


console.error(
error
);


}


}




//------------------//
// INTERVALLES
//------------------//


let synchronisationInterval =

null;




function startWebsiteSynchronisation(){


if(

synchronisationInterval

){

clearInterval(

synchronisationInterval

);


}



synchronisationInterval =

setInterval(


async()=>{


if(

currentUser

){

await synchroniseWebsite();

}


},

10000


);


}




function stopWebsiteSynchronisation(){


if(

!synchronisationInterval

){

return;

}


clearInterval(

synchronisationInterval

);


synchronisationInterval =

null;


}




//------------------//
// PROTECTION
//------------------//


document.addEventListener(

"visibilitychange",

async()=>{


if(

document.hidden

){

return;

}


if(

currentUser

){

await synchroniseWebsite();

}


}


);




//------------------//
// INTERNET
//------------------//


window.addEventListener(

"online",

async()=>{


showSuccess(

"Connexion rétablie."

);


await synchroniseWebsite();


}


);




window.addEventListener(

"offline",

()=>{


showError(

"Vous êtes hors ligne."

);


}

);




//------------------//
// DÉMARRAGE
//------------------//


window.addEventListener(

"load",

()=>{


startWebsiteSynchronisation();


}

);




//------------------//
// DONNÉES
//------------------//


function saveCurrentUser(){


if(

!currentUser

){

return;

}


localStorage.setItem(

USER_STORAGE,

currentUser.id

);


}




function clearCurrentUser(){


localStorage.removeItem(

USER_STORAGE

);


}




//------------------//
// INFORMATIONS
//------------------//


function websiteIsReady(){


return websiteReady;


}




function applicationIsLoading(){


return isLoading;


}




function userHasInvitation(){


return Boolean(

currentInvitation

);


}




//------------------//
// VALIDATIONS
//------------------//


function userExists(){


return Boolean(

currentUser

);


}




function familySynchronised(){


return Boolean(

currentFamily

);


}




function invitationSynchronised(){


return Boolean(

currentInvitation

);


}




//------------------//
// SAUVEGARDE
//------------------//


function saveSettings(


settings


){


localStorage.setItem(

SETTINGS_STORAGE,

JSON.stringify(

settings

)


);


}




function getSettings(){


try{


return JSON.parse(


localStorage.getItem(

SETTINGS_STORAGE

)


);


}


catch(error){


return {};

}


}

//------------------//
// COULEURS
//------------------//


function generateColor(){


const colors = [

"#4285F4",
"#EA4335",
"#34A853",
"#FBBC05",
"#673AB7",
"#FF5722",
"#009688",
"#795548",
"#2196F3",
"#3F51B5",
"#607D8B",
"#8BC34A",
"#E91E63",
"#9C27B0"

];


return colors[

Math.floor(

Math.random() *

colors.length

)

];


}




//------------------//
// IMAGES
//------------------//


async function convertImage(
file
){


return new Promise(


(resolve,reject)=>{


const reader =

new FileReader();


reader.onload = ()=>{


resolve(

reader.result

);


};


reader.onerror = ()=>{


reject(
null
);


};


reader.readAsDataURL(
file
);


}


);


}




//------------------//
// APPAREILS
//------------------//


function isAppleDevice(){


return /iPhone|iPad|Mac/i
.test(

navigator.userAgent

);


}




function isAndroidDevice(){


return /Android/i
.test(

navigator.userAgent

);


}




function isMobileDevice(){


return /Android|iPhone|iPad/i
.test(

navigator.userAgent

);


}




//------------------//
// ANIMATIONS
//------------------//


function fadeIn(
element
){


if(

!element

){

return;

}


element.style.opacity =

"0";


element.style.display =

"block";


setTimeout(()=>{


element.style.opacity =

"1";


},50);


}




function fadeOut(
element
){


if(

!element

){

return;

}


element.style.opacity =

"0";


setTimeout(()=>{


element.style.display =

"none";


},300);


}




//------------------//
// INFORMATIONS
//------------------//


function getUserName(){


if(

!currentUser

){

return "";

}


return (

currentUser.firstname

);


}




function getUserID(){


if(

!currentUser

){

return "";

}


return (

currentUser.id

);


}




function getUserAge(){


if(

!currentUser

){

return 0;

}


return (

currentUser.age

);


}




//------------------//
// EXPORTS
//------------------//


window.login =
login;

window.logout =
logout;

window.register =
register;

window.showHome =
showHome;

window.showProfile =
showProfile;

window.showConnection =
showConnection;

window.showRegister =
showRegister;

window.showFamily =
showFamily;

window.openFamily =
openFamily;

window.createFamily =
createFamily;

window.joinFamily =
joinFamily;

window.leaveFamily =
leaveFamily;

window.generateInvitation =
generateInvitation;

window.copyInvitationLink =
copyInvitationLink;

window.showInvitationSettings =
showInvitationSettings;

window.showCreateFamily =
showCreateFamily;

window.showJoinFamily =
showJoinFamily;

window.showKickMembers =
showKickMembers;

window.kickMember =
kickMember;

window.transferAdmin =
transferAdmin;

window.showTransferAdmin =
showTransferAdmin;

window.deleteFamily =
deleteFamily;

window.showDeleteFamily =
showDeleteFamily;

window.closePopup =
closePopup;




//------------------//
// OPTIMISATIONS
//------------------//


document.addEventListener(

"contextmenu",

(event)=>{


event.preventDefault();


}


);




window.addEventListener(

"error",

(error)=>{


console.error(

error

);


}

);




window.addEventListener(

"unhandledrejection",

(error)=>{


console.error(

error

);


}

);




//------------------//
// DÉMARRAGE
//------------------//


window.addEventListener(

"load",

async()=>{


try{


await initialization();


await checkPendingInvitation();


updateHeader();


}


catch(error){


console.error(

error

);


}


}

);




//------------------//
// FIN
//------------------//


console.log(

"Coiffs " +

COIFFS_VERSION +

" démarré avec succès."

);
