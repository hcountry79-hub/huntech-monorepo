
'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.PINS_TABLE;

exports.handler = async (event) => {
  try {
    const method = (event.requestContext && event.requestContext.http && event.requestContext.http.method) || event.httpMethod || 'GET';
    if (method === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      if (!body || !body.userId || !body.pinId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'userId and pinId required' }) };
      }
      const item = {
        userId: String(body.userId),
        pinId: String(body.pinId),
        lat: body.lat,
        lon: body.lon,
        category: body.category || 'general',
        ts: Date.now(),
        ...body
      };
      await ddb.put({ TableName: TABLE, Item: item }).promise();
      return { statusCode: 201, body: JSON.stringify({ ok: true, item }) };
    }
    if (method === 'GET') {
      const q = (event.queryStringParameters || {});
      if (!q.userId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'userId required' }) };
      }
      const res = await ddb.query({
        TableName: TABLE,
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': String(q.userId) }
      }).promise();
      return { statusCode: 200, body: JSON.stringify({ ok: true, items: res.Items || [] }) };
    }
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
