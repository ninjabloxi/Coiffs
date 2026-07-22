import { MongoClient } from "mongodb";
import crypto from "crypto";

/**
 * Configuration globale
 */

const APPLICATION_NAME = "Coiffs API";
const DATABASE_NAME = "Coiffs";

const ERROR_CODES = {
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
    INVALID_REQUEST: "INVALID_REQUEST",
    INVALID_ACTION: "INVALID_ACTION",

    USER_INVALID_DATA: "USER_INVALID_DATA",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
    USER_ALREADY_IN_FAMILY: "USER_ALREADY_IN_FAMILY",

    FAMILY_INVALID_DATA: "FAMILY_INVALID_DATA",
    FAMILY_NOT_FOUND: "FAMILY_NOT_FOUND",
    FAMILY_ALREADY_EXISTS: "FAMILY_ALREADY_EXISTS",
    FAMILY_PERMISSION_DENIED: "FAMILY_PERMISSION_DENIED",

    INVITATION_INVALID_DATA: "INVITATION_INVALID_DATA",
    INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",
    INVITATION_EXPIRED: "INVITATION_EXPIRED",
    INVITATION_LIMIT_REACHED: "INVITATION_LIMIT_REACHED",

    DATABASE_ERROR: "DATABASE_ERROR",
    VALIDATION_ERROR: "VALIDATION_ERROR"
};


let mongoClient = null;
let mongoConnectionPromise = null;


/**
 * Logger avancé
 */

function createLog(level, event, details = {}) {
    return {
        application: APPLICATION_NAME,
        level,
        event,
        timestamp: new Date().toISOString(),
        details
    };
}


function logInfo(event, details = {}) {
    console.log(
        JSON.stringify(
            createLog(
                "INFO",
                event,
                details
            )
        )
    );
}


function logWarning(event, details = {}) {
    console.warn(
        JSON.stringify(
            createLog(
                "WARNING",
                event,
                details
            )
        )
    );
}


function logError(event, details = {}) {
    console.error(
        JSON.stringify(
            createLog(
                "ERROR",
                event,
                details
            )
        )
    );
}



/**
 * Gestion erreurs personnalisées
 */

class APIError extends Error {

    constructor(
        code,
        message,
        status = 400,
        details = {}
    ) {
        super(message);

        this.name = "APIError";
        this.code = code;
        this.status = status;
        this.details = details;
    }

}



function createError(
    code,
    message,
    status = 400,
    details = {}
) {

    return new APIError(
        code,
        message,
        status,
        details
    );

}



/**
 * Gestion variables environnement
 */

function getEnvironmentVariable(name) {

    const value = process.env[name];

    if (!value) {

        throw createError(
            ERROR_CODES.DATABASE_ERROR,
            `Variable environnement manquante : ${name}`,
            500
        );

    }

    return value.trim();

}



function getMongoURI() {

    return getEnvironmentVariable(
        "MONGODB_URI"
    );

}



/**
 * Connexion MongoDB optimisée Vercel
 */

async function connectMongo() {

    try {

        if (mongoClient) {

            return mongoClient;

        }


        if (mongoConnectionPromise) {

            return await mongoConnectionPromise;

        }


        const uri = getMongoURI();


        mongoConnectionPromise =
            MongoClient
                .connect(
                    uri,
                    {
                        maxPoolSize: 10,
                        minPoolSize: 1,
                        serverSelectionTimeoutMS: 5000,
                        connectTimeoutMS: 10000
                    }
                );


        mongoClient =
            await mongoConnectionPromise;


        logInfo(
            "MONGO_CONNECTED"
        );


        return mongoClient;


    } catch (error) {


        mongoConnectionPromise = null;
        mongoClient = null;


        logError(
            "MONGO_CONNECTION_FAILED",
            {
                message: error.message
            }
        );


        throw createError(
            ERROR_CODES.DATABASE_ERROR,
            "Impossible de se connecter à MongoDB",
            500
        );


    }

}



/**
 * Collections MongoDB
 */

async function getCollections() {

    const client =
        await connectMongo();


    const database =
        client.db(
            DATABASE_NAME
        );


    return {

        users:
            database.collection(
                "users"
            ),

        families:
            database.collection(
                "families"
            ),

        invitations:
            database.collection(
                "invitations"
            )

    };

}



