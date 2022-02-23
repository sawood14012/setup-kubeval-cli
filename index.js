const path = require('path');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { getDownloadObject } = require('./lib/utils');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');

    // Download the specific version of the tool, e.g. as a tarball/zipball
    const download = getDownloadObject(version);
    console.log(download)
    const pathToTarball = await tc.downloadTool(download.url);
    console.log(pathToTarball)

    // Extract the tarball/zipball onto host runner
    const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
    const pathToCLI = await extract(pathToTarball);

    // Expose the tool by adding it to the PATH
    console.log(path.join(pathToCLI, download.binPath));
    const pa = path.join(pathToCLI, download.binPath)
    core.addPath(path.join(pathToCLI, download.binPath));
    const { stdout, stderr } = await exec1(`cd ${pa} && ls -l`);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup

if (require.main === module) {
  setup();
}