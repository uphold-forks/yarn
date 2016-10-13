'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.requireLockfile = exports.noArguments = undefined;

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

let run = exports.run = (() => {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (config, reporter, flags, args) {
    const github = new GitHubApi({
      debug: false,
      protocol: 'https',
      host: 'api.github.com',
      headers: {
        'User-Agent': config.getOption('user-agent')
      },
      Promise,
      followRedirects: false,
      timeout: 5000
    });

    // while yarn is close sourced we need an auth token to be passed
    const githubAuth0Token = process.env.YARN_AUTH_TOKEN || process.env.KPM_AUTH_TOKEN;
    github.authenticate({
      type: 'oauth',
      token: githubAuth0Token
    });

    let release;
    const gitTag = args[0];
    if (gitTag) {
      release = yield github.repos.getReleaseByTag({
        user: (_constants || _load_constants()).GITHUB_USER,
        repo: (_constants || _load_constants()).GITHUB_REPO,
        tag: gitTag
      });
    } else {
      release = yield github.repos.getLatestRelease({
        user: (_constants || _load_constants()).GITHUB_USER,
        repo: (_constants || _load_constants()).GITHUB_REPO
      });
    }
    const assets = yield github.repos.listAssets({
      user: (_constants || _load_constants()).GITHUB_USER,
      repo: (_constants || _load_constants()).GITHUB_REPO,
      id: release.id
    });

    reporter.info(reporter.lang('selfUpdateDownloading', assets[0].name, release.tag_name));

    const thisVersionRoot = path.resolve(__dirname, '..', '..', '..');
    const isCurrentVersionAnUpdate = path.basename(path.resolve(thisVersionRoot, '..')) === (_constants || _load_constants()).SELF_UPDATE_DOWNLOAD_FOLDER;
    let updatesFolder;
    if (isCurrentVersionAnUpdate) {
      updatesFolder = path.resolve(thisVersionRoot, '..');
    } else {
      updatesFolder = path.resolve(thisVersionRoot, (_constants || _load_constants()).SELF_UPDATE_DOWNLOAD_FOLDER);
    }

    const locToUnzip = path.resolve(updatesFolder, release.tag_name);

    yield (0, (_fs || _load_fs()).unlink)(locToUnzip);

    const fetcher = new (_tarballFetcher || _load_tarballFetcher()).default(locToUnzip, {
      type: 'tarball',
      registry: 'npm',
      reference: `${ assets[0].url }?access_token=${ String(githubAuth0Token) }`,
      hash: null
    }, config, false);
    yield fetcher.fetch();

    // this links the downloaded release to bin/yarn.js
    yield (0, (_fs || _load_fs()).symlink)(locToUnzip, path.resolve(updatesFolder, 'current'));

    // clean garbage
    const pathToClean = path.resolve(updatesFolder, 'to_clean');
    if (yield (0, (_fs || _load_fs()).exists)(pathToClean)) {
      const previousVersionToCleanup = yield (0, (_fs || _load_fs()).realpath)(pathToClean);
      yield (0, (_fs || _load_fs()).unlink)(previousVersionToCleanup);
      yield (0, (_fs || _load_fs()).unlink)(pathToClean);
    }

    if (isCurrentVersionAnUpdate) {
      // current yarn installation is an update, let's clean it next time an update is run
      // because it may still be in use now
      yield (0, (_fs || _load_fs()).symlink)(thisVersionRoot, pathToClean);
    }

    reporter.success(reporter.lang('selfUpdateReleased', release.tag_name));
  });

  return function run(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.setFlags = setFlags;

var _constants;

function _load_constants() {
  return _constants = require('../../constants.js');
}

var _tarballFetcher;

function _load_tarballFetcher() {
  return _tarballFetcher = _interopRequireDefault(require('../../fetchers/tarball-fetcher.js'));
}

var _fs;

function _load_fs() {
  return _fs = require('../../util/fs.js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const path = require('path');
const GitHubApi = require('github');

function setFlags(commander) {
  // token needed because it is a private repo now
  commander.arguments('[tag]', 'e.g. v0.10.0');
}

const noArguments = exports.noArguments = false;
const requireLockfile = exports.requireLockfile = false;