const server = {
  'local': 'http://127.0.0.1:8360/distributeAd/index',
  'production-pre': 'http://47.90.214.193:8360/distributeAd/index',
  // 'production': 'https://ad.weplayer.cc',
  'production': 'https://ad-dispatcher-test.weplayer.cc'
};

module.exports = (argv) => {
  const index = argv.indexOf('-s');
  let env;
  if (index !== -1) {
      env = argv[index + 1];
  } else {
      env = process.env.TALE_ENV;
  }
  return server[env];
};
