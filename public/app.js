//------------------//
// CONSTANTES
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
// VARIABLES
//------------------//


let currentUser = null;

let currentFamily = null;

let currentRole = null;



//------------------//
// TEMPS
//------------------//


const WELCOME_TIME = 2000;



//------------------//
// DÉMARRAGE
//------------------//


window.onload = () =>{

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


try{


const user =

await getUser(
userID
);


if(!user){


localStorage.clear();

showConnection();

return;


}


currentUser = user;


updateHeader();


showHome();


}


catch(error){


showConnection();


}


}




//------------------//
// HEADER
//------------------//


function updateHeader(){


if(!currentUser){


accountID.textContent =

"Non connecté";


profileLetter.textContent =

"?";


return;


}


accountID.textContent =

currentUser.id;


if(currentUser.photo){


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

${currentUser.firstname[0]
.toUpperCase()}

</span>

`;


profileButton.style.background =

currentUser.color;


}


}




//------------------//
// CONNEXION
//------------------//


function showConnection(){


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


<button
class="primary-button"
onclick="login()">

Se connecter

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showRegister()">

Créer un compte

</button>


</div>

`;


}




//------------------//
// INSCRIPTION
//------------------//


function showRegister(){


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

Photo (optionnelle)

</p>


<input
id="register-picture"
type="file"
accept="image/*">


<button
class="primary-button"
onclick="register()">

Créer mon compte

</button>


<br>
<br>


<button
class="secondary-button"
onclick="showConnection()">

Retour

</button>


</div>

`;


}




//------------------//
// ACCUEIL
//------------------//


function showHome(){


if(!currentUser){


showConnection();

return;


}


if(currentUser.familyID){


showFamilyCard();

return;


}


if(currentUser.age < 18){


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
une famille.

</p>


<button
class="primary-button">

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


<button
class="primary-button">

REJOINDRE

</button>


</div>


<div class="family-card">


<h2>

Créer une famille

</h2>


<button
class="primary-button">

CRÉER

</button>


</div>

`;


}




//------------------//
// FAMILLE
//------------------//


function showFamilyCard(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

${currentUser.familyName}

</h2>


<p>

Votre famille

</p>


<button
class="primary-button">

OUVRIR

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



if(!id || !password){

return;

}


try{


const result =

await loginUser(
id,
password
);


if(!result.success){

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


catch(error){

console.error(error);

}


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


const picture =

document.getElementById(
"register-picture"
).files[0];



if(

!firstname ||

!age ||

!password

){

return;

}



try{


let pictureURL = null;


if(picture){


pictureURL =

await convertImage(
picture
);


}


const color =

generateColor();


const result =

await createUser({


firstname,

age,

password,

pictureURL,

color


});



if(!result.success){

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


catch(error){


console.error(error);


}


}




//------------------//
// DÉCONNEXION
//------------------//


function logout(){


localStorage.removeItem(

"coiffs-user-id"

);


currentUser = null;

currentFamily = null;

currentRole = null;


updateHeader();


showConnection();


}




//------------------//
// PHOTO
//------------------//


function convertImage(file){


return new Promise(


(resolve)=>{


const reader =

new FileReader();


reader.onload = () =>{


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




//------------------//
// COULEURS
//------------------//


function generateColor(){


const colors = [


"#FF6B6B",

"#4D96FF",

"#FFD93D",

"#6BCB77",

"#845EF7",

"#FF922B",

"#00C2A8",

"#F06595",

"#5C7CFA",

"#20C997"


];


const random =

Math.floor(


Math.random()
*
colors.length


);


return colors[random];


}




//------------------//
// PROFIL
//------------------//


profileButton.onclick = () =>{


if(!currentUser){

return;

}


showProfile();


};




function showProfile(){


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<div class="profile-menu">


<h2>

${currentUser.firstname}

</h2>


<p>

ID :

${currentUser.id}

</p>


<button
class="primary-button"
onclick="logout()">

Déconnexion

</button>


<button
class="secondary-button"
onclick="closePopup()">

Fermer

</button>


</div>

`;


}




//------------------//
// POP-UP
//------------------//


function closePopup(){


popupBackground.style.display =

"none";


popupContainer.innerHTML =

"";


}




popupBackground.onclick = (event)=>{


if(

event.target ===
popupBackground

){

closePopup();

}


};

//------------------//
// REJOINDRE
//------------------//


function showJoinFamily(){


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2
class="section-title">

Rejoindre une famille

</h2>


<p
class="small-title">

ID de la famille

</p>


<input
id="family-id"
type="number"
maxlength="10">


<p
class="small-title">

Mot de passe

</p>


<input
id="family-password"
type="password">


<button
class="primary-button"
onclick="joinFamily()">

Rejoindre

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

Annuler

</button>

`;


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



if(

!familyID ||

!password

){

return;

}



try{


const result =

await joinUserFamily(


currentUser.id,
familyID,
password


);



if(!result.success){

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


catch(error){


console.error(error);


}


}




//------------------//
// CRÉATION
//------------------//


function showCreateFamily(){


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2
class="section-title">

Créer une famille

</h2>


<p
class="small-title">

Nom de la famille

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


<button
class="primary-button"
onclick="createFamily()">

Créer

</button>


<br>
<br>


<button
class="secondary-button"
onclick="closePopup()">

Annuler

</button>

`;


}




async function createFamily(){


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

return;

}



try{


const result =

await createUserFamily({


name,

password,

userID:
currentUser.id


});



if(!result.success){

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


catch(error){


console.error(error);


}


}




//------------------//
// BOUTONS
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
// OUVRIR LA FAMILLE
//------------------//


async function openFamily(){


if(!currentUser.familyID){

return;

}


try{


currentFamily =

await getFamily(
currentUser.familyID
);


if(!currentFamily){

currentUser.familyID = null;

currentUser.familyName = null;

showHome();

return;

}


showFamily();


}


catch(error){

console.error(error);

}


}




//------------------//
// AFFICHAGE
//------------------//


function showFamily(){


let membersHTML = "";


currentFamily.members.forEach((member)=>{


membersHTML +=

`

<div class="member">


<div>

${
member.photo ?

`<img
class="profile-picture"
src="${member.photo}">`

:

`<div
class="profile-default"
style="background:${member.color};">

${member.firstname[0]
.toUpperCase()}

</div>`

}


</div>


<div class="member-information">


<p
class="member-name">

${member.firstname}

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


});



let adminButtons = "";


if(

currentUser.role ===
"admin"

){

adminButtons =

`

<div class="admin-buttons">


<button
class="yellow-button"
onclick="showInvitationSettings()">

INVITER

</button>


<button
class="secondary-button"
onclick="showKickMembers()">

EXPULSER

</button>


<button
class="secondary-button"
onclick="showTransferAdmin()">

TRANSFÉRER
L'ADMINISTRATION

</button>


<button
class="delete-button"
onclick="showDeleteFamily()">

SUPPRIMER
LA FAMILLE

</button>


</div>

`;


}




mainContainer.innerHTML =

`

<div class="family-card">


<h2>

${currentFamily.name}

</h2>


<p>

${currentFamily.members.length}
membres

</p>


</div>



<div class="list">


${membersHTML}


</div>


<br>


${adminButtons}


`;


}

//------------------//
// CARTE DE LA FAMILLE
//------------------//


function showFamilyCard(){


mainContainer.innerHTML =

`

<div class="family-card">


<h2>

${currentUser.familyName}

</h2>


<p>

Votre famille

</p>


<button
class="primary-button"
onclick="openFamily()">

OUVRIR

</button>


</div>

`;


}

//------------------//
// QUITTER UNE FAMILLE
//------------------//


async function leaveFamily(){


if(

!currentUser ||

!currentUser.familyID

){

return;

}


if(

currentUser.role ===
"admin"

){

return;

}


try{


await leaveUserFamily(

currentUser.id

);


currentUser.familyID =

null;


currentUser.familyName =

null;


currentUser.role =

null;


showHome();


}


catch(error){


console.error(error);


}


}




//------------------//
// RAFRAÎCHIR
//------------------//


async function refreshUser(){


if(!currentUser){

return;

}


const user =

await getUser(
currentUser.id
);


if(!user){

return;

}


currentUser = user;


updateHeader();


}

//------------------//
// SYNCHRONISATION
//------------------//


setInterval(()=>{


if(

currentUser

){

refreshUser();

}


},30000);

//------------------//
// INVITATIONS
//------------------//


function showInvitationSettings(){


popupBackground.style.display =

"flex";


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


<option value="10">

10 personnes

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



try{


const invitation =

await createInvitation({


familyID:

currentFamily.id,


adminID:

currentUser.id,


expiration,


limit


});



if(

!invitation.success

){

return;

}


const link =

`https://coiffs.vercel.app/join/${

invitation.id

}`;



popupContainer.innerHTML =

`

<h2
class="section-title">

Invitation créée

</h2>


<div
class="invitation-link">

${link}

</div>


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


catch(error){


console.error(error);


}


}




//------------------//
// COPIER
//------------------//


function copyInvitationLink(link){


navigator.clipboard.writeText(
link
);


}

//------------------//
// EXPULSION
//------------------//


function showKickMembers(){


let membersHTML = "";


currentFamily.members.forEach((member)=>{


if(

member.id ===
currentUser.id

){

return;

}



membersHTML +=

`

<div
class="member">


<div
class="member-information">


<p
class="member-name">

${member.firstname}

</p>


<p
class="member-role">

Membre

</p>


</div>


<button
class="delete-button"
onclick="kickMember(

'${member.id}'

)">

EXPULSER

</button>


</div>

`;


});



popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2
class="section-title">

Expulser un membre

</h2>


${membersHTML}


<br>


<button
class="secondary-button"
onclick="closePopup()">

FERMER

</button>

`;


}




async function kickMember(memberID){


try{


await removeFamilyMember(


currentFamily.id,

memberID


);


closePopup();


await openFamily();


}


catch(error){


console.error(error);


}


}

//------------------//
// SUPPRESSION
//------------------//


function showDeleteFamily(){


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2
class="section-title">

Supprimer
la famille

</h2>


<p>

Cette action est
définitive.

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


try{


await removeFamily(


currentFamily.id

);


currentFamily = null;


currentUser.familyID =

null;


currentUser.familyName =

null;


currentUser.role =

null;


closePopup();


showHome();


}


catch(error){


console.error(error);


}


}

//------------------//
// ADMINISTRATION
//------------------//


function showTransferAdmin(){


let membersHTML = "";


currentFamily.members.forEach((member)=>{


if(

member.id ===
currentUser.id

){

return;

}


membersHTML +=

`

<div class="member">


<div
class="member-information">


<p
class="member-name">

${member.firstname}

</p>


<p
class="member-role">

Membre

</p>


</div>


<button
class="yellow-button"
onclick="transferAdmin(

'${member.id}'

)">

TRANSFÉRER

</button>


</div>

`;


});


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2
class="section-title">

Transférer
l'administration

</h2>


${membersHTML}


<br>


<button
class="secondary-button"
onclick="closePopup()">

FERMER

</button>

`;


}




async function transferAdmin(
memberID
){


try{


await transferFamilyAdmin(


currentFamily.id,

currentUser.id,

memberID


);


currentUser.role =

"member";


closePopup();


await openFamily();


}


catch(error){


console.error(error);


}


}

//------------------//
// LIENS D'INVITATION
//------------------//


function joinInvitation(


familyID,
invitationID


){


if(!currentUser){


localStorage.setItem(


"coiffs-invitation",

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


try{


const result =

await joinInvitationFamily({


userID:

currentUser.id,


familyID,


invitationID


});



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


catch(error){


console.error(error);


}


}

//------------------//
// INVITATION EN ATTENTE
//------------------//


async function checkInvitation(){


const invitation =

localStorage.getItem(
"coiffs-invitation"
);


if(

!invitation ||

!currentUser

){

return;

}


const data =

JSON.parse(
invitation
);


await acceptInvitation(


data.familyID,

data.invitationID


);


localStorage.removeItem(

"coiffs-invitation"

);


}




//------------------//
// ACCUEIL
//------------------//


async function showHome(){


await checkInvitation();


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

//------------------//
// UTILITAIRES
//------------------//


function formatMembers(


number


){


if(number <= 1){


return "1 membre";


}


return `${number} membres`;


}




function isAdult(){


if(!currentUser){

return false;

}


return (

currentUser.age >= 18

);


}




function hasFamily(){


if(!currentUser){

return false;

}


return Boolean(

currentUser.familyID

);


}

//------------------//
// SÉCURITÉS
//------------------//


function validateFirstname(
firstname
){

return (

firstname.length >= 2 &&

firstname.length <= 25

);


}



function validatePassword(
password
){

return (

password.length >= 8

);


}



function validateAge(
age
){

return (

age >= 1 &&

age <= 120

);


}



function validateFamilyName(
name
){

return (

name.length >= 3 &&

name.length <= 30

);


}



function validateFamilyID(
id
){

return (

String(id).length === 10

);


}



//------------------//
// ÉTATS
//------------------//


function showLoading(){


const loadingScreen =

document.getElementById(
"loading-screen"
);


loadingScreen.style.display =

"flex";


}



function hideLoading(){


const loadingScreen =

document.getElementById(
"loading-screen"
);


loadingScreen.style.display =

"none";


}



//------------------//
// NOTIFICATIONS
//------------------//


function showMessage(
title,
message
){


popupBackground.style.display =

"flex";


popupContainer.innerHTML =

`

<h2
class="section-title">

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
// ACTUALISATION
//------------------//


async function refreshFamily(){


if(

!currentUser ||

!currentUser.familyID

){

return;

}


try{


currentFamily =

await getFamily(

currentUser.familyID

);


}


catch(error){


console.error(error);


}


}




//------------------//
// DÉCONNEXION
//------------------//


window.addEventListener(

"beforeunload",

()=>{


if(

popupBackground.style.display ===
"flex"

){

closePopup();

}


}


);




//------------------//
// VÉRIFICATIONS
//------------------//


function canCreateFamily(){


if(

!currentUser

){

return false;

}


if(

currentUser.age < 18

){

return false;

}


if(

currentUser.familyID

){

return false;

}


return true;


}



function canJoinFamily(){


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


return true;


}



function isAdmin(){


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
// MISE À JOUR
//------------------//


setInterval(


async()=>{


if(

currentUser

){

await refreshUser();

}


if(

currentFamily

){

await refreshFamily();

}


},

30000


);




//------------------//
// VERSION
//------------------//


const COIFFS_VERSION =

"1.0.0";

//------------------//
// INITIALISATION
//------------------//


document.addEventListener(

"DOMContentLoaded",

()=>{


if(

profileButton

){

profileButton.onclick = () =>{


if(

currentUser

){

showProfile();

}


};


}


}

);




//------------------//
// RÉINITIALISATION
//------------------//


function resetApplication(){


currentUser = null;

currentFamily = null;

currentRole = null;


localStorage.removeItem(

"coiffs-user-id"

);


localStorage.removeItem(

"coiffs-invitation"

);


updateHeader();


showConnection();


}




//------------------//
// INFORMATIONS
//------------------//


function getCurrentUser(){


return currentUser;


}



function getCurrentFamily(){


return currentFamily;


}



function getCurrentRole(){


return currentRole;


}




//------------------//
// UTILITAIRES
//------------------//


function generateAccountID(){


let id = "";


for(

let i = 0;

i < 10;

i++

){


id += Math.floor(

Math.random() * 10

);


}


return id;


}




function generateFamilyID(){


let id = "";


for(

let i = 0;

i < 10;

i++

){


id += Math.floor(

Math.random() * 10

);


}


return id;


}




function generateInvitationID(){


let id = "";


for(

let i = 0;

i < 10;

i++

){


id += Math.floor(

Math.random() * 10

);


}


return id;


}




//------------------//
// FORMATAGE
//------------------//


function capitalize(


text


){


if(!text){

return "";

}


return (


text.charAt(0)
.toUpperCase()

+

text.slice(1)
.toLowerCase()


);


}




function sanitizeText(


text


){


return text

.trim()

.replace(

/</g,

""

)

.replace(

/>/g,

""

);


}




//------------------//
// POP-UPS
//------------------//


function clearPopup(){


popupContainer.innerHTML =

"";


}




function openPopup(){


popupBackground.style.display =

"flex";


}




//------------------//
// VÉRIFICATIONS
//------------------//


function isConnected(){


return Boolean(

currentUser

);


}




function hasInvitation(){


return Boolean(

localStorage.getItem(

"coiffs-invitation"

)


);


}




//------------------//
// COMPATIBILITÉ
//------------------//


function isMobile(){


return /Android|iPhone|iPad/i

.test(

navigator.userAgent

);


}




//------------------//
// EXPORTS
//------------------//


window.showHome =

showHome;


window.logout =

logout;


window.closePopup =

closePopup;


window.showJoinFamily =

showJoinFamily;


window.showCreateFamily =

showCreateFamily;


window.openFamily =

openFamily;


window.showProfile =

showProfile;


window.leaveFamily =

leaveFamily;


window.showInvitationSettings =

showInvitationSettings;


window.showKickMembers =

showKickMembers;


window.showTransferAdmin =

showTransferAdmin;


window.showDeleteFamily =

showDeleteFamily;


window.login =

login;


window.register =

register;


window.joinFamily =

joinFamily;


window.createFamily =

createFamily;


window.copyInvitationLink =

copyInvitationLink;