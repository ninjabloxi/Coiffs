//------------------//
// COIFFS DATABASE API
//------------------//


async function apiRequest(endpoint, data = {}){


const response = await fetch(
"/api/" + endpoint,
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

}
);


return await response.json();


}




//------------------//
// UTILISATEURS
//------------------//


async function createUser(user){


return await apiRequest(
"create-user",
user
);


}



async function getUser(id){


return await apiRequest(
"get-user",
{
id
}
);


}



async function loginUser(id,password){


return await apiRequest(
"login",
{
id,
password
}
);


}



//------------------//
// FAMILLES
//------------------//


async function createUserFamily(data){


return await apiRequest(
"create-family",
data
);


}



async function joinUserFamily(
userID,
familyID,
password
){


return await apiRequest(
"join-family",
{

userID,

familyID,

password

}
);


}



async function getFamily(id){


return await apiRequest(
"get-family",
{
id
}
);


}



async function leaveUserFamily(userID){


return await apiRequest(
"leave-family",
{
userID
}
);


}



//------------------//
// ADMIN
//------------------//


async function removeFamilyMember(
familyID,
memberID
){


return await apiRequest(
"kick-member",
{

familyID,

memberID

}
);


}



async function removeFamily(
familyID
){


return await apiRequest(
"delete-family",
{
familyID
}
);


}



async function transferFamilyAdmin(
familyID,
oldAdmin,
newAdmin
){


return await apiRequest(
"transfer-admin",
{

familyID,

oldAdmin,

newAdmin

}
);


}



//------------------//
// INVITATIONS
//------------------//


async function createInvitation(data){


return await apiRequest(
"create-invitation",
data
);


}



async function joinInvitationFamily(data){


return await apiRequest(
"join-invitation",
data
);


}
