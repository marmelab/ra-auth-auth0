const { expressjwt: jwt } = require('express-jwt');
const jsonServer = require('json-server');
const jwks = require('jwks-rsa');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors());

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    audience: `${process.env.AUTH0_AUDIENCE}`,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
});

server.use(jwtCheck);

server.use(middlewares);

server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running');
});
