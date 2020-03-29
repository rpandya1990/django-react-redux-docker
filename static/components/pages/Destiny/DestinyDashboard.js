import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import _ from "lodash"
import {
    addTestCase,
    addTestResult,
    bulkImportSystemTestCase,
    bulkImportSystemTestResult,
    deleteTestCase,
    deleteTestResult,
    getBranches,
    getProducts,
    getRepositories,
    getTestCases,
    getTestCategoryList,
    getTestFrameworkList,
    getTestResults,
    getTestStatusList,
    getTriageResolutionList,
    getTriageStatusList,
    getUsers,
    getVersions,
    updateTestCase,
    updateTestResult
} from "../../../actions/destinyDashboard";
import TopSelect from "../../reusable/TopSelect";
import NavTab from "../../reusable/NavTab";
import TestCaseTable from "./TestCaseTable";
import TestResultTable from "./TestResultTable";
import Loader from "../../reusable/Loader";
import "../../../css/DestinyDashboard.css"
import axios from "axios";
import {DESTINY_VERIFY_TEST_CASE_ENDPOINT} from "../../../api/endpoints";
import {getCookie} from "../../../utils";
import * as PropTypes from "prop-types";
import {enqueueSnackbar} from "../../../actions/generalData";


const SEARCH_PARAMS = {};

class DestinyDashboard extends Component {
    constructor(props) {
        super(props);

        this.tabs = ["Test Cases", "Test Results"];

        this.state = {
            selectedTab: 0,
        };
    }

    componentDidMount() {
        this.initSearchParams();

        this.fetchUsers();
        this.fetchRepositories();
        this.fetchProducts();
        this.fetchBranches();
        this.fetchVersions();
        this.fetchTestStatusList();
        this.fetchTriageStatusList();
        this.fetchTestFrameworkList();
        this.fetchTestCategoryList();

        switch (this.state.selectedTab) {
            case 0:
                this.fetchTestCaseData();
                break;
            case 1:
                this.fetchTestResultData();
                break;
            default:
                this.fetchTestCaseData();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(this.state.selectedTab, prevState.selectedTab)) {
            switch (this.state.selectedTab) {
                case 0:
                    this.fetchTestCaseData();
                    break;
                case 1:
                    this.fetchTestResultData();
                    break;
                default:
                    this.fetchTestCaseData();
            }
        }

        if (!_.isEqual(this.props.users, prevProps.users) &&
            this.props.users.count > this.props.users.results.length) {
            this.fetchUsers(this.props.users.results.length, 20);
        }

        if (!_.isEqual(this.props.repositories, prevProps.repositories) &&
            this.props.repositories.count > this.props.repositories.results.length) {
            this.fetchRepositories(this.props.repositories.results.length, 20);
        }

        if (!_.isEqual(this.props.products, prevProps.products) &&
            this.props.products.count > this.props.products.results.length) {
            this.fetchProducts(this.props.products.results.length, 20);
        }

        if (!_.isEqual(this.props.branches, prevProps.branches) &&
            this.props.branches.count > this.props.branches.results.length) {
            this.fetchBranches(this.props.branches.results.length, 20);
        }

        if (!_.isEqual(this.props.versions, prevProps.versions) &&
            this.props.versions.count > this.props.versions.results.length) {
            this.fetchVersions(this.props.versions.results.length, 20);
        }
    }

    static propTypes = {};

    initSearchParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        for (const param in SEARCH_PARAMS) {
            const key = SEARCH_PARAMS[param];
            if (this.state.hasOwnProperty(key) && this.state[key] != null) {
                urlParams.delete(param);
                if (this.state[key] instanceof Array) {
                    this.state[key].forEach(value => {
                        urlParams.append(param, value);
                    });
                } else if (typeof this.state[key] === 'object' && this.state[key] !== null) {
                    for (const value in this.state[key]) {
                        if (this.state[key].hasOwnProperty(value) && this.state[key][value] === true) {
                            urlParams.append(param, value);
                        }
                    }
                } else if (typeof this.state[key] !== 'undefined') {
                    urlParams.set(param, this.state[key].toString());
                }
            }
        }

        const {pathname, hash, state} = this.props.location;

