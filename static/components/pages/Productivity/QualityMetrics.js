import React, {Component, Fragment} from 'react';
import TopSelect from "../../reusable/TopSelect";
import NavTab from "../../reusable/NavTab";
import DropDown from "../../reusable/DropDown";
import {connect} from "react-redux";
import moment from "moment";
import _ from "lodash"

import {getBranchList, getManagerList, getProductList} from "../../../actions/generalData";
import {getManagerSuiteBuildByBuild, getManagerTestCaseTimeline,} from "../../../actions/qualityMetrics";
import ManagerSuiteBuildByBuildTable from "./ManagerSuiteBuildByBuildTable";
import PropTypes from "prop-types";
import {getSearchParams} from "../../../utils";
import Loader from "../../reusable/Loader";
import ManagerTestCaseTimeline from "./ManagerTestCaseTimeline";
import {GET_MANAGER_SUITE_BUILD_BY_BUILD, GET_MANAGER_TEST_CASE_TIMELINE} from "../../../actions/types";
import ManagerSuiteBuildByBuildGraph from "./ManagerSuiteBuildByBuildGraph";

const SEARCH_PARAMS = {
    "product": "products",
    "branch": "branches",
    "manager": "managers"
};

class QualityMetrics extends Component {
    constructor(props) {
        super(props);
        this.categories = ["Monthly Report", "Testcase Timeline", "Release Breakdown"];
        this.activeBranch = {
            polaris: ['master'],
            brik: ['5.1', '5.0']
        };
        this.state = {
            products: {},
            branches: {},
            managers: {},
            selectedProduct: props.product[0],
            selectedBranch: props.branch[0],
            selectedTab: 0,
        };

        if (!_.isEmpty(props.all_products)) {
            props.all_products.forEach(product => {
                this.state.products[product] = false;
            });
        }

        for (const product of props.product) {
            this.state.products[product] = true;
        }

        if (!_.isEmpty(props.all_branches)) {
            props.all_branches[this.state.selectedProduct].forEach(branch => {
                this.state.branches[branch] = false;
            });
        }

        for (const branch of props.branch) {
            this.state.branches[branch] = true;
        }

        if (!_.isEmpty(props.all_managers)) {
            Object.keys(props.all_managers).forEach(manager => {
                this.state.managers[manager] = false;
            });
        }

        for (const manager of props.manager) {
            this.state.managers[manager] = true;
        }
    }

