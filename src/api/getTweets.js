const AWS = require('aws-sdk');

const getTweetsFromDynamo = async () => {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'personal-account'});
    const dynamo = new AWS.DynamoDB();

    const params = {
        ExpressionAttributeValues: {
            ':u': {S: 'AdamSchefter'}
        },
        ExpressionAttributeNames:{
            "#us": 'user'
        },
        KeyConditionExpression: '#us = :u',
        ScanIndexForward: true,
        TableName: process.env.AWS_TABLE_NAME
    };

    try {
        const tweets = await dynamo.query(params).promise();
        return tweets.Items.map(AWS.DynamoDB.Converter.unmarshall)
    } catch (e) {
        console.log(e);
    }
};

const httpResponder = async () => {
    const tweets = await getTweetsFromDynamo();
    return {
        statusCode: 200,
        body: JSON.stringify(tweets),
    };
};

exports.handler = httpResponder;