/**
 * Utilitaires généraux
 */


function isObject(value) {

    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );

}



function cleanString(value) {

    if (
        typeof value !== "string"
    ) {

        return "";

    }


    return value
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}



function normalizeID(value) {

    return String(value || "")
        .trim();

}



function isValidID(value) {

    return /^[0-9]{10}$/.test(
        String(value)
    );

}



function now() {

    return Date.now();

}



/**
 * Génération identifiants sécurisés
 */


function generateSecureID() {

    return crypto
        .randomBytes(8)
        .toString("hex")
        .slice(0, 10);

}



async function generateUniqueID(
    collection
) {


    const MAX_ATTEMPTS = 50;


    for (
        let attempt = 0;
        attempt < MAX_ATTEMPTS;
        attempt++
    ) {


        const id =
            generateSecureID();



        const existing =
            await collection.findOne(
                {
                    id
                }
            );



        if (!existing) {

            return id;

        }

    }


    throw createError(
        ERROR_CODES.DATABASE_ERROR,
        "Impossible de générer un identifiant unique",
        500
    );

}



async function generateUserID(
    users
) {

    return await generateUniqueID(
        users
    );

}



async function generateFamilyID(
    families
) {

    return await generateUniqueID(
        families
    );

}



async function generateInvitationID(
    invitations
) {

    return await generateUniqueID(
        invitations
    );

}



/**
 * Validation générale
 */


function validateRequiredFields(
    object,
    fields
) {

    const missing = [];


    for (
        const field of fields
    ) {

        if (
            object[field] === undefined ||
            object[field] === null ||
            object[field] === ""
        ) {

            missing.push(field);

        }

    }


    return {

        valid:
            missing.length === 0,

        missing

    };

}



/**
 * Validateur prénom
 */


function validateFirstname(
    firstname
) {

    const value =
        cleanString(
            firstname
        );


    if (
        value.length < 2
    ) {

        return false;

    }


    if (
        value.length > 40
    ) {

        return false;

    }


    return /^[a-zA-ZÀ-ÿ\s-]+$/
        .test(value);

}



/**
 * Validateur âge
 */


function validateAge(
    age
) {

    const number =
        Number(age);


    if (
        Number.isNaN(number)
    ) {

        return false;

    }


    return (
        number >= 1 &&
        number <= 120
    );

}



/**
 * Validateur mot de passe
 */


function validatePassword(
    password
) {


    if (
        typeof password !== "string"
    ) {

        return false;

    }


    if (
        password.length < 4
    ) {

        return false;

    }


    if (
        password.length > 100
    ) {

        return false;

    }


    return true;

}



/**
 * Validateur couleur profil
 */


function validateColor(
    color
) {


    if (
        !color
    ) {

        return true;

    }


    return /^#[0-9A-Fa-f]{6}$/
        .test(
            color
        );

}



/**
 * Validateur photo
 */


function validatePictureURL(
    url
) {

    if (
        !url
    ) {

        return true;

    }


    return /^https?:\/\/.+/i
        .test(
            url
        );

}

/**
 * Validation payload utilisateur
 */

function validateUserPayload(data) {

    if (!isObject(data)) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "Les données utilisateur sont invalides."
        );

    }


    const required =
        validateRequiredFields(
            data,
            [
                "firstname",
                "password",
                "age"
            ]
        );


    if (!required.valid) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "Champs utilisateur manquants.",
            400,
            {
                missing:
                    required.missing
            }
        );

    }


    if (
        !validateFirstname(
            data.firstname
        )
    ) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "Prénom invalide."
        );

    }



    if (
        !validatePassword(
            String(data.password)
        )
    ) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "Mot de passe invalide."
        );

    }



    if (
        !validateAge(
            data.age
        )
    ) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "Âge invalide."
        );

    }



    if (
        !validateColor(
            data.color
        )
    ) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "Couleur invalide."
        );

    }



    if (
        !validatePictureURL(
            data.pictureURL
        )
    ) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "URL image invalide."
        );

    }


    return true;

}



/**
 * Validation famille
 */

