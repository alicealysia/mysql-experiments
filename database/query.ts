import mysql from 'promise-mysql';

const connectionOptions = {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    database: process.env.SQL_DB,
    password: process.env.SQL_PW,
    port: process.env.SQL_PORT
};

let privateConnection: mysql.Connection;
const getConnection = async () => {
    if (!privateConnection) {
        const newConnection = await mysql.createConnection(connectionOptions)
        privateConnection = newConnection;
    }
    return privateConnection;
};

export const query_mysql = async (query: string, values?: any) => {
    const connection = await getConnection();
    if (!values) {
        return connection.query(query);
     }
     return connection.query(query, values);
}

export const startTransaction = async () => {
    const connection = await getConnection();
    return connection.beginTransaction();
}

export const endTransaction = async () => {
    const connection = await getConnection();
    return connection.commit();
}
