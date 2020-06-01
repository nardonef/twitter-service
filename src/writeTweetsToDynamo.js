const Twitter = require('twitter');
const AWS = require('aws-sdk');
const _ = require('lodash');

const getTweets = async () => {
    const twitterClient = new Twitter({
        consumer_key: 'KAAhkcEZXLlKMqUgysZtzdDnt',
        consumer_secret: 'J2J5UUUwQJRpr9RJNLAWZE7gMcFCGh36vpvyLv3dramv7N5opp',
        access_token_key: '1170513392190337024-y8qbRPrPXgcjusNQ5tG7kwXCP7VZSN',
        access_token_secret: 'uHCoFh7dWh85UHXLhDgz0sEHB6riE1QvIlis8A2IKxLeT'
    });

    const twitterAccounts = ['32BeatWriters'];
    const params = {screen_name: 'AdamSchefter'};
    return await twitterClient.get('statuses/user_timeline', params);
};

const formatTweets = (tweets) => {
    const items = _.map(tweets, (tweet) => {
        const date = new Date(_.get(tweet, 'created_at', null),);

        return {
            PutRequest: {
                Item: AWS.DynamoDB.Converter.marshall({
                    id: _.get(tweet, 'id', null),
                    created_at: date.getTime(),
                    user: _.get(tweet, 'user.screen_name', null),
                    profile_image: _.get(tweet, 'user.profile_image_url_https', null),
                    text: _.get(tweet, 'text', null),
                })
            }
        }
    });

    return {
        RequestItems: {
            [process.env.AWS_TABLE_NAME]: items
        },
    };
};

const saveToDynamo = async (items) => {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'personal-account'});
    const dynamo = new AWS.DynamoDB();

    try {
        return await dynamo.batchWriteItem(items).promise();
    } catch (e) {
        console.log(e);
    }
};

const main = async () => {
    const tweets = await getTweets();
    console.log(tweets);
    const formattedTweets = formatTweets(tweets);
    await saveToDynamo(formattedTweets);
};

exports.handler = main;
