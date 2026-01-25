import * as express from 'express';

// Redclare the express type request to have the clientID for the JWT short term token
declare global {
    namespace Express {
        interface Request {
            clientID?: string;
        }
    }
}