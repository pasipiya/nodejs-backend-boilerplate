import config from "config";
import { Request, Response } from "express";
import { createSession, findSessions, updateSessions } from "../service/session.service";
import { validatePassword } from "../service/user.service";
import { signJwt, generateJWT } from "../utils/jwt.utils";

export async function genarateJWTHandler(req: Request, res: Response) {
    const keys = await generateJWT();
    
    try {
        return res.send(keys);
    } catch (error) {
        
    }
}

export async function createUserSessionHandler(req: Request, res: Response) {
    
    //validate the user's password
    const user = await validatePassword(req.body)

    if(!user){
        return res.status(401).send("Invalid email or Password");
    }

    // create session
    const session = await createSession(user._id, req.get("user-agent") || "");

    // create an access token

    const accessToken = signJwt(
        {...user, session: session._id},
        {expiresIn: config.get('accessTokenTtl')} // 15 minutes
    );

    //create a refresh token

    const refreshToken = signJwt(
        {...user, session: session._id},
        {expiresIn: config.get('refreshTokenTtl')} // 15 minutes
    );

    // return access & refresh tokens

    return res.send({accessToken, refreshToken});
}

export async function getUserSessionHandler(req: Request, res: Response) {
    const userId = res.locals.user._id;

    const sessions = await findSessions({user: userId, valid: true})

    return res.send(sessions);
}


export async function deleteUserSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session;

    await updateSessions({_id: sessionId} , {valid : false})

    return res.send({
        accessToken: null,
        refreshToken: null
    });
}