const AWS = require('aws-sdk');
const cloudfront = new AWS.CloudFront();

exports.handler = async (event:any) => {
  const distributionId = process.env.DISTRIBUTION_ID;
  
  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: '' + new Date().getTime(), // Unique string
      Paths: {
        Quantity: 1,
        Items: ['/*'],  // Invalidate all paths, modify as needed
      },
    },
  };

  try {
    const data = await cloudfront.createInvalidation(params).promise();
    console.log('Invalidation created:', data);
    return data;
  } catch (err) {
    console.error('Error creating invalidation:', err);
    throw err;
  }
};
