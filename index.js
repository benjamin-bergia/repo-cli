#!/usr/bin/env node

const { spawnSync } = require('child_process');
const { Command } = require('commander');
const { highlight } = require('cli-highlight');
const yaml = require('yaml');
const gitRoot = require('git-root');
const path = require('path');
const fs = require('fs');
const { Secret } = require('./secret.js');
const { SealedSecret } = require('./sealedsecret.js');
const { Kustomization } = require('./kustomization.js');
const { KubeConfig } = require('./kube-config.js');


const repoRoot = gitRoot();


const program = new Command();
program.storeOptionsAsProperties(false);

const build = program.command('build <directory>');
build
  .description('Build a specific directoy')
  .action((directory) => {
    const k = spawnSync(
      'kustomize',
      ['build', directory]);

    if (k.status != 0) {
      const error =  k.stderr.toString();
      console.log(error);
      return process.exit(1);

    } else {
      const output = k.stdout.toString();
      console.log(
        highlight(`${output}`, 'yaml')
      );
    };
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

    const kustomization = new Kustomization()
    fs.writeFileSync(
      path.join(appDirectory, 'base', 'kustomization.yml'),
      kustomization.toString()
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
    const secret = new Secret(name, entries, namespace);
    console.log(highlight(secret.toString(), 'yaml'));
  });

create
  .command('sealedsecret [entries...]')
  .description('Create a new sealedsecret in the specified location')
  .requiredOption('-n, --name <name>', 'The sealedsecret name')
  .requiredOption('-ns, --namespace <namespace>', 'Which namespace')
  .requiredOption('-a, --application <application>', 'Which ArgoCD application')
  .requiredOption('-c, --cluster <cluster>', 'Which cluster')
  .action((entries, options) => {
    const { 
      cluster,
      name,
      namespace,
      application
    } = options.opts();
      const sealedsecret = new SealedSecret(
        name, namespace, cluster, entries
      );

      console.log(
        highlight(sealedsecret.toString(), 'yaml')
      );
  });


create
  .command('kube-config <tokens...>')
  .description('Output a new kube/config file.')
  .action((tokens) => {
    const config = new KubeConfig(tokens);

    console.log(
      highlight(config.toString(), 'yaml')
    );
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

update
  .command('sealedsecret <cluster> <file> <entries...>')
  .action((cluster, file, entries) => {
    const update = new Secret('update', entries);

    const output = kubeseal(
      cluster,
      update.toString(),
      ['--merge-into', file]
    ); 

    console.log(`${file} has been updated.`);
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

  const kustomization = new Kustomization({
    namespace: namespace,
    commonLabels: {
      'app.kubernetes.io/part-of': app
    },
    configMapGenerator: {
      name: `${app}-globals`,
      options: { disableNameSuffixHash: true },
      literals: []
    }
  });

  fs.writeFileSync(
    path.join(directory, 'kustomization.yml'),
    kustomization.toString()
  );
};


function run(cmd, args, options) {
    const ks = spawnSync(
      cmd,
      args,
      options
    );

    if (ks.status != 0) {
      const error =  k.stderr.toString();
      console.log(error);
      return process.exit(1);

    } else {
      const output = ks.stdout.toString();
       return `${output}`;
    };
};

function kubeseal(cluster, input, args) {
  const certificate = `../kubernetes/utils/certs/sealedsecret/${cluster}.pem`;

  run('kubeseal',
      [ '--cert', certificate,
        '--format', 'yaml'
      ].concat(args),
      {input: input}
  ); 
};
