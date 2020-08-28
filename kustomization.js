const { Document } = require('yaml');
const { Pair, YAMLMap } = require('yaml/types');


class Kustomization extends Document {
  constructor(additionalContent) {
    const content = {
      apiVersion: 'kustomize.config.k8s.io/v1beta1',
      kind: 'Kustomization'
    };

    super(content);
    this.directivesEndMarker = true;

    const spacedEntries = {
      resources: [],
      ...additionalContent
    };
    for (let entry of Object.entries(spacedEntries)) {
      const pair = this.createPair(...entry);
      pair.spaceBefore = true;

      this.add(pair);
    };
  };
};


module.exports = {
  Kustomization
};
