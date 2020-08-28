const { Document } = require('yaml');

class Secret extends Document {
  constructor(name, entries) {
    let content = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: name,
      },
      type: 'Opaque',
      data: {}
    };

    if (entries) {
      entries.forEach((entry) => {
        const [key, value] = entry.split('=');
        const b64value = Buffer.from(value).toString('base64');

        content.data[key] = b64value;
      });
    };

    super(content);
    this.directivesEndMarker = true;
  };
};

module.exports = {
  Secret
};