function validateFamilyPayload(data) {


    if (!isObject(data)) {

        throw createError(
            ERROR_CODES.FAMILY_INVALID_DATA,
            "Données famille invalides."
        );

    }



    const required =
        validateRequiredFields(
            data,
            [
                "name",
                "password",
                "userID"
            ]
        );



    if (!required.valid) {

        throw createError(
            ERROR_CODES.FAMILY_INVALID_DATA,
            "Informations famille manquantes.",
            400,
            {
                missing:
                    required.missing
            }
        );

    }



    const name =
        cleanString(
            data.name
        );


    if (
        name.length < 2 ||
        name.length > 60
    ) {

        throw createError(
            ERROR_CODES.FAMILY_INVALID_DATA,
            "Nom famille invalide."
        );

    }



    if (
        !validatePassword(
            String(data.password)
        )
    ) {

        throw createError(
            ERROR_CODES.FAMILY_INVALID_DATA,
            "Mot de passe famille invalide."
        );

    }



    return true;

}



/**
 * Validation invitation
 */

function validateInvitationPayload(data) {


    if (!isObject(data)) {

        throw createError(
            ERROR_CODES.INVITATION_INVALID_DATA,
            "Invitation invalide."
        );

    }



    const required =
        validateRequiredFields(
            data,
            [
                "familyID",
                "adminID",
                "expiration",
                "limit"
            ]
        );



    if (!required.valid) {

        throw createError(
            ERROR_CODES.INVITATION_INVALID_DATA,
            "Données invitation incomplètes."
        );

    }



    if (
        Number(data.limit) < 1 ||
        Number(data.limit) > 100
    ) {

        throw createError(
            ERROR_CODES.INVITATION_INVALID_DATA,
            "Limite invitation invalide."
        );

    }


    return true;

}



/**
 * Nettoyage objets MongoDB
 */

function sanitizeUser(user) {


    if (!user) {

        return null;

    }


    const clone =
        {
            ...user
        };


    delete clone.password;


    return clone;

}



function createMemberFromUser(user, role) {


    return {

        id:
            user.id,

        firstname:
            user.firstname,

        photo:
            user.photo || null,

        color:
            user.color || "#ffffff",

        role

    };

}



/**
 * Vérification expiration invitation
 */


function isInvitationExpired(invitation) {


    if (!invitation.expiration) {

        return true;

    }


    const expiration =
        new Date(
            invitation.expiration
        )
        .getTime();



    if (
        Number.isNaN(expiration)
    ) {

        return true;

    }



    return (
        Date.now() >
        expiration
    );

}



/**
 * Vérification intégrité famille
 */


function verifyFamilyIntegrity(family) {


    const errors = [];



    if (
        !family.id
    ) {

        errors.push(
            "ID famille manquant"
        );

    }



    if (
        !Array.isArray(
            family.members
        )
    ) {

        errors.push(
            "Liste membres absente"
        );

    }



    if (
        family.members
    ) {


        const ids =
            new Set();



        for (
            const member of family.members
        ) {


            if (
                !member.id
            ) {

                errors.push(
                    "Membre sans ID"
                );

            }



            if (
                ids.has(
                    member.id
                )
            ) {

                errors.push(
                    "Doublon membre"
                );

            }


            ids.add(
                member.id
            );


        }

    }



    return {

        valid:
            errors.length === 0,

        errors

    };

}



/**
 * Diagnostics MongoDB
 */

async function databaseHealthCheck(
    collections
) {

    const result =
        {
            users: false,
            families: false,
            invitations: false
        };


    try {

        await collections.users
            .findOne({});

        result.users = true;


    } catch(error) {

        logError(
            "USERS_COLLECTION_ERROR",
            {
                message:
                    error.message
            }
        );

    }



    try {

        await collections.families
            .findOne({});

        result.families = true;


    } catch(error) {


        logError(
            "FAMILIES_COLLECTION_ERROR",
            {
                message:
                    error.message
            }
        );


    }



    try {

        await collections.invitations
            .findOne({});

        result.invitations = true;


    } catch(error) {


        logError(
            "INVITATIONS_COLLECTION_ERROR",
            {
                message:
                    error.message
            }
        );


    }



    return result;

}



/**
 * Recherche sécurisée utilisateur
 */

