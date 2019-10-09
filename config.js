const environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'ACbfff9f1164da13f39d6c53a5eeccb54c',
    'authToken': '14907cd4394326e5a52526b9a637ce3c',
    'fromPhone': '+18637222924'
  }
};

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'ACbfff9f1164da13f39d6c53a5eeccb54c',
    'authToken': '14907cd4394326e5a52526b9a637ce3c',
    'fromPhone': '+18637222924'
  }
};

// Determine which environment was passed as a comand-line argument
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ?
process.env.NODE_ENV.toLowerCase() : '';

// Check if passed env is correct
const envToExport = typeof(environments[currentEnv]) == 'object' ?
environments[currentEnv] : environments.staging;

module.exports = envToExport;
