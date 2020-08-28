const { spawnSync } = require('child_process');
const { Secret } = require('./secret.js');
const { Document, parseDocument } = require('yaml');


class SealedSecret extends Document {
  constructor(name, namespace, cluster, entries) {
    const secret = new Secret(name, entries);
    const sealedsecret = kubeseal(
      secret.toString(),
      namespace,
      cluster
    );
    
    super(sealedsecret.toJSON());
    this.directivesEndMarker = true;
  };
};


function kubeseal(secret, namespace, cluster) {
  const certificate = `../kubernetes/utils/certs/sealedsecret/${cluster}.pem`;

  const ks = spawnSync(
    'kubeseal',
    [ '--cert', certificate,
      '--format', 'yaml',
      '--namespace', namespace
    ], 
    {input: secret}
  );

  if (ks.status != 0) {
    const error =  ks.stderr.toString();
    console.log(error);
    return process.exit(1);
  } else {
    parsed = parseDocument(ks.stdout.toString());
    return parsed;
  };

};


module.exports = {
  SealedSecret
};