    componentDidMount() {
        this.initSearchParams();
        this.props.getProductList();
        this.props.getBranchList();
        this.props.getManagerList();

        const {selectedProduct} = this.state;
        const branches = new Set([...this.props.branch, ...this.activeBranch[selectedProduct]]);

        Array.from(branches).forEach(branch => {
            if (_.isEmpty(this.props.manager_suite_build_by_build) ||
                !this.props.manager_suite_build_by_build.hasOwnProperty(selectedProduct) ||
                !this.props.manager_suite_build_by_build[selectedProduct].hasOwnProperty(branch) ||
                _.isEmpty(this.props.manager_suite_build_by_build[selectedProduct][branch])) {
                this.props.getManagerSuiteBuildByBuild(getSearchParams({
                    'product': selectedProduct,
                    'branch': branch
                }))
            }
        });

        this.props.branch.forEach(branch => {
            if (_.isEmpty(this.props.manager_testcase_timeline) ||
                !this.props.manager_testcase_timeline.hasOwnProperty(selectedProduct) ||
                !this.props.manager_testcase_timeline[selectedProduct].hasOwnProperty(branch) ||
                _.isEmpty(this.props.manager_testcase_timeline[selectedProduct][branch])) {
                this.props.getManagerTestCaseTimeline(getSearchParams({
                    'product': selectedProduct,
                    'branch': branch
                }))
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.props.all_products, prevProps.all_products)) {
            let stateProducts = this.state.products;
            for (const product of this.props.all_products) {
                if (!(product in stateProducts)) {
                    stateProducts[product] = false;
                }
            }
            this.setState({products: stateProducts});
        }

        if (!_.isEqual(this.props.all_branches, prevProps.all_branches)) {
            let stateBranches = {};
            for (const branch of this.props.all_branches[this.state.selectedProduct]) {
                if (!(branch in stateBranches)) {
                    stateBranches[branch] = false;
                }
            }

            if (this.props.branch.every(branch => this.props.all_branches[this.state.selectedProduct].includes(branch))) {
                this.props.branch.forEach(branch => {
                    stateBranches[branch] = true;
                });
            } else {
                stateBranches[this.props.all_branches[this.state.selectedProduct][0]] = true;
            }

            this.setState({branches: stateBranches});
        }

        if (!_.isEqual(this.props.all_managers, prevProps.all_managers)) {
            let stateManagers = {...this.state.managers};
            for (const manager of Object.keys(this.props.all_managers)) {
                if (!(manager in this.state.managers)) {
                    stateManagers[manager] = false;
                }
            }
            this.setState({managers: stateManagers});
        }

        if (!_.isEqual(this.state.selectedProduct, prevState.selectedProduct)) {
            if (_.isEmpty(this.props.all_branches) ||
                !this.props.all_branches.hasOwnProperty(this.state.selectedProduct) ||
                _.isEmpty(this.props.all_branches[this.state.selectedProduct])) {
                this.props.getBranchList(getSearchParams({'product': this.state.selectedProduct}));
            } else {
                let stateBranches = {};
                for (const branch of this.props.all_branches[this.state.selectedProduct]) {
                    stateBranches[branch] = false;
                }

                if (this.props.branch.every(branch => this.props.all_branches[this.state.selectedProduct].includes(branch))) {
                    this.props.branch.forEach(branch => {
                        stateBranches[branch] = true;
                    });
                } else {
                    stateBranches[this.props.all_branches[this.state.selectedProduct][0]] = true;
                }

                this.setState({
                    branches: stateBranches,
                    selectedBranch: this.props.all_branches[this.state.selectedProduct][0]
                });
            }
        }

        if (!_.isEqual(_.sortBy(this.props.product), _.sortBy(prevProps.product)) ||
            !_.isEqual(_.sortBy(this.props.branch), _.sortBy(prevProps.branch))) {
            const {selectedProduct} = this.state;
            const branches = new Set([...this.props.branch, ...this.activeBranch[selectedProduct]]);

            Array.from(branches).forEach(branch => {
                if (_.isEmpty(this.props.manager_suite_build_by_build) ||
                    !this.props.manager_suite_build_by_build.hasOwnProperty(selectedProduct) ||
                    !this.props.manager_suite_build_by_build[selectedProduct].hasOwnProperty(branch) ||
                    _.isEmpty(this.props.manager_suite_build_by_build[selectedProduct][branch])) {
                    this.props.getManagerSuiteBuildByBuild(getSearchParams({
                        'product': selectedProduct,
                        'branch': branch
                    }))
                }
            });

            this.props.branch.forEach(branch => {
                if (_.isEmpty(this.props.manager_testcase_timeline) ||
                    !this.props.manager_testcase_timeline.hasOwnProperty(selectedProduct) ||
                    !this.props.manager_testcase_timeline[selectedProduct].hasOwnProperty(branch) ||
                    _.isEmpty(this.props.manager_testcase_timeline[selectedProduct][branch])) {
                    this.props.getManagerTestCaseTimeline(getSearchParams({
                        'product': selectedProduct,
                        'branch': branch
                    }))
                }
            });
        }
    }

    static propTypes = {
        manager_suite_build_by_build: PropTypes.object.isRequired,
        manager_testcase_timeline: PropTypes.object.isRequired,
    };

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

    handleProductChange = (product) => {
        let productState = {...this.state.products};
        productState[this.state.selectedProduct] = false;
        productState[product] = true;
        this.setState({products: productState, selectedProduct: product});
    };

    handleBranchChange = (branch) => {
        let branchState = {...this.state.branches};
        branchState[this.state.selectedBranch] = false;
        branchState[branch] = true;
        this.setState({branches: branchState, selectedBranch: branch});
    };

    handleManagerChange = (manager) => {
        let managerState = {...this.state.managers};
        managerState[manager] = !managerState[manager];
        const selectedManagers = Object.keys(managerState)
            .filter(manager => managerState[manager]);
        if (selectedManagers.length !== 0) {
            this.setState({managers: managerState});
        }
    };

    handleSubmit = () => {
        this.initSearchParams();
    };

    renderManagerMonthlyReportTitle = () => {
        const endDate = moment();
        const startDate = moment().subtract(28, 'days');
        const period = `${startDate.format('DD-MM-YYYY')} to ${endDate.format('DD-MM-YYYY')}`;
        return (
            <div className="big-card-title full"
                 style={{backgroundColor: "rgb(40, 47, 64)", color: "white"}}>
                <div style={{marginRight: "15px", fontFamily: "Ubuntu"}}>Manager Monthly Report
                </div>
                <div style={{fontSize: "15px", marginLeft: "auto"}}>{period}</div>
            </div>
        )
    };

    renderManagerSuiteBuildByBuildGraph = (product, branch, managers, width = 1210, height = 350) => {
        if (_.isEmpty(this.props.manager_suite_build_by_build) ||
            _.isEmpty(this.props.manager_suite_build_by_build[product]) ||
            _.isEmpty(this.props.manager_suite_build_by_build[product][branch])) {
            return <Loader width="100%" height={height}/>
        }

        const tableData = this.props.manager_suite_build_by_build[product][branch].data.table_data
            .filter(manager => managers.includes(manager.name));

        const graphData = this.props.manager_suite_build_by_build[product][branch].data.graph_data
            .filter(manager => managers.includes(manager.name));

        const filteredData = {
            'allversions': this.props.manager_suite_build_by_build[product][branch].allversions,
            'data': {
                'table_data': tableData,
                'graph_data': graphData,
            }
        };

        return (
            <ManagerSuiteBuildByBuildGraph width={width} height={height}
                                           data={filteredData}
                                           isLoading={this.props.fetching[GET_MANAGER_SUITE_BUILD_BY_BUILD] > 0}/>
        )
    };

    renderManagerSuiteBuildByBuildTable = (product, branch, managers) => {
        if (_.isEmpty(this.props.manager_suite_build_by_build) ||
            _.isEmpty(this.props.manager_suite_build_by_build[product]) ||
            _.isEmpty(this.props.manager_suite_build_by_build[product][branch])) {
            return <Loader width="100%" height="450px"/>
        }

        const tableData = this.props.manager_suite_build_by_build[product][branch].data.table_data
            .filter(manager => managers.includes(manager.name));

        const graphData = this.props.manager_suite_build_by_build[product][branch].data.graph_data
            .filter(manager => managers.includes(manager.name));

        const filteredData = {
            'allversions': this.props.manager_suite_build_by_build[product][branch].allversions,
            'data': {
                'table_data': tableData,
                'graph_data': graphData,
            }
        };

        return (
            <ManagerSuiteBuildByBuildTable data={filteredData}
                                           isLoading={this.props.fetching[GET_MANAGER_SUITE_BUILD_BY_BUILD] > 0}/>
        )
    };

    renderManagerTestCaseTimelineTitle = () => {
        return (
            <div className="big-card-title full"
                 style={{backgroundColor: "rgb(40, 47, 64)", color: "white"}}>
                <div style={{marginRight: "15px", fontFamily: "Ubuntu"}}>Manager Testcase Timeline</div>
            </div>
        )
    };

    renderReleaseBreakdownTitle = manager => {
        const endDate = moment();
        const startDate = moment().subtract(28, 'days');
        const period = `${startDate.format('DD-MM-YYYY')} to ${endDate.format('DD-MM-YYYY')}`;
        return (
            <div className="big-card-title full"
                 style={{backgroundColor: "rgb(40, 47, 64)", color: "white"}}>
                <div style={{marginRight: "15px", fontFamily: "Ubuntu"}}>{manager}</div>
                <div style={{fontSize: "15px", marginLeft: "auto"}}>{period}</div>
            </div>
        )
    };

    renderManagerTestCaseTimelineTable = (product, branch, managers) => {
        if (_.isEmpty(this.props.manager_testcase_timeline) ||
            _.isEmpty(this.props.manager_testcase_timeline[product]) ||
            _.isEmpty(this.props.manager_testcase_timeline[product][branch])) {
            return <Loader width="100%" height="450px"/>
        }

        const filteredData = Object.keys(this.props.manager_testcase_timeline[product][branch])
            .filter(manager => managers.includes(manager))
            .reduce((obj, key) => {
                obj[key] = this.props.manager_testcase_timeline[product][branch][key];
                return obj;
            }, {});

        return (
            <ManagerTestCaseTimeline data={filteredData}
                                     isLoading={this.props.fetching[GET_MANAGER_TEST_CASE_TIMELINE] > 0}/>
        )
    };

    renderMonthlyReportCard = (product, branch, managers) => {
        return (
            <div className="row align-items-center">
                <div className="col-xs-11">
                    <div className="big-card"
                         style={{
                             backgroundColor: 'white',
                             border: '1px solid rgb(229, 233, 242)',
                             boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px'
                         }}>
                        {this.renderManagerMonthlyReportTitle()}
                        <div className="content-block"
                             style={{
                                 padding: '20px 20px 25px 20px'
                             }}>
                            <div className="flex-container"
                                 style={{padding: 0}}>
                                <div className="row align-items-center"
                                     style={{
                                         padding: '12px 0'
                                     }}>
                                    <div className="col-xs-12">
                                        {this.renderManagerSuiteBuildByBuildGraph(product, branch, managers)}
                                    </div>
                                </div>
                                <div className="row align-items-center"
                                     style={{padding: '12px 0'}}>
                                    <div className="col-xs-12">
                                        {this.renderManagerSuiteBuildByBuildTable(product, branch, managers)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    renderTestcaseTimelineCard = (product, branch, managers) => {
        return (
            <div className="row align-items-center">
                <div className="col-xs-11">
                    <div className="big-card"
                         style={{
                             backgroundColor: 'white',
                             border: '1px solid rgb(229, 233, 242)',
                             boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px'
                         }}>
                        {this.renderManagerTestCaseTimelineTitle()}
                        <div className="content-block"
                             style={{
                                 padding: '20px 20px 25px 20px'
                             }}>
                            <div className="flex-container" style={{padding: 0}}>
                                <div className="row align-items-center">
                                    <div className="col-xs-12">
                                        {this.renderManagerTestCaseTimelineTable(product, branch, managers)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    renderReleaseBreakdownCard = (product, managers) => {
        return (
            managers.map(manager =>
                <div key={manager} className="row align-items-center">
                    <div className="col-xs-11">
                        <div className="big-card"
                             style={{
                                 backgroundColor: 'white',
                                 border: '1px solid rgb(229, 233, 242)',
                                 boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px'
                             }}>
                            {this.renderReleaseBreakdownTitle(manager)}
                            <div className="content-block"
                                 style={{
                                     padding: '20px 20px 25px 20px'
                                 }}>
                                <div className="flex-container"
                                     style={{padding: 0, display: "flex", flexWrap: "wrap", width: "100%"}}>
                                    {this.activeBranch[product].map(branch =>
                                        <div key={branch} style={{width: "50%"}}>
                                            <div className="big-card-title half-title">{branch}</div>
                                            {this.renderManagerSuiteBuildByBuildGraph(product, branch, [manager],
                                                620, 300)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    };

    renderCards = (category, product, branch, managers) => {
        switch (category) {
            case 0:
                return this.renderMonthlyReportCard(product, branch, managers);
            case 1:
                return this.renderTestcaseTimelineCard(product, branch, managers);
            case 2:
                return this.renderReleaseBreakdownCard(product, managers);
            default:
                return this.renderMonthlyReportCard(product, branch, managers);
        }
    };

    render() {
        const {products, branches, managers} = this.state;

        return (
            <Fragment>
                <TopSelect
                    title={
                        <span>
                            <span style={{
                                fontSize: "24px",
                                marginRight: "7px",
                                color: "black",
                                fontFamily: "Montserrat"
                            }}>
                                {this.props.branch[0]}
                            </span>
                            <span>Quality Metrics</span>
                        </span>
                    }
                >
                    <DropDown key="product-dropdown" title="Product"
                              data={products} handleClick={this.handleProductChange}
                              handleSubmit={this.handleSubmit}/>
                    <DropDown key="version-dropdown" title="Version"
                              data={branches} handleClick={this.handleBranchChange}
                              handleSubmit={this.handleSubmit}/>
                    <DropDown key="manager-dropdown"
                              style={{marginRight: "180px"}} title="Manager"
                              data={managers} handleClick={this.handleManagerChange}
                              handleSubmit={this.handleSubmit}
                    />
                </TopSelect>
                <NavTab categories={this.categories}
                        selectedTab={this.state.selectedTab}
                        onTabChange={tabIndex => {
                            this.setState({selectedTab: tabIndex})
                        }}/>
                <div className="main-container">
                    <div className="flex-container">
                        {this.renderCards(this.state.selectedTab, this.props.product[0], this.props.branch[0], this.props.manager)}
                    </div>
                </div>
            </Fragment>
        );
    }
}

QualityMetrics.defaultProps = {
    product: ["brik"],
    branch: ["5.1"],
    manager: [
        'Anandh Ravindran',
        'Aparajita Rao',
        'Deepesh Khandelwal',
        'Prakash Manickam',
        'Sriram Lakka',
        'Sunil Goyal',
    ],
    all_branches: {},
    all_managers: [],
};

const mapStateToProps = (state) => ({
    fetching: state.generalData.fetching,
    all_products: state.generalData.products,
    all_branches: state.generalData.branches,
    all_managers: state.generalData.managers,
    manager_suite_build_by_build: state.qualityMetrics.manager_suite_build_by_build,
    manager_testcase_timeline: state.qualityMetrics.manager_testcase_timeline,
});

export default connect(mapStateToProps, {
    getProductList,
    getBranchList,
    getManagerList,
    getManagerSuiteBuildByBuild,
    getManagerTestCaseTimeline,
})(QualityMetrics);