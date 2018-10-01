const environments = {

}

// Staging (default) environment

environments.staging = {
  'port': 3000,
  'envName': 'staging'
};

environments.production = {
  'port': 5000,
  'envName': 'production'
};

// Determine which environment was passed as a comand-line argument
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ?
process.env.NODE_ENV.toLowerCase() : '';

// Check if passed env is correct
const envToExport = typeof(environments[currentEnv]) == 'object' ?
environments[currentEnv] : environments.staging;

module.exports = envToExport;
