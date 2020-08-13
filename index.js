#!/usr/bin/env node

const { spawn } = require('child_process');
const { Command } = require('commander');
const { highlight } = require('cli-highlight');
const yaml = require('yaml');
const gitRoot = require('git-root');
const path = require('path');


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
  .command('app')
  .action(() => {
    console.log('app');
  });

create
  .command('secret <name> [entries...]')
  .description('Output a new secreti')
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
    const repoRoot = gitRoot();
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

program.parse(process.argv);


function yamlSecret(name, entries, namespace) {
  const secret = new yaml.Document();
  secret.directivesEndMarker = true;
  secret.contents = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: name,
    },
    type: 'Opaque',
    data: {}
  };

  if (namespace) {
    secret.contents.metadata['namespace'] = namespace;
  }

  if (entries) {
    entries.forEach((entry) => {
      let [key, value] = entry.split('=');

      secret.contents.data[key] = Buffer.from(value).toString('base64');
    });
  };

  return secret;
};
