export default {
  mode: "GLOBAL",
  directory: null,
  loading: false,
  showModal: false,
  runningNpmCommand: "",
  messages: [],
  cmdOptions: [],
  packages: {
    isLoading: false,
    total: 0,
    active: null,
    packages: [],
    outdated: [],
    actions: [
      {
        text: "Update",
        iconCls: "refresh"
      },
      {
        text: "Uninstall",
        iconCls: "trash"
      }
    ]
  },
  packageJSON: {
    license: null,
    author: "",
    name: "",
    dependencies: [],
    devDependencies: [],
    optionalDependencies: []
  }
};
