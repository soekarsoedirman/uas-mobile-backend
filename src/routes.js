const db = require('./database');

const initRoutes = (server) => {
    server.route({
        method: 'GET',
        path: '/products',
        handler: async (request, h) => {
            try {
                // Query ke RDS
                const [rows] = await db.query('SELECT * FROM products');
                return h.response(rows).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Database error' }).code(500);
            }
        }
    });
};

module.exports = initRoutes;