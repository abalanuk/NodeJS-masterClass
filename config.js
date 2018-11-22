const environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5
};

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5
};

// Determine which environment was passed as a comand-line argument
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ?
process.env.NODE_ENV.toLowerCase() : '';

// Check if passed env is correct
const envToExport = typeof(environments[currentEnv]) == 'object' ?
environments[currentEnv] : environments.staging;

module.exports = envToExport;