        this.props.history.push({
            pathname: pathname,
            search: urlParams.toString(),
            hash: hash,
            state: state,
        });
    };

    fetchUsers = (offset = 0, limit = 20) => {
        const urlParams = new URLSearchParams();
        urlParams.set('offset', String(offset));
        urlParams.set('limit', String(limit));
        this.props.getUsers(urlParams);
    };

    fetchRepositories = (offset = 0, limit = 20) => {
        const urlParams = new URLSearchParams();
        urlParams.set('offset', String(offset));
        urlParams.set('limit', String(limit));
        this.props.getRepositories(urlParams);
    };

    fetchProducts = (offset = 0, limit = 20) => {
        const urlParams = new URLSearchParams();
        urlParams.set('offset', String(offset));
        urlParams.set('limit', String(limit));
        this.props.getProducts(urlParams);
    };

    fetchBranches = (offset = 0, limit = 20) => {
        const urlParams = new URLSearchParams();
        urlParams.set('offset', String(offset));
        urlParams.set('limit', String(limit));
        this.props.getBranches(urlParams);
    };

    fetchVersions = (offset = 0, limit = 20) => {
        const urlParams = new URLSearchParams();
        urlParams.set('offset', String(offset));
        urlParams.set('limit', String(limit));
        this.props.getVersions(urlParams);
    };

    fetchTestStatusList = () => {
        this.props.getTestStatusList();
    };

    fetchTriageStatusList = () => {
        this.props.getTriageStatusList();
    };

    fetchTestFrameworkList = () => {
        this.props.getTestFrameworkList();
    };

    fetchTestCategoryList = () => {
        this.props.getTestCategoryList();
    };

    fetchTestCaseData = (name = null, product = null, branch = null, status = null, category = null, test_suite = null, offset = 0, limit = 20) => {
        const urlParams = new URLSearchParams();
        if (product !== null) {
            urlParams.set('product', product);
        }
        if (branch !== null) {
            urlParams.set('version__branch', branch);
        }
        if (status !== null) {
            urlParams.set('effective_status', status);
        }
        if (category !== null) {
            urlParams.set('test_category', category);
        }
        if (name !== null) {
            urlParams.set('name__icontains', name);
        }
        if (test_suite !== null) {
            urlParams.set('test_suite', test_suite);
        }
        urlParams.set('offset', String(offset));
        urlParams.set('limit', String(limit));
        this.props.getTestCases(urlParams);
    };

    fetchTestResultData = (name = null, product = null, branch = null, version = null, status = null, category = null, offset = 0, limit = 20) => {
        const urlParams = new URLSearchParams();
        if (product !== null) {
            urlParams.set('test_case__product', product);
        }
        if (branch !== null) {
            urlParams.set('version__branch', branch);
        }
        if (version !== null) {
            urlParams.set('version', version);
        }
        if (status !== null) {
            urlParams.set('status', status);
        }
        if (category !== null) {
            urlParams.set('test_case__test_category', category);
        }
        if (name !== null) {
            urlParams.set('test_case__name__icontains', name);
        }
        urlParams.set('offset', String(offset));
        urlParams.set('limit', String(limit));
        this.props.getTestResults(urlParams);
    };

    renderTestCaseTable = () => {
        if (_.isEmpty(this.props.testCases) || _.isEmpty(this.props.testCases['results'])) {
            return <Loader width={"100%"} height={"550px"}/>
        }

        return <TestCaseTable data={this.props.testCases.results}
                              users={this.props.users.results}
                              repositories={this.props.repositories.results}
                              products={this.props.products.results}
                              branches={_.orderBy(this.props.branches.results, branch => {
                                  return branch.label;
                              }, 'desc')}
                              versions={_.orderBy(this.props.versions.results, (version) => {
                                  return version.label;
                              }, 'desc')}
                              test_status={this.props.test_status.results}
                              triage_status={this.props.triage_status.results}
                              test_framworks={this.props.test_framworks.results}
                              test_category={this.props.test_category.results}
                              rowCount={this.props.testCases.count}
                              handleFetchData={(name = null, product = null, branch = null, status = null, category = null, test_suite = null, offset = 0, limit = 20) => {
                                  this.fetchTestCaseData(name, product, branch, status, category, test_suite, offset, limit);
                              }}
                              handleAddData={testCase => {
                                  console.log('ADD', testCase.id);
                                  if (testCase.hasOwnProperty("id") && testCase.id !== null) {
                                      this.props.updateTestCase(testCase);
                                  } else {
                                      this.props.addTestCase(testCase);
                                  }
                              }}
                              handleCopyData={(testCase, branch, version) => {
                                  console.log('COPY', testCase.id, branch, version);

                                  testCase.branch = branch;
                                  testCase.version = version;
                                  testCase.effective_status = "NotRun";

                                  axios.post(
                                      DESTINY_VERIFY_TEST_CASE_ENDPOINT, testCase, {
                                          credentials: "include",
                                          headers: {
                                              "Content-Type": "application/json",
                                              "X-CSRFToken": getCookie("csrftoken"),
                                          }
                                      }
                                  ).then(
                                      res => {
                                          const errors = res.data.errors;
                                          if (Object.keys(errors).length) {
                                              throw errors;
                                          }
                                          console.log(res.data.results);
                                          this.props.addTestCase(res.data.results);
                                          // this.props.onClickSave(res.data.results);
                                      }
                                  ).catch(e => {
                                      console.log(e);
                                      const message = `Error while copying ${testCase.name.split('.').splice(-2).join('.')}`;
                                      this.props.enqueueSnackbar(message, {
                                          variant: 'error',
                                          anchorOrigin: {
                                              vertical: 'bottom',
                                              horizontal: 'right',
                                          },
                                      });
                                      console.log(message);
                                  });
                              }}
                              handleMoveData={(testCase, branch, version) => {
                                  console.log('Move', testCase.id, branch, version);

                                  testCase.branch = branch;
                                  testCase.version = version;
                                  testCase.effective_status = "NotRun";

                                  axios.post(
                                      DESTINY_VERIFY_TEST_CASE_ENDPOINT, testCase, {
                                          credentials: "include",
                                          headers: {
                                              "Content-Type": "application/json",
                                              "X-CSRFToken": getCookie("csrftoken"),
                                          }
                                      }
                                  ).then(
                                      res => {
                                          const errors = res.data.errors;
                                          if (Object.keys(errors).length) {
                                              throw errors;
                                          }
                                          console.log(res.data.results);
                                          this.props.addTestCase(res.data.results);
                                          this.props.deleteTestCase(res.data.results.id);
                                          // this.props.onClickSave(res.data.results);
                                      }
                                  ).catch(e => {
                                      console.log(e);
                                      const message = `Error while moving ${testCase.name.split('.').splice(-2).join('.')}`;
                                      this.props.enqueueSnackbar(message, {
                                          variant: 'error',
                                          anchorOrigin: {
                                              vertical: 'bottom',
                                              horizontal: 'right',
                                          },
                                      });
                                      console.log(message);
                                  });
                              }}
                              handleDeleteData={id => {
                                  console.log('DELETE', id);
                                  this.props.deleteTestCase(id);
                              }}
                              handleBulkImport={file => {
                                  this.props.bulkImportSystemTestCase(file)
                              }}/>
    };

    renderTestResultTable = () => {
        if (_.isEmpty(this.props.testResults) || _.isEmpty(this.props.testResults['results'])) {
            return <Loader width={"100%"} height={"550px"}/>
        }

        console.log(_.orderBy(this.props.branches.results, branch => {
            return branch.label;
        }, 'desc'));

        console.log(_.orderBy(this.props.versions.results, (version) => {
            return version.label;
        }, 'desc'));

        return <TestResultTable data={this.props.testResults.results}
                                repositories={this.props.repositories.results}
                                products={this.props.products.results}
                                branches={_.orderBy(this.props.branches.results, branch => {
                                    return branch.label;
                                }, 'desc')}
                                versions={_.orderBy(this.props.versions.results, (version) => {
                                    return version.label;
                                }, 'desc')}
                                test_status={this.props.test_status.results}
                                triage_status={this.props.triage_status.results}
                                triage_resolution={this.props.triage_resoltion.results}
                                test_category={this.props.test_category.results}
                                rowCount={this.props.testResults.count}
                                handleFetchData={(name = null, product = null, branch = null, version = null, status = null, category = null, offset = 0, limit = 20) => {
                                    this.fetchTestResultData(name, product, branch, version, status, category, offset, limit);
                                }}
                                handleAddData={testResult => {
                                    console.log(testResult.id);
                                    if (testResult.hasOwnProperty("id") && testResult.id !== null) {
                                        this.props.updateTestResult(testResult);
                                    } else {
                                        this.props.addTestResult(testResult);
                                    }
                                }}
                                handleDeleteData={id => {
                                    console.log(id);
                                    this.props.deleteTestResult(id);
                                }}
                                handleBulkImport={file => {
                                    this.props.bulkImportSystemTestResult(file)
                                }}/>
    };

    renderCards = tab => {
        switch (tab) {
            case 0:
                return this.renderTestCaseTable();
            case 1:
                return this.renderTestResultTable();
            default:
                return this.renderTestCaseTable();
        }
    };

    render() {
        const {selectedTab} = this.state;

        return (
            <Fragment>
                <TopSelect title={<span>Destiny</span>}/>
                <NavTab categories={this.tabs}
                        selectedTab={this.state.selectedTab}
                        onTabChange={tabIndex => {
                            this.setState({selectedTab: tabIndex})
                        }}/>
                <div className="main-container">
                    <div className="flex-container" style={{padding: "24px"}}>
                        {this.renderCards(selectedTab)}
                    </div>
                </div>
            </Fragment>
        );
    }
}

DestinyDashboard.propTypes = {
    enqueueSnackbar: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => ({
    users: state.destinyDashboard.users,
    repositories: state.destinyDashboard.repositories,
    products: state.destinyDashboard.products,
    branches: state.destinyDashboard.branches,
    versions: state.destinyDashboard.versions,
    test_status: state.destinyDashboard.test_status,
    triage_status: state.destinyDashboard.triage_status,
    triage_resoltion: state.destinyDashboard.triage_resoltion,
    test_framworks: state.destinyDashboard.test_framworks,
    test_category: state.destinyDashboard.test_category,
    testCases: state.destinyDashboard.testCases,
    testResults: state.destinyDashboard.testResults,
});

export default connect(mapStateToProps, {
    getUsers,
    getRepositories,
    getProducts,
    getBranches,
    getVersions,
    getTestStatusList,
    getTriageStatusList,
    getTriageResolutionList,
    getTestFrameworkList,
    getTestCategoryList,
    getTestCases,
    getTestResults,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    addTestResult,
    updateTestResult,
    deleteTestResult,
    bulkImportSystemTestCase,
    bulkImportSystemTestResult,
    enqueueSnackbar
})(DestinyDashboard);