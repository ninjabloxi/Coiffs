//------------------//
// CONSTANTES
//------------------//


const API_URL =

"/api";


const WELCOME_TIME =

2000;




//------------------//
// VARIABLES
//------------------//


let currentUser =

null;


let currentFamily =

null;


let currentRole =

null;




//------------------//
// ÉLÉMENTS HTML
//------------------//


const welcomeScreen =

document.getElementById(
"welcome-screen"
);


const app =

document.getElementById(
"app"
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
// DÉMARRAGE
//------------------//


window.onload = ()=>{


startWebsite();


};




function startWebsite(){


setTimeout(()=>{


welcomeScreen.style.display =

"none";


app.classList.add(
"active"
);


checkConnection();


},WELCOME_TIME);


}




//------------------//
// API
//------------------//


async function callAPI(
action,
data = {}
){


const request =

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


return await request.json();


}


//------------------//
// CONNEXION
//------------------//


async function checkConnection(){


const userID =

localStorage.getItem(
"coiffs-user-id"
);


if(!userID){

showConnection();

return;

}


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
"coiffs-user-id"
);

showConnection();

return;

}


currentUser =

result.user;


updateHeader();


showHome();


}




async function login(){


const id =

document.getElementById(
"login-id"
).value.trim();


const password =

document.getElementById(
"login-password"
).value;


const result =

await callAPI(

"login",

{

id,
password

}

);


if(

!result.success

){

return;

}


currentUser =

result.user;


localStorage.setItem(

"coiffs-user-id",

currentUser.id

);


updateHeader();


showHome();


}




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


const picture =

document.getElementById(
"register-picture"
).files[0];


let pictureURL =

null;


if(picture){

pictureURL =

await convertImage(
picture
);

}


const result =

await callAPI(

"create-user",

{

firstname,

age,

password,

pictureURL,

color:
generateColor()

}

);


if(

!result.success

){

return;

}


currentUser =

result.user;


localStorage.setItem(

"coiffs-user-id",

currentUser.id

);


updateHeader();


showHome();


}




//------------------//
// PROFIL
//------------------//


