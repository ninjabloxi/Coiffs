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

} =

request.body;



switch(action){


case "ping":

return response

.status(200)

.json({


success:true


});


case "server-version":

return response

.status(200)

.json({


success:true,


version:

"1.0.0"


});


default:


return response

.status(400)

.json({


success:false,


message:

"Action inconnue."


});


}


}

//------------------//
// COMPTES
//------------------//


async function createUser(data){

    const id =

    await generateUserID();


    const user = {

        id,

        firstname:
        data.firstname,

        age:
        data.age,

        password:
        data.password,

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


    return {

        success:true,

        user

    };


}




async function loginUser(data){


    const user =

    await users.findOne({

        id:
        data.id,

        password:
        data.password

    });


    if(!user){

        return {

            success:false,

            message:
            "Compte introuvable."

        };

    }


    return {

        success:true,

        user

    };


}




async function getUser(data){


    const user =

    await users.findOne({

        id:
        data.id

    });


    if(!user){

        return {

            success:false

        };

    }


    return {

        success:true,

        user

    };


}




//------------------//
// FAMILLES
//------------------//


async function createFamily(data){


    const id =

    await generateFamilyID();


    const user =

    await users.findOne({

        id:
        data.userID

    });


    if(!user){

        return {

            success:false

        };

    }


    const family = {

        id,

        name:
        data.name,

        password:
        data.password,

        adminID:
        data.userID,

        members:[

            {

                id:
                data.userID,

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
            data.userID

        },

        {

            $set:{

                familyID:
                id,

                familyName:
                data.name,

                role:
                "admin"

            }

        }

    );


    return {

        success:true,

        family

    };


}

//------------------//
// RÉCUPÉRATIONS
//------------------//


async function getFamily(data){


    const family =

    await families.findOne({

        id:
        data.familyID

    });


    if(!family){

        return {

            success:false

        };

    }


    return {

        success:true,

        family

    };


}

//------------------//
// REJOINDRE
//------------------//


async function joinFamily(data){


    const family =

    await families.findOne({

        id:
        data.familyID

    });


    if(!family){

        return {

            success:false,

            message:
            "Famille introuvable."

        };

    }


    if(

        family.password !==
        data.password

    ){

        return {

            success:false,

            message:
            "Mot de passe invalide."

        };

    }


    const user =

    await users.findOne({

        id:
        data.userID

    });


    if(!user){

        return {

            success:false

        };

    }


    if(user.familyID){

        return {

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


    return {

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
        data.userID

    });


    if(

        !user ||

        !user.familyID

    ){

        return {

            success:false

        };

    }


    if(

        user.role ===
        "admin"

    ){

        return {

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


    return {

        success:true

    };


}




//------------------//
// INVITATIONS
//------------------//


async function createInvitation(data){


    const id =

    await generateInvitationID();


    const invitation = {

        id,

        familyID:
        data.familyID,

        adminID:
        data.adminID,

        expiration:
        data.expiration,

        limit:
        data.limit,

        uses:
        0,

        createdAt:
        Date.now()

    };


    await invitations.insertOne(
        invitation
    );


    return {

        success:true,

        id

    };


}




async function getInvitation(data){


    const invitation =

    await invitations.findOne({

        id:
        data.invitationID

    });


    if(!invitation){

        return {

            success:false

        };

    }


    return {

        success:true,

        invitation

    };


}

//------------------//
// INVITATIONS
//------------------//


async function joinInvitation(data){


    const invitation =

    await invitations.findOne({

        id:
        data.invitationID

    });


    if(!invitation){

        return {

            success:false,

            message:
            "Invitation inexistante."

        };

    }



    if(

        invitation.expiration !==
        "never"

    ){


        let time = 0;


        if(
            invitation.expiration === "24h"
        ){

            time =
            24 * 60 * 60 * 1000;

        }


        if(
            invitation.expiration === "7d"
        ){

            time =
            7 * 24 * 60 * 60 * 1000;

        }


        if(
            invitation.expiration === "30d"
        ){

            time =
            30 * 24 * 60 * 60 * 1000;

        }


        if(

            Date.now() >

            invitation.createdAt + time

        ){

            return {

                success:false,

                message:
                "Invitation expirée."

            };

        }


    }




    if(

        invitation.uses >=
        invitation.limit

    ){

        return {

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
        data.userID

    });



    if(

        !family ||

        !user

    ){

        return {

            success:false

        };

    }




    if(user.familyID){

        return {

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





    return {


        success:true,


        family


    };


}






//------------------//
// ROUTEUR FINAL
//------------------//


export async function executeAction(


action,
data


){



switch(action){



case "create-user":

return await createUser(data);



case "login-user":

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


return {


success:false,


message:
"Action inconnue."


};



}



}