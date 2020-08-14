const { Document } = require('yaml');
const { Pair, YAMLMap } = require('yaml/types');


class Kustomization extends Document {
  constructor(additionalContent) {
    super();
    this.directivesEndMarker = true;

    const contents = new YAMLMap();
    contents.add(new Pair('apiVersion', 'kustomize.config.k8s.io/v1beta1'));
    contents.add(new Pair('kind', 'Kustomization'));

    const resources = new Pair('resources', []);
    resources.spaceBefore = true;
    contents.add(resources);

    if (additionalContent) {
      Object.entries(additionalContent).forEach(([key, value]) => {
        const entry = new Pair(key, value);
        entry.spaceBefore = true;
        contents.add(entry);
      });
    };

    this.contents = contents;
    console.log(this.contents);
  };
};


module.exports = {
  Kustomization
};