async function findUserByID(
    users,
    id
) {


    const cleanID =
        normalizeID(
            id
        );


    if (
        !cleanID
    ) {

        return null;

    }



    return await users.findOne(
        {
            id:
                cleanID
        }
    );

}



/**
 * Recherche sécurisée famille
 */

async function findFamilyByID(
    families,
    id
) {


    return await families.findOne(
        {
            id:
                normalizeID(
                    id
                )
        }
    );

}



/**
 * Service utilisateurs
 */


async function createUser(
    data,
    collections
) {


    validateUserPayload(
        data
    );


    const {
        users
    } = collections;



    const id =
        await generateUserID(
            users
        );



    const user =
        {

            id,

            firstname:
                cleanString(
                    data.firstname
                ),

            age:
                Number(
                    data.age
                ),

            password:
                String(
                    data.password
                ),

            photo:
                data.pictureURL || null,

            color:
                data.color || "#ffffff",

            familyID:
                null,

            familyName:
                null,

            role:
                null,

            createdAt:
                now(),

            updatedAt:
                now()

        };



    await users.insertOne(
        user
    );


    logInfo(
        "USER_CREATED",
        {
            id
        }
    );


    return {

        success:
            true,

        user:
            sanitizeUser(
                user
            )

    };

}

/**
 * Service connexion utilisateur
 */

async function loginUser(data, collections) {

    const {
        users
    } = collections;


    if (
        !data ||
        !data.id ||
        !data.password
    ) {

        throw createError(
            ERROR_CODES.USER_INVALID_DATA,
            "Identifiants manquants."
        );

    }


    const user =
        await users.findOne(
            {
                id:
                    normalizeID(data.id),
                password:
                    String(data.password)
            }
        );


    if (!user) {

        throw createError(
            ERROR_CODES.USER_NOT_FOUND,
            "Compte introuvable."
        );

    }


    logInfo(
        "USER_LOGIN",
        {
            id:
                user.id
        }
    );


    return {

        success:
            true,

        user:
            sanitizeUser(
                user
            )

    };

}



/**
 * Récupération utilisateur
 */

async function getUser(data, collections) {


    const user =
        await findUserByID(
            collections.users,
            data.id
        );


    if (!user) {

        throw createError(
            ERROR_CODES.USER_NOT_FOUND,
            "Utilisateur introuvable."
        );

    }


    return {

        success:
            true,

        user:
            sanitizeUser(
                user
            )

    };

}



/**
 * Création famille
 */

async function createFamily(data, collections) {


    validateFamilyPayload(
        data
    );


    const {
        users,
        families
    } = collections;


    const user =
        await findUserByID(
            users,
            data.userID
        );


    if (!user) {

        throw createError(
            ERROR_CODES.USER_NOT_FOUND,
            "Utilisateur absent."
        );

    }


    if (
        user.age < 18
    ) {

        throw createError(
            ERROR_CODES.FAMILY_PERMISSION_DENIED,
            "Utilisateur mineur."
        );

    }



    if (
        user.familyID
    ) {

        throw createError(
            ERROR_CODES.USER_ALREADY_IN_FAMILY,
            "Utilisateur déjà dans une famille."
        );

    }



    const id =
        await generateFamilyID(
            families
        );



    const family =
        {

            id,

            name:
                cleanString(
                    data.name
                ),

            password:
                String(
                    data.password
                ),

            adminID:
                user.id,

            members:
                [
                    createMemberFromUser(
                        user,
                        "admin"
                    )
                ],

            createdAt:
                now(),

            updatedAt:
                now()

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
            $set:
                {
                    familyID:
                        id,

                    familyName:
                        family.name,

                    role:
                        "admin",

                    updatedAt:
                        now()
                }
        }
    );


    return {

        success:
            true,

        family

    };

}



/**
 * Récupération famille
 */

async function getFamily(data, collections) {


    const family =
        await findFamilyByID(
            collections.families,
            data.id
        );


    if (!family) {

        throw createError(
            ERROR_CODES.FAMILY_NOT_FOUND,
            "Famille introuvable."
        );

    }



    const integrity =
        verifyFamilyIntegrity(
            family
        );


    return {

        success:
            true,

        family,

        integrity

    };

}



