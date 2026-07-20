//------------------/
// ANIMATIONS
//------------------//


const ANIMATION_TIME =

300;


const WELCOME_ANIMATION =

500;


const SLIDE_DISTANCE =

30;




//------------------//
// FONDU
//------------------//


function fadeIn(


element


){


if(!element){

return;

}


element.animate(


[

{

opacity:0

},

{

opacity:1

}

],


{


duration:

ANIMATION_TIME,


fill:

"forwards",


easing:

"ease"


}


);


}




function fadeOut(


element


){


if(!element){

return;

}


return element.animate(


[

{

opacity:1

},

{

opacity:0

}

],


{


duration:

ANIMATION_TIME,


fill:

"forwards",


easing:

"ease"


}


);


}




//------------------//
// GLISSADE
//------------------//


function slideUp(


element


){


if(!element){

return;

}


element.animate(


[

{

opacity:0,

transform:

`translateY(

${SLIDE_DISTANCE}px

)`

},


{

opacity:1,

transform:

"translateY(0px)"

}


],


{


duration:

ANIMATION_TIME,


fill:

"forwards",


easing:

"ease-out"


}


);


}




function slideDown(


element


){


if(!element){

return;

}


element.animate(


[

{

opacity:1,

transform:

"translateY(0px)"

},


{

opacity:0,

transform:

`translateY(

${SLIDE_DISTANCE}px

)`


}


],


{


duration:

ANIMATION_TIME,


fill:

"forwards",


easing:

"ease-in"


}


);


}

//------------------//
// POP-UPS
//------------------//


function animatePopup(){


fadeIn(

popupBackground

);


slideUp(

popupContainer

);


}




function closePopupAnimation(){


fadeOut(

popupBackground

);


slideDown(

popupContainer

);


setTimeout(()=>{


closePopup();


},ANIMATION_TIME);


}

//------------------//
// CARTES
//------------------//


function animateCard(
element
){

if(!element){

return;

}


element.animate(

[

{

opacity:0,

transform:
"scale(0.97)"

},

{

opacity:1,

transform:
"scale(1)"

}

],


{

duration:

350,


fill:

"forwards",


easing:

"ease-out"

}


);


}




function animateCards(){


const cards =

document.querySelectorAll(
".card,.family-card"
);


cards.forEach((card,index)=>{


setTimeout(()=>{


animateCard(
card
);


},index * 100);


});


}




//------------------//
// BOUTONS
//------------------//


function animateButton(
element
){


if(!element){

return;

}


element.animate(

[

{

transform:
"scale(1)"

},

{

transform:
"scale(0.96)"

},

{

transform:
"scale(1)"

}

],


{

duration:

200,


fill:

"forwards",


easing:

"ease"

}


);


}




function initializeButtons(){


const buttons =

document.querySelectorAll(
"button"
);


buttons.forEach((button)=>{


button.addEventListener(

"click",

()=>{


animateButton(
button
);


}


);


});


}

//------------------//
// LISTES
//------------------//


function animateMembers(){


const members =

document.querySelectorAll(
".member"
);


members.forEach((member,index)=>{


setTimeout(()=>{


slideUp(
member
);


},index * 75);


});


}




//------------------//
// PAGE
//------------------//


function animatePage(){


fadeIn(
mainContainer
);


animateCards();


animateMembers();


initializeButtons();


}

//------------------//
// BIENVENUE
//------------------//


function animateWelcome(){


const title =

document.getElementById(
"welcome-title"
);


if(!title){

return;

}


title.animate(

[

{

opacity:0,

transform:
"translateY(25px)"

},

{

opacity:1,

transform:
"translateY(0px)"

}

],


{

duration:

WELCOME_ANIMATION,


fill:

"forwards",


easing:

"ease-out"

}


);


}




//------------------//
// CHARGEMENT
//------------------//


function animateLoading(){


const loading =

document.getElementById(
"loading-screen"
);


if(!loading){

return;

}


fadeIn(
loading
);


}




//------------------//
// OBSERVATEUR
//------------------//


const observer =

new MutationObserver(()=>{


animatePage();


});




document.addEventListener(

"DOMContentLoaded",

()=>{


if(mainContainer){


observer.observe(


mainContainer,


{


childList:true,


subtree:true


}


);


}


}


);




//------------------//
// EXPORTS
//------------------//


window.fadeIn =
fadeIn;


window.fadeOut =
fadeOut;


window.slideUp =
slideUp;


window.slideDown =
slideDown;


window.animatePopup =
animatePopup;


window.closePopupAnimation =
closePopupAnimation;


window.animateCard =
animateCard;


window.animateCards =
animateCards;


window.animateButton =
animateButton;


window.animateMembers =
animateMembers;


window.animatePage =
animatePage;


window.animateWelcome =
animateWelcome;


window.animateLoading =
animateLoading;
