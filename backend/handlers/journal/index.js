
'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.JOURNAL_TABLE;

exports.handler = async (event) => {
  try {
    const method = (event.requestContext && event.requestContext.http && event.requestContext.http.method) || event.httpMethod || 'GET';
    if (method === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      if (!body || !body.userId || !body.journalId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'userId and journalId required' }) };
      }
      const item = {
        userId: String(body.userId),
        journalId: String(body.journalId),
        ts: Date.now(),
        ...body
      };
      await ddb.put({ TableName: TABLE, Item: item }).promise();
      return { statusCode: 201, body: JSON.stringify({ ok: true, item }) };
    }
    if (method === 'GET') {
      const q = (event.queryStringParameters || {});
      if (!q.userId || !q.journalId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'userId and journalId required' }) };
      }
      const res = await ddb.get({ TableName: TABLE, Key: { userId: String(q.userId), journalId: String(q.journalId) } }).promise();
      return { statusCode: 200, body: JSON.stringify({ ok: true, item: res.Item || null }) };
    }
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
