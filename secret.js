const { Document } = require('yaml');

class Secret extends Document {
  constructor(name, entries, namespace) {
    super();
    this.directivesEndMarker = true;
    this.contents = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: name,
      },
      type: 'Opaque',
      data: {}
    };

    if (namespace) {
      this.contents.metadata['namespace'] = namespace;
    };

    if (entries) {
      entries.forEach((entry) => {
        let [key, value] = entry.split('=');

        this.contents.data[key] = Buffer.from(value).toString('base64');
      });
    };
  };
};

module.exports = {
  Secret
};
