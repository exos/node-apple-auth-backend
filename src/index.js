
import fs from 'fs';
import util from 'util';
import {URL} from 'url';
import querystring from 'querystring';
import jwt from 'jsonwebtoken';
import request from 'request-promise-native';
import debugLib from 'debug';

const debug = debugLib('apple-auth-backend');
const readFile = util.promisify(fs.readFile);

export const ENDPOINT_URL = 'https://appleid.apple.com';

/**
 * Generate 32 bits timestamp
 * @return {int}
 */
export function getTimestamp() {
    return (Date.now() / 1000)|0;
}

/**
 * Resolve key input, if the key provided is an string, try to load as a
 * file
 * @param {string|Buffer} data
 * @return {Buffer}
 */
export async function resolveKey(data) {
    if (typeof data === 'string') {
        debug(`Key is a string, find by path`);
        return readFile(data);
    }

    return data;
}

/**
 * Generate the JWT signed token for apple auth
 * @param {object} options
 * @return {string} A JWT token
 */
export async function generateSecret(options = {}) {

    options = {
        timestamp: null,
        expire: 15777000,
        ...options,
    };

    const {
        clientId,
        teamId,
        keyId,
    } = options;

    const privateKey = await resolveKey(options.key);
    const now = options.timestamp === null ? getTimestamp() : options.timestamp;

    const header = {
        alg: 'ES256',
        kid: keyId,
    };

    const body = {
        aud: 'https://appleid.apple.com',
        iss: teamId,
        iat: now,
        exp: now + options.expire,
        sub: clientId,
    };

    return jwt.sign(body, privateKey, {
        algorithm: 'ES256',
        header,
    });
}

/**
 * Get the auth token to siging with back code
 * @param {string} code
 * @param {object} options
 * @return {object}
 */
export async function getAuthToken(code, options = {}) {
    const url = new URL(ENDPOINT_URL);
    url.pathname = '/auth/token';

    const {
        clientId,
    } = options;

    const clientSecret = await generateSecret(options);

    const body = {
        'client_id': clientId,
        'client_secret': clientSecret,
        code,
        'grant_type': 'authorization_code',
    };

    const qa = querystring.stringify(body);

    const textresponse = await request({
        headers: {
            'Content-Length': qa.length,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        url: url.toString(),
        method: 'POST',
        body: qa,
    });

    const response = JSON.parse(textresponse);
    response.data = jwt.decode(response['id_token']);

    return response;
}
