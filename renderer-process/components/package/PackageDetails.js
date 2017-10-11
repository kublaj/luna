import config from '../../../config';
import {remote, ipcRenderer} from 'electron';
import React from 'react';
import Loader from '../../common/Loader';
import {StaticList} from '../../common/Statics';
import {showMessageBox, makeRequest} from '../../../utils';

class PackageDetails extends React.Component {
  constructor(props) {
    super(props);
    this.install = this.install.bind(this);
    this.update = this.update.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.doAction = this.doAction.bind(this);
    this.onChangeVersion = this.onChangeVersion.bind(this);
  }
  doAction(e) {
    e.preventDefault();
    let target = e.currentTarget;
    let action = target.querySelector('span').innerHTML.toLowerCase();
    if (this[action]) {
      this[action]();
    }
    return false;
  }
  update() {
    let pkg = this.props.active;
    showMessageBox({
      action: 'UPDATE',
      name: pkg.name
    }, () => {
      ipcRenderer.send('update-package', {
        pkgName: pkg.name,
        scope: 'g'
      });
      this.props.toggleMainLoader(true)
    });
  }
  uninstall() {
    let pkg = this.props.active;
    showMessageBox({
      action: 'UNINSTALL',
      name: pkg.name
    }, () => {
      ipcRenderer.send('uninstall-package', {
        pkgName: pkg.name,
        scope: 'g'
      });
      this.props.toggleMainLoader(true);
    });
  }
  install() {
    let pkg = this.props.active,
      version;
    showMessageBox({
      action: 'INSTALL',
      name: pkg.name,
      version: version || 'latest'
    }, () => {
      ipcRenderer.send('install-package', {
        pkgName: pkg.name,
        scope: 'g',
        pkgVersion: version || 'latest'
      });
      this.props.toggleMainLoader(true);
    });
    return false;
  }
  onChangeVersion(e) {
    let target = e.currentTarget;
    let pkg = this.props.active;
    let version = target.value;

    if (version !== "0") {
      this.props.toggleMainLoader(true);
      ipcRenderer.send('view-by-version', {
        pkgName: pkg.name,
        pkgVersion: version
      });
    }
    return false;
  }
  componentDidUpdate(prevProps, prevState) {
    let pkg = this.props.active;
    if (pkg && pkg.name) {
      ipcRenderer.send('get-package', {
        pkgName: pkg.name,
        scope: 'g'
      });
    }
  }
  componentDidMount() {
    ipcRenderer.on('view-by-version-reply', (event, pkg) => {
      this.props.setActive(pkg, false);
    });
    // ipcRenderer.on('get-package-reply', (event, pkg) => {
    //   console.log(pkg);
    // });
  }
  componentWillUnMount() {
    ipcRenderer.removeAllListeners('view-by-version-reply');
  }
  render() {
    let pkg = this.props.active;
    if (!pkg) {
      return null;
    }
    return (
      <div className="package-details" ref="root">
        <div className="package-details__head">
          <div className="package-details__title">
            {pkg.name}&nbsp;
            <span className="label label-success">v{pkg.version}</span>
          </div>
          <div className="package-details__settings dropdown">
            <i className="fa fa-fw fa-cog dropdown-toggle" data-toggle="dropdown"></i>
            <ul className="dropdown-menu dropdown-menu-right">
              <li>
                <a href="#">
                  <span>Update</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="package-details__info">
          <div className="package-preview__props">
            <div className="package-preview__prop" title="author">
              <i className="fa fa-tags"></i>
              <span className="package-preview__author" title={pkg.author}>Author:&nbsp;{pkg.author}</span>
            </div>
            <div className="package-preview__prop">
              <i className="fa fa-flag"></i>
              <span className="package-preview__date" title={`v${pkg['dist-tags'].latest}`}>Latest:&nbsp;v{pkg['dist-tags'].latest}</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="selectVersion">
              <span>Select version</span>
            </label>
            <select onChange={this.onChangeVersion} className="form-control input-sm select-mini" ref="selectVersion">
              <option value="0">-</option>
              {pkg.versions.map((version, idx) => {
                return <option key={idx} value={version}>{version}</option>
              })}
            </select>
          </div>
          <div className="package-details__date"></div>
        </div>
        <div className="package-details__body">
          <Loader loading={this.props.isLoading}>
            <div className="package-details__text">{pkg.description}</div>
            <ul className="nav nav-tabs" role="tablist">
              <li className="dropdown pull-right tabdrop hide">
                <a className="dropdown-toggle" data-toggle="dropdown" href="#">
                  <i className="icon-align-justify"></i>
                  <b className="caret"></b>
                </a>
                <ul className="dropdown-menu"></ul>
              </li>
              <li className="active" role="presentation">
                <a href="#dependencies" aria-controls="dependencies" role="tab" data-toggle="tab" aria-expanded="true">Dependencies</a>
              </li>
              <li role="presentation">
                <a href="#devDependencies" aria-controls="devDependencies" role="tab" data-toggle="tab" aria-expanded="true">DevDependencies</a>
              </li>
              <li role="presentation">
                <a href="#maintainers" aria-controls="maintainers" role="tab" data-toggle="tab" aria-expanded="true">Contributors</a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane active" id="dependencies" role="tabpanel">
                <StaticList data={pkg.dependencies}/>
              </div>
              <div className="tab-pane" id="devDependencies" role="tabpanel">
                <StaticList data={pkg.devDependencies}/>
              </div>
              <div className="tab-pane" id="maintainers" role="tabpanel">
                <StaticList data={pkg.maintainers}/>
              </div>
            </div>

            <div className="package-details__tabs tab-wrap" style={{
              display: 'none'
            }}>
              <input id="tab1" type="radio" name="tabs" defaultChecked/>
              <label htmlFor="tab1">Dependencies</label>
              <input id="tab2" type="radio" name="tabs"/>
              <label htmlFor="tab2">DevDependencies</label>
              <input id="tab3" type="radio" name="tabs"/>
              <label htmlFor="tab3">Contributors</label>
              <section id="devDependencies-content"></section>
              <section id="dependencies-content">
                <StaticList data={pkg.dependencies}/>
              </section>
              <section id="contributors-content">
                <StaticList data={pkg.maintainers}/>
              </section>
            </div>
          </Loader>
        </div>
      </div>
    )
  }
}

export default PackageDetails;