function updateHeader(){


if(!currentUser){

return;

}


accountID.textContent =

currentUser.id;


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




function logout(){


localStorage.removeItem(

"coiffs-user-id"

);


currentUser = null;

currentFamily = null;

currentRole = null;


showConnection();


}




function showProfile(){


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2>

${currentUser.firstname}

</h2>


<p>

ID :
${currentUser.id}

</p>


<br>


<button
class="primary-button"
onclick="logout()">

Déconnexion

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

Fermer

</button>

`;


}




function closePopup(){


popupBackground.style.display =

"none";


popupContainer.innerHTML =

"";


}//------------------//
// CONNEXION
//------------------//


async function checkConnection(){


const userID =

localStorage.getItem(
"coiffs-user-id"
);


if(!userID){

showConnection();

return;

}


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
"coiffs-user-id"
);

showConnection();

return;

}


currentUser =

result.user;


updateHeader();


showHome();


}




async function login(){


const id =

document.getElementById(
"login-id"
).value.trim();


const password =

document.getElementById(
"login-password"
).value;


const result =

await callAPI(

"login",

{

id,
password

}

);


if(

!result.success

){

return;

}


currentUser =

result.user;


localStorage.setItem(

"coiffs-user-id",

currentUser.id

);


updateHeader();


showHome();


}




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


const picture =

document.getElementById(
"register-picture"
).files[0];


let pictureURL =

null;


if(picture){

pictureURL =

await convertImage(
picture
);

}


const result =

await callAPI(

"create-user",

{

firstname,

age,

password,

pictureURL,

color:
generateColor()

}

);


if(

!result.success

){

return;

}


currentUser =

result.user;


localStorage.setItem(

"coiffs-user-id",

currentUser.id

);


updateHeader();


showHome();


}




//------------------//
// PROFIL
//------------------//


function updateHeader(){


if(!currentUser){

return;

}


accountID.textContent =

currentUser.id;


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




function logout(){


localStorage.removeItem(

"coiffs-user-id"

);


currentUser = null;

currentFamily = null;

currentRole = null;


showConnection();


}




function showProfile(){


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2>

${currentUser.firstname}

</h2>


<p>

ID :
${currentUser.id}

</p>


<br>


<button
class="primary-button"
onclick="logout()">

Déconnexion

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

Fermer

</button>

`;


}




function closePopup(){


popupBackground.style.display =

"none";


popupContainer.innerHTML =

"";


}

//------------------//
// ACCUEIL
//------------------//


async function showHome(){


if(!currentUser){

showConnection();

return;

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




function showMinorHome(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

Rejoindre une famille

</h2>


<p>

Vous pouvez rejoindre
une famille.

</p>


<button
class="primary-button"
onclick="showJoinFamily()">

REJOINDRE

</button>


</div>

`;


}




function showAdultHome(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

Rejoindre une famille

</h2>


<button
class="primary-button"
onclick="showJoinFamily()">

REJOINDRE

</button>


</div>


<div class="family-card">


<h2>

Créer une famille

</h2>


<button
class="primary-button"
onclick="showCreateFamily()">

CRÉER

</button>


</div>

`;


}




//------------------//
// FAMILLES
//------------------//


async function createFamily(){


const name =

document.getElementById(
"family-name"
).value.trim();


const password =

document.getElementById(
"family-create-password"
).value;


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


if(

!result.success

){

return;

}


currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"admin";


closePopup();


showHome();


}




async function joinFamily(){


const familyID =

document.getElementById(
"family-id"
).value.trim();


const password =

document.getElementById(
"family-password"
).value;


const result =

await callAPI(

"join-family",

{

familyID,

password,

userID:
currentUser.id

}

);


if(

!result.success

){

return;

}


currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"member";


closePopup();


showHome();


}




async function openFamily(){


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


showFamily();


}




async function leaveFamily(){


const result =

await callAPI(

"leave-family",

{

userID:
currentUser.id

}

);


if(

!result.success

){

return;

}


currentUser.familyID =

null;

currentUser.familyName =

null;

currentUser.role =

null;


showHome();


}//------------------//
// ACCUEIL
//------------------//


async function showHome(){


if(!currentUser){

showConnection();

return;

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




function showMinorHome(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

Rejoindre une famille

</h2>


<p>

Vous pouvez rejoindre
une famille.

</p>


<button
class="primary-button"
onclick="showJoinFamily()">

REJOINDRE

</button>


</div>

`;


}




function showAdultHome(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

Rejoindre une famille

</h2>


<button
class="primary-button"
onclick="showJoinFamily()">

REJOINDRE

</button>


</div>


<div class="family-card">


<h2>

Créer une famille

</h2>


<button
class="primary-button"
onclick="showCreateFamily()">

CRÉER

</button>


</div>

`;


}




//------------------//
// FAMILLES
//------------------//


async function createFamily(){


const name =

document.getElementById(
"family-name"
).value.trim();


const password =

document.getElementById(
"family-create-password"
).value;


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


if(

!result.success

){

return;

}


currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"admin";


closePopup();


showHome();


}




async function joinFamily(){


const familyID =

document.getElementById(
"family-id"
).value.trim();


const password =

document.getElementById(
"family-password"
).value;


const result =

await callAPI(

"join-family",

{

familyID,

password,

userID:
currentUser.id

}

);


if(

!result.success

){

return;

}


currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"member";


closePopup();


showHome();


}




async function openFamily(){


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


showFamily();


}




async function leaveFamily(){


const result =

await callAPI(

"leave-family",

{

userID:
currentUser.id

}

);


if(

!result.success

){

return;

}


currentUser.familyID =

null;

currentUser.familyName =

null;

currentUser.role =

null;


showHome();

}

//------------------//
// INVITATIONS
//------------------//


async function generateInvitation(){


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


if(

!result.success

){

return;

}


const link =

`${window.location.origin}/invitation.html?id=${result.id}`;


navigator.clipboard.writeText(
link
);


showMessage(

"Invitation créée",

"Le lien a été copié."

);


}




async function joinInvitation(
invitationID
){


const result =

await callAPI(

"join-invitation",

{

invitationID,

userID:
currentUser.id

}

);


if(

!result.success

){

return;

}


currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"member";


showHome();


}




//------------------//
// UTILITAIRES
//------------------//


function convertImage(file){


return new Promise(

(resolve)=>{


const reader =

new FileReader();


reader.onload = ()=>{


resolve(
reader.result
);


};


reader.readAsDataURL(
file
);


}


);


}




function generateColor(){


const colors = [

"#FF6B6B",
"#4D96FF",
"#FFD93D",
"#6BCB77",
"#845EF7",
"#FF922B",
"#00C2A8",
"#F06595"

];


return colors[

Math.floor(

Math.random()
*
colors.length

)

];


}




function showMessage(
title,
message
){


popupBackground.style.display =

"flex";


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




//------------------//
// EXPORTS
//------------------//


window.login =
login;

window.register =
register;

window.logout =
logout;

window.showHome =
showHome;

window.closePopup =
closePopup;

window.showProfile =
showProfile;

window.createFamily =
createFamily;

window.joinFamily =
joinFamily;

window.openFamily =
openFamily;

window.leaveFamily =
leaveFamily;

window.generateInvitation =
generateInvitation;

window.joinInvitation =
joinInvitation;




//------------------//
// PROFIL
//------------------//


if(

profileButton

){

profileButton.onclick = ()=>{


if(

currentUser

){

showProfile();

}


};


}//------------------//
// INVITATIONS
//------------------//


async function generateInvitation(){


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


if(

!result.success

){

return;

}


const link =

`${window.location.origin}/invitation.html?id=${result.id}`;


navigator.clipboard.writeText(
link
);


showMessage(

"Invitation créée",

"Le lien a été copié."

);


}




async function joinInvitation(
invitationID
){


const result =

await callAPI(

"join-invitation",

{

invitationID,

userID:
currentUser.id

}

);


if(

!result.success

){

return;

}


currentUser.familyID =

result.family.id;


currentUser.familyName =

result.family.name;


currentUser.role =

"member";


showHome();


}




//------------------//
// UTILITAIRES
//------------------//


function convertImage(file){


return new Promise(

(resolve)=>{


const reader =

new FileReader();


reader.onload = ()=>{


resolve(
reader.result
);


};


reader.readAsDataURL(
file
);


}


);


}




function generateColor(){


const colors = [

"#FF6B6B",
"#4D96FF",
"#FFD93D",
"#6BCB77",
"#845EF7",
"#FF922B",
"#00C2A8",
"#F06595"

];


return colors[

Math.floor(

Math.random()
*
colors.length

)

];


}




function showMessage(
title,
message
){


popupBackground.style.display =

"flex";


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




//------------------//
// EXPORTS
//------------------//


window.login =
login;

window.register =
register;

window.logout =
logout;

window.showHome =
showHome;

window.closePopup =
closePopup;

window.showProfile =
showProfile;

window.createFamily =
createFamily;

window.joinFamily =
joinFamily;

window.openFamily =
openFamily;

window.leaveFamily =
leaveFamily;

window.generateInvitation =
generateInvitation;

window.joinInvitation =
joinInvitation;




//------------------//
// PROFIL
//------------------//


if(

profileButton

){

profileButton.onclick = ()=>{


if(

currentUser

){

showProfile();

}


};


}
