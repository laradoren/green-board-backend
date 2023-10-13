import jwt from "jsonwebtoken";
export const isAuth = (ctx) => {
    let isAuth = false;

    const authHeader = ctx?.req?.headers?.authorization || '';
    if(!authHeader) {
        return {isAuth};
    }

    const token = authHeader.split(' ')[1];
    if(!token || token === '') {
        return {isAuth};
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'privatekey');
    } catch (error) {
        return {isAuth};
    }

    if(!decodedToken) {
        return {isAuth};
    }

    isAuth = true;

    return {isAuth, role: decodedToken.role}
}