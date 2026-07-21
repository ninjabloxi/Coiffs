//------------------//
// IMPORTS
//------------------//


import { MongoClient } from "mongodb";




//------------------//
// MONGODB
//------------------//


const client =

new MongoClient(

process.env.MONGODB_URI

);


await client.connect();


const database =

client.db(
"Coiffs"
);


const users =

database.collection(
"users"
);


const families =

database.collection(
"families"
);


const invitations =

database.collection(
"invitations"
);




//------------------//
// UTILITAIRES
//------------------//


function generateID(){


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




async function generateUserID(){


let id =

generateID();


while(

await users.findOne({

id

})

){


id =

generateID();


}


return id;


}




async function generateFamilyID(){


let id =

generateID();


while(

await families.findOne({

id

})

){


id =

generateID();


}


return id;


}




async function generateInvitationID(){


let id =

generateID();


while(

await invitations.findOne({

id

})

){


id =

generateID();


}


return id;


}




//------------------//
// API
//------------------//


export default async function handler(
request,
response
){

try{


if(

request.method !==
"POST"

){

return response

.status(405)

.json({

success:false

});


}


const {

action,
data

} = request.body;


const result =

await executeAction(

action,
data

);


return response

.status(200)

.json(

result

);


}


catch(error){


console.error(

error

);


return response

.status(500)

.json({

success:false,

message:
error.message

});


}


}

//------------------//
// COMPTES
//------------------//


async function createUser(data){


if(

!data.firstname ||

!data.password ||

!data.age

){

return{

success:false,

message:
"Informations invalides."

};

}


const id =

await generateUserID();


const user = {

id,

firstname:
String(
data.firstname
)
.trim(),

age:
Number(
data.age
),

password:
String(
data.password
),

photo:
data.pictureURL ||
null,

color:
data.color,

familyID:
null,

familyName:
null,

role:
null

};


await users.insertOne(
user
);


return{

success:true,

user

};


}




async function loginUser(data){


if(

!data.id ||

!data.password

){

return{

success:false,

message:
"Informations invalides."

};

}


const user =

await users.findOne({

id:
String(
data.id
),

password:
String(
data.password
)

});


if(!user){

return{

success:false,

message:
"Compte introuvable."

};

}


return{

success:true,

user

};


}




async function getUser(data){


if(

!data.id

){

return{

success:false

};

}


const user =

await users.findOne({

id:
String(
data.id
)

});


if(!user){

return{

success:false

};

}


return{

success:true,

user

};


}

//------------------//
// FAMILLES
//------------------//


async function createFamily(data){


if(

!data.name ||

!data.password ||

!data.userID

){

return{

success:false,

message:
"Informations invalides."

};

}


const user =

await users.findOne({

id:
String(
data.userID
)

});


if(!user){

return{

success:false,

message:
"Utilisateur introuvable."

};

}


if(

user.age < 18

){

return{

success:false,

message:
"Vous devez être majeur."

};

}


if(

user.familyID

){

return{

success:false,

message:
"Vous appartenez déjà à une famille."

};

}


const id =

await generateFamilyID();


const family = {


id,

name:
String(
data.name
).trim(),

password:
String(
data.password
),

adminID:
user.id,

members:[

{

id:
user.id,

firstname:
user.firstname,

photo:
user.photo,

color:
user.color,

role:
"admin"

}

]


};


await families.insertOne(
family
);


await users.updateOne(

{

id:
user.id

},

{

$set:{

familyID:
family.id,

familyName:
family.name,

role:
"admin"

}

}

);


return{

success:true,

family

};


}




//------------------//
// RÉCUPÉRATIONS
//------------------//


async function getFamily(data){


if(

!data.id

){

return{

success:false

};

}


const family =

await families.findOne({

id:
String(
data.id
)

});


if(!family){

return{

success:false

};

}


return{

success:true,

family

};


}

//------------------//
// REJOINDRE
//------------------//


async function joinFamily(data){


if(

!data.familyID ||

!data.password ||

!data.userID

){

return{

success:false,

message:
"Informations invalides."

};

}


const family =

await families.findOne({

id:
String(
data.familyID
)

});


if(!family){

return{

success:false,

message:
"Famille introuvable."

};

}


if(

family.password !==
String(
data.password
)

){

return{

success:false,

message:
"Mot de passe invalide."

};

}


const user =

await users.findOne({

id:
String(
data.userID
)

});


if(!user){

return{

success:false,

message:
"Utilisateur introuvable."

};

}


if(

user.familyID

){

return{

success:false,

message:
"Vous appartenez déjà à une famille."

};

}


const member = {

id:
user.id,

firstname:
user.firstname,

photo:
user.photo,

color:
user.color,

role:
"member"

};


await families.updateOne(

{

id:
family.id

},

{

$push:{

members:
member

}

}

);


await users.updateOne(

{

id:
user.id

},

{

$set:{

familyID:
family.id,

familyName:
family.name,

role:
"member"

}

}

);


return{

success:true,

family

};


}




//------------------//
// QUITTER
//------------------//


async function leaveFamily(data){


const user =

await users.findOne({

id:
String(
data.userID
)

});


if(

!user ||

!user.familyID

){

return{

success:false

};

}


if(

user.role ===
"admin"

){

return{

success:false,

message:
"L'administrateur ne peut pas quitter sa famille."

};

}


await families.updateOne(

{

id:
user.familyID

},

{

$pull:{

members:{

id:
user.id

}

}

}

);


await users.updateOne(

{

id:
user.id

},

{

$set:{

familyID:
null,

familyName:
null,

role:
null

}

}

);


return{

success:true

};


}

//------------------//
// INVITATIONS
//------------------//


async function createInvitation(data){


if(

!data.familyID ||

!data.adminID ||

!data.expiration ||

!data.limit

){

return{

success:false,

message:
"Informations invalides."

};

}


const id =

await generateInvitationID();


const invitation = {

id,

familyID:
String(
data.familyID
),

adminID:
String(
data.adminID
),

expiration:
String(
data.expiration
),

limit:
Number(
data.limit
),

uses:
0,

createdAt:
Date.now()

};


await invitations.insertOne(
invitation
);


return{

success:true,

id

};


}




async function getInvitation(data){


const invitation =

await invitations.findOne({

id:
String(
data.invitationID
)

});


if(!invitation){

return{

success:false

};

}


return{

success:true,

invitation

};


}




async function joinInvitation(data){


const invitation =

await invitations.findOne({

id:
String(
data.invitationID
)

});


if(!invitation){

return{

success:false,

message:
"Invitation inexistante."

};

}


if(

invitation.uses >=
invitation.limit

){

return{

success:false,

message:
"Invitation complète."

};

}


const family =

await families.findOne({

id:
invitation.familyID

});


const user =

await users.findOne({

id:
String(
data.userID
)

});


if(

!family ||

!user

){

return{

success:false

};

}


if(

user.familyID

){

return{

success:false,

message:
"Vous avez déjà une famille."

};

}


const member = {

id:
user.id,

firstname:
user.firstname,

photo:
user.photo,

color:
user.color,

role:
"member"

};


await families.updateOne(

{

id:
family.id

},

{

$push:{

members:
member

}

}

);


await invitations.updateOne(

{

id:
invitation.id

},

{

$inc:{

uses:1

}

}

);


await users.updateOne(

{

id:
user.id

},

{

$set:{

familyID:
family.id,

familyName:
family.name,

role:
"member"

}

}

);


return{

success:true,

family

};


}




//------------------//
// ROUTEUR FINAL
//------------------//


async function executeAction(
action,
data
){

switch(action){


case "create-user":

return await createUser(data);


case "login":

return await loginUser(data);


case "get-user":

return await getUser(data);


case "create-family":

return await createFamily(data);


case "get-family":

return await getFamily(data);


case "join-family":

return await joinFamily(data);


case "leave-family":

return await leaveFamily(data);


case "create-invitation":

return await createInvitation(data);


case "get-invitation":

return await getInvitation(data);


case "join-invitation":

return await joinInvitation(data);


default:


return{

success:false,

message:
"Action inconnue."

};


}


}

success:false,

message:
"Action inconnue."

};


}


}
