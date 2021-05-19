import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import { Logger } from '../logger';

const logger = Logger('auth-tsoa')

const jwtCheck = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWKS_URL
})

const verifyJWT = jwt({ 
    secret: jwtCheck, 
    algorithms: ['RS256'], 
    credentialsRequired: true, 
    requestProperty: 'oauth_user', 
    getToken: (req) => ('x-forwarded-access-token' in req.headers) ? req.headers['x-forwarded-access-token'] : null
})

export function expressAuthentication(request: any, securityName: string, scopes?: string[]): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
        verifyJWT(request, null, ((err:any) => {
            if (err) {
                logger.debug("ERROR Verifying jWT " + err)
                return reject(err)
            } else {
                logger.debug("RESOLVED %j", request.oauth_user)
                // Check if JWT contains all required scopes
                const tokenScopes = request.oauth_user.scope.split(' ')
                logger.debug("Token Scopes = %s", tokenScopes)
                for (let scope of scopes) {
                    if (!tokenScopes.includes(scope)) {
                        reject(new Error("JWT does not contain required scope."));
                    }
                }                
                return resolve(request.oauth_user)
            }
        }))
    })
}
