#!/usr/bin/env node

const { spawn } = require('child_process');
const { Command } = require('commander');
const { highlight } = require('cli-highlight');
const yaml = require('yaml');
const gitRoot = require('git-root');
const path = require('path');
const fs = require('fs');


const repoRoot = gitRoot();


const program = new Command();
program.storeOptionsAsProperties(false);

const build = program.command('build <directory>');
build
  .description('Build a specific directoy')
  .action((directory) => {
    const kustomize = spawn('kustomize', ['build', directory]);

    let output = '';

    kustomize.stdout.on('data', (data) => {
      output += data;
    });

    kustomize.stderr.on('data', (data) => {
      output += data;
    });

    kustomize.on('error', (error) => {
      console.log(error.message);
    });

    kustomize.on('close', () => {
      console.log(highlight(`${output}`, 'yaml'));
    });
  });

const create = program.command('create');
create
  .command('app <app> [namespaces...]')
  .description('Create a new application')
  .action((app, namespaces) => {
    const appDirectory = path.join(repoRoot, app);

    fs.mkdirSync(appDirectory);
    fs.mkdirSync(path.join(appDirectory, 'base'));
    fs.mkdirSync(path.join(appDirectory, 'overlays'));
    fs.mkdirSync(path.join(appDirectory, 'environments'));

    fs.writeFileSync(
      path.join(appDirectory, 'base', 'kustomization.yml'),
      yamlKustomization().toString()
    );

    if (namespaces) {
      namespaces.forEach((namespace) => {
        appNamespace(app, namespace);
      });
    };
  });

create
  .command('secret <name> [entries...]')
  .description('Output a new secret')
  .option('-ns, --namespace <namespace>', 'Which namespace')
  .action((name, entries, options) => {
    const { namespace } = options.opts();
    const secret = yamlSecret(name, entries, namespace);
    console.log(highlight(secret.toString(), 'yaml'));
  });

create
  .command('sealedsecret [entries...]')
  .description('Create a new sealedsecret in the specified location')
  .requiredOption('-n, --name <name>', 'The sealedsecret name')
  .requiredOption('-ns, --namespace <namespace>', 'Which namespace')
  .requiredOption('-a, --application <application>', 'Which ArgoCD application')
  .requiredOption('-e, --environment <environment>', 'Which environment/cluster')
  .action((entries, options) => {
    const { 
      environment,
      name,
      namespace,
      application
    } = options.opts();
    const certificate = path.join(
      repoRoot,
      '/utils/certs/sealedsecret/',
      `${environment}.pem`
    );

    const secret = yamlSecret(name, entries);

    const kubeseal = spawn('kubeseal', [
      '--cert', certificate,
      '--format', 'yaml',
      '--namespace', namespace
    ]);
    kubeseal.stdin.write(secret.toString());

    let output = '';
    kubeseal.stdout.on('data', (data) => {
      output += data;
    });

    kubeseal.stderr.on('data', (data) => {
      output += data;
    });

    kubeseal.on('error', (error) => {
      console.log(error.message);
    });

    kubeseal.on('close', () => {
      console.log(highlight(`${output}`, 'yaml'));
    });

    kubeseal.stdin.end();
  });


const update = program.command('update');

update
  .command('app <name>')
  .requiredOption(
    '--add-namespaces <namespaces...>',
    'Add new namespaces to an existing app'
  )
  .action((app, cmd) => {
    const { addNamespaces } = cmd.opts();

    addNamespaces.forEach((namespace) => {
      appNamespace(app, namespace);
    });
  });


program.parse(process.argv);


function appNamespace(app, namespace) {
  const directory = path.join(
    repoRoot,
    app,
    'environments',
    namespace
  );

  fs.mkdirSync(directory);
  fs.mkdirSync(path.join(directory, 'sealedsecrets'));

  const kustomization = yamlKustomization();
  kustomization.contents['namespace'] = namespace;
  kustomization.contents['commonLabels'] = {
    'app.kubernetes.io/part-of': app
  };
  kustomization.contents['configMapGenerator'] = [
    { name: `${app}-globals`,
      options: { disableNameSuffixHash: true },
      literals: []
    }
  ];

  fs.writeFileSync(
    path.join(directory, 'kustomization.yml'),
    kustomization.toString()
  );
};


function yamlSecret(name, entries, namespace) {
  const document = new yaml.Document();
  document.directivesEndMarker = true;
  document.contents = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: name,
    },
    type: 'Opaque',
    data: {}
  };

  if (namespace) {
    document.contents.metadata['namespace'] = namespace;
  }

  if (entries) {
    entries.forEach((entry) => {
      let [key, value] = entry.split('=');

      document.contents.data[key] = Buffer.from(value).toString('base64');
    });
  };

  return document;
};

function yamlKustomization() {
  const document = new yaml.Document();
  document.directivesEndMarker = true;
  document.contents = {
    apiVersion: 'kustomize.config.k8s.io/v1beta1',
    kind: 'Kustomization',
    resources: []
  };

  return document;
};