/**
 * Rejoindre famille
 */

async function joinFamily(data, collections) {


    const {
        users,
        families
    } = collections;


    const family =
        await findFamilyByID(
            families,
            data.familyID
        );


    if (!family) {

        throw createError(
            ERROR_CODES.FAMILY_NOT_FOUND,
            "Famille inexistante."
        );

    }



    if (
        family.password !==
        String(data.password)
    ) {

        throw createError(
            ERROR_CODES.FAMILY_PERMISSION_DENIED,
            "Mot de passe incorrect."
        );

    }



    const user =
        await findUserByID(
            users,
            data.userID
        );


    if (!user) {

        throw createError(
            ERROR_CODES.USER_NOT_FOUND,
            "Utilisateur inexistant."
        );

    }



    if (
        user.familyID
    ) {

        throw createError(
            ERROR_CODES.USER_ALREADY_IN_FAMILY,
            "Utilisateur déjà affilié."
        );

    }



    const member =
        createMemberFromUser(
            user,
            "member"
        );


    await families.updateOne(
        {
            id:
                family.id
        },
        {
            $push:
                {
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
            $set:
                {

                    familyID:
                        family.id,

                    familyName:
                        family.name,

                    role:
                        "member",

                    updatedAt:
                        now()

                }
        }
    );



    return {

        success:
            true,

        family

    };

}



/**
 * Quitter famille
 */

async function leaveFamily(data, collections) {


    const {
        users,
        families
    } = collections;



    const user =
        await findUserByID(
            users,
            data.userID
        );



    if (
        !user ||
        !user.familyID
    ) {

        throw createError(
            ERROR_CODES.FAMILY_NOT_FOUND,
            "Aucune famille."
        );

    }



    if (
        user.role === "admin"
    ) {

        throw createError(
            ERROR_CODES.FAMILY_PERMISSION_DENIED,
            "Un administrateur ne peut pas quitter."
        );

    }



    await families.updateOne(
        {
            id:
                user.familyID
        },
        {
            $pull:
                {
                    members:
                        {
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
            $set:
                {

                    familyID:
                        null,

                    familyName:
                        null,

                    role:
                        null,

                    updatedAt:
                        now()

                }
        }
    );


    return {
        success:
            true
    };

}



/**
 * Création invitation
 */

async function createInvitation(data, collections) {


    validateInvitationPayload(
        data
    );


    const id =
        await generateInvitationID(
            collections.invitations
        );



    const invitation =
        {

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
                data.expiration ||
                new Date(
                    Date.now() +
                    (30 * 24 * 60 * 60 * 1000)
                ).toISOString(),

            limit:
                Number(
                    data.limit
                ),

            uses:
                0,

            createdAt:
                now()

        };



    await collections.invitations.insertOne(
        invitation
    );


    return {

        success:
            true,

        id

    };

}



/**
 * Récupération invitation
 */

async function getInvitation(data, collections) {


    const invitation =
        await collections.invitations.findOne(
            {
                id:
                    String(data.invitationID)
            }
        );


    if (!invitation) {

        throw createError(
            ERROR_CODES.INVITATION_NOT_FOUND,
            "Invitation inconnue."
        );

    }



    return {

        success:
            true,

        invitation

    };

}

async function joinInvitation(data, collections) {

    const {
        users,
        families,
        invitations
    } = collections;


    if (
        !data ||
        !data.invitationID ||
        !data.userID
    ) {

        throw createError(
            ERROR_CODES.INVITATION_INVALID_DATA,
            "Informations invitation manquantes."
        );

    }


    const invitation =
        await invitations.findOne({
            id:
                String(data.invitationID)
        });


    if (!invitation) {

        throw createError(
            ERROR_CODES.INVITATION_NOT_FOUND,
            "Invitation inexistante."
        );

    }


    if (
        isInvitationExpired(invitation)
    ) {

        throw createError(
            ERROR_CODES.INVITATION_EXPIRED,
            "Invitation expirée."
        );

    }


    if (
        invitation.uses >= invitation.limit
    ) {

        throw createError(
            ERROR_CODES.INVITATION_LIMIT_REACHED,
            "Invitation complète."
        );

    }


    const family =
        await findFamilyByID(
            families,
            invitation.familyID
        );


    const user =
        await findUserByID(
            users,
            data.userID
        );


    if (!family || !user) {

        throw createError(
            ERROR_CODES.USER_NOT_FOUND,
            "Utilisateur ou famille introuvable."
        );

    }


    if (
        user.familyID
    ) {

        throw createError(
            ERROR_CODES.USER_ALREADY_IN_FAMILY,
            "Utilisateur déjà dans une famille."
        );

    }


    const member =
        createMemberFromUser(
            user,
            "member"
        );


    await families.updateOne(
        {
            id:
                family.id
        },
        {
            $push:
                {
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
            $inc:
                {
                    uses: 1
                }
        }
    );


    await users.updateOne(
        {
            id:
                user.id
        },
        {
            $set:
                {
                    familyID:
                        family.id,

                    familyName:
                        family.name,

                    role:
                        "member",

                    updatedAt:
                        now()
                }
        }
    );


    return {
        success:true,
        family
    };

}

//------------------//
// TOKENS
//------------------//


async function getTokenFamily(
token
){

return{

success:true,

family:{

id:"",
name:""

}

};

}



async function joinFamilyToken(

token,
userID

){

return{

success:true,

family:{

id:"",
name:""

}

};

}

async function executeAction(
    action,
    data,
    collections,
    rawBody
) {

    switch (action) {

        case "create-user":

            return await createUser(
                data,
                collections
            );


        case "login":

            return await loginUser(
                data,
                collections
            );


        case "get-user":

            return await getUser(
                data,
                collections
            );


        case "create-family":

            return await createFamily(
                data,
                collections
            );


        case "get-family":

            return await getFamily(
                data,
                collections
            );


        case "join-family":

            return await joinFamily(
                data,
                collections
            );


        case "leave-family":

            return await leaveFamily(
                data,
                collections
            );


        case "create-invitation":

            return await createInvitation(
                data,
                collections
            );


        case "get-invitation":

            return await getInvitation(
                data,
                collections
            );


        case "join-invitation":

            return await joinInvitation(
                data,
                collections
            );
            
        case "join-token":

            return await joinInvitation(
                 data,
                 collections
            );


        case "health-check":

            return {

                success:true,

                database:
                    await databaseHealthCheck(
                        collections
                    )

            };
            
            
        case "get-token-family":

            return await getTokenFamily(
                 data.token
            );


        case "join-family-token":

            return await joinFamilyToken(

                 data.token,
                 data.userID

            );


        default:

            logWarning(
                "UNKNOWN_ACTION",
                {
                    action
                }
            );


            return {

                success:false,

                code:
                    ERROR_CODES.INVALID_ACTION,

                message:
                    "Action inconnue.",

                receivedAction:
                    action || null,

                receivedBody:
                    rawBody || null

            };

    }

}

export default async function handler(
    request,
    response
) {

    try {

        // Vérification serveur via navigateur
        if (request.method === "GET") {

            try {

                const collections =
                    await getCollections();


                const health =
                    await databaseHealthCheck(
                        collections
                    );


                return response
                    .status(200)
                    .json({

                        online: true,

                        status:
                            "serveur en ligne",

                        database:
                            health,

                        timestamp:
                            new Date().toISOString()

                    });


            } catch(error) {


                return response
                    .status(503)
                    .json({

                        online:false,

                        status:
                            "serveur crash/hors ligne",

                        message:
                            error.message,

                        timestamp:
                            new Date().toISOString()

                    });

            }

        }


        if (request.method !== "POST") {

            return response
                .status(405)
                .json({

                    success:false,

                    message:
                        "Méthode non autorisée."

                });

        }


        const collections =
            await getCollections();


        const body =
            request.body || {};


        const action =
            body.action;


        const data =
            body.data || {};


        const result =
            await executeAction(
                action,
                data,
                collections,
                body
            );


        return response
            .status(200)
            .json(result);



    } catch(error) {


        logError(
            "API_FATAL_ERROR",
            {
                message:error.message
            }
        );


        return response
            .status(500)
            .json({

                online:false,

                status:
                    "serveur crash",

                message:
                    error.message

            });

    }

}
