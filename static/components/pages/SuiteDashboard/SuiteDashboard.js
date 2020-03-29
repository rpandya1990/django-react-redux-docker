import React, {Component, Fragment} from 'react';
import TopSelect from "../../reusable/TopSelect";
import NestedTable from "../../reusable/NestedTable";
import DropDown from "../../reusable/DropDown";
import SecondSelect from "../../reusable/SecondSelect";
import {getProductList, getBranchList, getManagerList, getSuites} from "../../../actions/generalData";
import {connect} from "react-redux";
import _ from "lodash";
import NavTab from "../../reusable/NavTab";
import {getRecentVersions} from "../../../actions/qualityDashboard";
import {getManagerSuiteTree, changeTrTriageStatus, changeTrIssueLink, getManagersSuites, updateInfo} from "../../../actions/suiteDashboard";
import {getSearchParams, validIssue} from "../../../utils";
import Modal from "../../reusable/Modal";
import LargeInput from "../../reusable/LargeInput";
import ToggleSwitch from "../../reusable/ToggleSwitch";
import Filter from "../../reusable/Filter";
import "../../../css/SuiteDashboard.css";
import {defaultDashboardVersion} from "../../../info";


const SEARCH_PARAMS = {
    "branch": "branches",
    "product": "products",
    "suite": "suites",
    "version-starts-with": "specificSearchVersion",
    "category": "selectedCategory"
};

const POLARIS_CATEGORY_MAP = {
    "Functional": new Set([
        "AppFlows", "integration_brikmock", "integration_4_2", "integration_5_0", "integration_5_1", "integration_colossus",
        "cloud_native", "Cloud Native Azure", "Cloud Native GCP", "Cloud Native AWS Indexing",
        "Cloud_Setup_Azure", "cloud simpl", "Cloud Setup GCP", "Cloud_Native_AWS_RDS",
        "data_classification", "Feature Branch Tests - Global SLA", "integration_o365", "odc", "radar",
        "integration_vsphere", "Integration_watchers", "o365_calendar", "o365_onedrive"
    ]),
    "Non-functional": new Set([
        "Cloud Native Scale", "korg_scale", "o365_scale", "o365 stress", "rbac_performance", "UI Performance",
        "validation"
    ]),
    "Canary": new Set([
        "Canary_prod001", "Canary_prod002", "Canary_prod003", "Canary_prod000"
    ])
};

const CATEGORIES = ["Functional", "Non-functional", "Canary"];

const NAME_TRANSLATIONS = {
    Canary_prod001: "Canary Prod-001",
    Canary_prod002: "Canary Prod-002",
    Canary_prod003: "Canary Prod-003",
    Canary_prod004: "Canary Prod-004",
    validation: "Validation",
    "UI Performance": "UI Performance",
    "rbac_performance": "RBAC Performance",
    "o365 stress": "O365 Stress",
    "o365_scale": "O365 Scale",
    "korg_scale": "Korg Scale",
    "Cloud Native Scale": "Cloud Native Scale",
    "AppFlows": "AppFlows",
    "integration_brikmock": "Brikmock Integration",
    "integration_4_2": "CDM 4.2 Integration",
    "integration_5_0": "CDM 5.0 Integration",
    "integration_5_1": "CDM 5.1 Integration",
    "cloud_native": "Cloud Native AWS",
    "Cloud Native Azure": "Cloud Native Azure",
    "Cloud Native GCP": "Cloud Native GCP",
    "Cloud Native AWS Indexing": "Cloud Native AWS Indexing",
    "Cloud_Native_AWS_RDS": "Cloud Setup Aws RDS",
    "Cloud_Setup_Azure": "Cloud Setup Azure ",
    "Cloud Setup GCP": "Cloud Setup GCP",
    "cloud simpl": "Cloud Setup AWS",
    "data_classification": "Data Classification",
    "Feature Branch Tests - Global SLA": "Global SLA",
    "integration_o365": "O365 Mailbox",
    "o365_calendar": "O365 Calendar",
    "o365_onedrive": "O365 Onedrive",
    "odc": "ODC",
    "radar": "RADAR",
    "integration_vsphere": "VSphere",
    "Integration_watchers": "Watchers",
    "integration_colossus": "Colossus"
};

const translateName = (name) => {
    const name_translations = NAME_TRANSLATIONS[name];
    return name_translations || name;
};

const SORTABLE_COLUMNS = {
    "Triage": {
        type: "string",
        comparison: "exact",
        values: ["untriaged", "testcase", "product", "infra", "undetermined"]
    },
    "Status": {
        type: "string",
        comparison: "multi",
        values: ["NotRun", "Fail", "Success", "Skip"],
        multiComparisonValues: {
            "Fail": ["Error", "Fail"]
        }
    },
    "% TC Pass": {
        type: "int",
        comparison: "greater",
        values: [10,20,30,40,50,60,70,80,90]
    }
};


class SuiteDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openEditModal: null,
            branches: {},
            products: {},
            managers: {},
            selectedBranch: props.branch[0],
            selectedProduct: props.product[0],
            selectedCategory: props.category[0],
            selectedManager: null,
            specificVersion: props.branch[0],
            specificSearchVersion: props.branch[0],
            suites: {},
            issueList: "",
            newIssue: "",
            tr_id: "",
            tc_id: "",
            ts_id: "",
            suiteSearch: "",
            issueLink: "",
            flatten: false,
            issueError: "",
            emptyBoard: false,
        };
        this.state.branches = this.getNewBranchState({branch: this.state.selectedBranch, product: this.state.selectedProduct});
        if (!_.isEmpty(props.all_products)) {
            props.all_products.forEach(product => {
                this.state.products[product] = false;
            });
        }
        for (const product of props.product) {
            this.state.products[product] = true;
        }
        for (const suite of props.suite) {
            const branchId = Number.isNaN(parseFloat(this.state.selectedBranch)) ? "5.1" : this.state.selectedBranch;
            const suiteId = suite+"/"+branchId;
            console.log(suiteId, branchId, this.props.suiteTrees);
            if (!(suiteId in this.props.suiteTrees.children)) {
                this.state.suites[suiteId] = {
                    show: true,
                    product: "brik",
                    name: suite,
                    fetched: false,
                    branch: branchId,
                }
            } else {
                this.state.suites[suiteId] = {
                    show: true,
                    product: "brik",
                    name: suite,
                    fetched: true,
                    branch: branchId,
                }
            }
        }
        for (const manager of Object.keys(props.all_managers)) {
            this.state.managers[manager] = false;
        }
        this.handleSuiteSearchDebounce = this.handleSuiteSearch();
        this.specificVersionCall = null;
    }

    handleSuiteSearch = () => {
        let suiteCall = null;
        return () => {
            clearTimeout(suiteCall);
            suiteCall = setTimeout(() => {
                this.props.getSuites(getSearchParams({branch: this.state.selectedBranch, search: this.state.suiteSearch}));
            }, 300);
        }
    };

    getNewBranchState = ({branch, product}) => {
        let branches = {};
        if (!_.isEmpty(this.props.all_branches)) {
            this.props.all_branches[product].forEach(branch => {
                branches[branch] = false;
            });
        }
        branches[branch] = true;
        return branches
    };

    fetchSuiteData = () => {
        if (this.state.selectedProduct === "polaris") {
            for (let i = 0; i < Array.from(POLARIS_CATEGORY_MAP[CATEGORIES[this.state.selectedCategory]]).length; i += 4) {
                let fetchSuites = Array.from(POLARIS_CATEGORY_MAP[CATEGORIES[this.state.selectedCategory]]).slice(i,i+4).map((ele)=>`${ele}/${this.state.selectedBranch}`).filter((ele) => {
                    return !this.state.suites[ele] || !this.state.suites[ele].fetched;
                });
                this.props.getManagerSuiteTree(getSearchParams(
                    {
                        version: this.state.selectedBranch,
                        product: this.state.selectedProduct,
                        suite: fetchSuites
                    }),
                    fetchSuites,
                    this.state.selectedProduct
                );
            }

        } else {
            let fetchSuites = Object.keys(this.state.suites).filter((ele)=> this.state.suites[ele].product === this.state.selectedProduct && !this.state.suites[ele].fetched).map((ele) => this.state.suites[ele].name);
            this.parallelFetchSuites(fetchSuites);
        }
    };

    parallelFetchSuites = (suites, count=3) => {
        for (let i = 0; i < suites.length; i += count) {
            this.props.getManagerSuiteTree(getSearchParams({
                version: this.state.selectedBranch,
                product: this.state.selectedProduct,
                suite: suites.slice(i, i+count),
                "version-starts-with": this.state.specificSearchVersion,
            }), suites, this.state.selectedProduct);
        }
    };

    componentDidMount() {
        this.props.getProductList();
        this.props.getBranchList();
        this.props.getManagerList();
        this.initSearchParams();
        this.fetchSuiteData();
    }

    closeModal = () => {
        this.setState({openEditModal: false});
    };

    resetManagerState = () => {
        let newManagers = {};
        Object.keys(this.props.all_managers).forEach(manager => {
            if (this.props.all_managers[manager].product !== this.state.selectedProduct) {
                return;
            }
            newManagers[manager] = false;
        });
        return newManagers;
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevState.selectedBranch, this.state.selectedBranch)) {
            this.initSearchParams();
            this.fetchSuiteData();
            let newManagers = this.resetManagerState();
            this.setState({managers: newManagers, selectedManager: ""});
        }
        if (prevState.selectedProduct !== this.state.selectedProduct) {
            this.fetchSuiteData();
            let suitesCopy = {...this.state.suites};
            let newManagers = this.resetManagerState();
            for (const suite of Object.keys(this.state.suites)) {
                suitesCopy[suite].show = suitesCopy[suite].product === this.state.selectedProduct;
            }

            this.setState({suites: suitesCopy, managers: newManagers, selectedManager: ""});
        }
        if (prevState.selectedCategory !== this.state.selectedCategory) {
            this.initSearchParams();
            this.fetchSuiteData();
        }
        if (prevState.openEditModal !== this.state.openEditModal) {
            if (this.state.openEditModal) {
                window.addEventListener("click", this.closeModal);
            } else {
                window.removeEventListener("click", this.closeModal);
            }
        }
        if (this.state.selectedManager && prevState.selectedManager !== this.state.selectedManager) {
            this.props.getManagersSuites(
                getSearchParams({
                    id: this.props.all_managers[this.state.selectedManager].id,
                    branch: this.state.selectedBranch
                }),
                this.state.selectedManager,
                this.state.selectedBranch
            );
            if (this.props.managerSuites[this.state.selectedManager] && this.props.managerSuites[this.state.selectedManager][this.state.selectedBranch]) {
                this.resetBoardAndShowFetchSuites();
            }
        }
        if (
            !_.isEqual(prevProps.managerSuites[this.state.selectedManager], this.props.managerSuites[this.state.selectedManager]) ||
            (this.props.managerSuites[this.state.selectedManager] && !_.isEqual(prevProps.managerSuites[this.state.selectedManager][this.state.selectedBranch], this.props.managerSuites[this.state.selectedManager][this.state.selectedBranch]))) {
            this.resetBoardAndShowFetchSuites();
        }
        if (!_.isEqual(this.state.suites, prevState.suites)) {
            this.initSearchParams();
        }
        if (prevState.specificSearchVersion !== this.state.specificSearchVersion) {
            console.log(this.state.specificSearchVersion);
            let suites = {...this.state.suites};
            for (const suite of Object.keys(suites)) {
                suites[suite].show = suites[suite].branch === this.state.specificSearchVersion;
            }
            this.parallelFetchSuites(
                Object.keys(this.state.suites).filter((ele) => {
                    return this.state.specificSearchVersion.includes(this.state.suites[ele].branch) && suites[ele].branch !== this.state.specificSearchVersion && !((this.state.suites[ele].name + "/" + this.state.specificSearchVersion) in suites)
                }).map((ele) => this.state.suites[ele].name)
            );
            this.initSearchParams();
            this.setState({suites});
        }
    }

    resetBoardAndShowFetchSuites = () => {
        let suites = {...this.state.suites};
        for (const suite of Object.keys(this.state.suites)) {
            suites[suite].show = false;
        }
        let unfetchedSuites = [];
        for (const ms of this.props.managerSuites[this.state.selectedManager][this.state.selectedBranch]) {
            let suiteName = ms + "/" + this.state.selectedBranch;
            if (suiteName in suites) {
                suites[suiteName].show = true;
            } else {
                unfetchedSuites.push(ms);
            }
        }
        this.parallelFetchSuites(unfetchedSuites);
        this.setState({suites});
    };

    componentWillReceiveProps(nextProps, nextCotext) {
        if (!_.isEqual(this.props.all_branches, nextProps.all_branches)) {
            let newBranches = {};
            nextProps.all_branches[this.state.selectedProduct].forEach(branch => {
                newBranches[branch] = branch in this.state.branches
            });
            this.setState({branches: Object.assign({}, this.state.branches, newBranches)});
        }
        if (!_.isEqual(this.props.all_products, nextProps.all_products)) {
            let newProducts = {};
            nextProps.all_products.forEach(product => {
                newProducts[product] = product in this.state.products
            });
            this.setState({products: Object.assign({}, this.state.products, newProducts)});
        }
        if (!_.isEqual(this.props.all_managers, nextProps.all_managers)) {
            let newManagers = {};
            Object.keys(nextProps.all_managers).forEach(manager => {
                if (nextProps.all_managers[manager].product !== this.state.selectedProduct) {
                    return;
                }
                newManagers[manager] = false;
            });
            this.setState({managers: Object.assign({}, this.state.managers, newManagers)});
        }
        if (!_.isEqual(nextProps.suiteTrees.children, this.props.suiteTrees.children)) {
            let suiteAddition = {};
            let fetchSuite = POLARIS_CATEGORY_MAP[CATEGORIES[this.state.selectedCategory]];
            for (const child of Object.keys(nextProps.suiteTrees.children)) {
                if (!(child in this.props.suiteTrees.children)) {
                    suiteAddition[child] = {
                        ...this.state.suites[child],
                        fetched: true,
                        show: this.state.selectedProduct === nextProps.suiteTrees.children[child].product && this.state.specificSearchVersion === nextProps.suiteTrees.children[child].branch && (this.state.selectedProduct === "polaris" ? fetchSuite.has(child.split("/")[0]) : true),
                        branch: nextProps.suiteTrees.children[child].branch,
                        product: nextProps.suiteTrees.children[child].product,
                        name: child.split("/")[0]
                    };
                }
            }
            this.setState({
                suites: Object.assign({}, this.state.suites, suiteAddition)
            });
        }
        if (this.props.updatedInfo && !_.isEqual(nextProps.updatedInfo[this.state.tr_id], this.props.updatedInfo[this.state.tr_id])) {
            this.setState({issueList: nextProps.updatedInfo[this.state.tr_id].issue_tracker_urls, issueLink: nextProps.updatedInfo[this.state.tr_id].issue_tracker_link})
        }
    }

    initSearchParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        for (const param in SEARCH_PARAMS) {
            const key = SEARCH_PARAMS[param];
            if (this.state[key] == null) {
                urlParams.delete(key);
                continue;
            }
            if (this.state.hasOwnProperty(key)) {
                urlParams.delete(param);
                if (this.state[key] instanceof Array) {
                    this.state[key].forEach(value => {
                        urlParams.append(param, value);
                    });
                } else if (typeof this.state[key] === 'object' && this.state[key] !== null) {
                    for (const value in this.state[key]) {
                        if (key === "suites") {
                            if (this.state[key].hasOwnProperty(value) && this.state[key][value].show === true && this.state[key][value].product !== "polaris") {
                                urlParams.append(param, this.state[key][value].name || value);
                            }
                        }
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
        this.props.history.replace({
            pathname,
            search: urlParams.toString(),
            hash,
            state,
        });
    };


    renderCustomCell = (column, data, state, treeNode, nodeId) => {
        if (!data) {
            return [null, null];
        }
        if (column.name === "Issues") {
            return (
                [<div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    {Boolean(data.issue_tracker_link) &&
                    <Fragment>
                        <div
                            style={{margin: "0px 3px", display: "flex", textDecoration: "none"}}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <i className="material-icons" style={{fontSize: "19px"}} onClick={() => {
                                this.setState({
                                    openEditModal: true,
                                    tr_id: data.effective_tr_id,
                                    tc_id: data.tc_id,
                                    ts_id: data.id,
                                    issueList: (this.props.updatedInfo[data.effective_tr_id] && this.props.updatedInfo[data.effective_tr_id].issue_tracker_urls) || data.issue_tracker_urls,
                                    issueLink: (this.props.updatedInfo[data.effective_tr_id] && this.props.updatedInfo[data.effective_tr_id].issue_tracker_link) || data.issue_tracker_link
                                });
                            }}>add</i>
                        </div>
                        <a style={{margin: "0px 3px", display: "flex", textDecoration: "none"}} target="_blank"
                           href={(this.props.updatedInfo[data.effective_tr_id] && this.props.updatedInfo[data.effective_tr_id].issue_tracker_link) || data.issue_tracker_link}>
                            <i className="material-icons" style={{fontSize: "19px"}}>list_alt</i>
                        </a>
                    </Fragment>
                    }
                </div>, null]
            );
        } else if (column.name === "Last Completed Run (Run #)") {
            if (data.last_run) {
                return [<div style={{whiteSpace: "nowrap", display: "flex"}}><span>{`${data.start_time}`}</span> <span style={{fontWeight: 300, marginLeft: "4px", fontSize: ".91em"}}>{`(${data.last_run})`}</span></div>, data.start_time]
            } else if (data.start_time) {
                return [<div style={{whiteSpace: "nowrap", display: "flex"}}>{`${data.start_time}`}</div>, data.start_time]
            }
            return [null, null];
        } else if (column.name === "Test Cases") {
            const obj_id = data.id;
            const tc_id = data.tc_id || "";
            let query = "id=" + obj_id;
            if (tc_id) {
                query += ("&testcase=" + tc_id);
            }
            let pipelineLink = "/product_quality_report/?" + query + "&product=" + this.props.product[0] + "&start-date=" + this.props["start-date"][0] + "&branch=" + this.props.branch[0];
            return (
                [<a href={pipelineLink} target="_blank">{data.total}</a>, data.total]
            );
        } else if (column.name === "% TC Pass") {
            let pass = data.total && data.pass_num ? data.pass_num / (data.total-data.skips) : 0;
            pass = Math.floor(100 * pass);
            let color = "rgba(205, 60, 60, 1)";
            if (pass > 90) {
                color = "rgba(10, 185, 35, 1)";
            } else if (pass > 70) {
                color = "rgb(204, 163, 34)";
            }
            const perc = pass + "%";
            return (
                [<div style={{color}}>{perc}</div>, perc]
            );
        } else if (column.name === "Status") {
            let state = data[column.id];
            let bgc = "rgba(205, 60, 60, 1)";
            if (state.toLowerCase() === "success") {
                bgc = "rgba(10, 185, 35, 1)";
            } else if (state.toLowerCase() === "notrun" || state.toLowerCase() === "skip") {
                bgc = "rgb(204, 163, 34)";
            }
            return (
                [<div style={{color: bgc}}>{state}</div>, state]
            )
        } else if (column.name === "Triage") {
            if (data.triaged === "not-triagable"){
                return [null, "not-triagable"];
            }
            if (Array.isArray(data.triaged)) {
                return [null, data.triaged];
            }
            if (data.triaged) {
                let id = data.effective_tr_id;
                let sId = data.id;
                return (
                    [<select onChange={(event) => this.handleTriageChange(event.target.value, id, sId, state, treeNode, nodeId, data)}>
                        {["untriaged", "testcase", "product", "infra", "undetermined"].map(
                            item => <option selected={(this.props.updatedInfo[id] && item === this.props.updatedInfo[id].triaged) || item === data.triaged}>{item}</option>
                        )}
                    </select>, (this.props.updatedInfo[id] && this.props.updatedInfo[id].triaged) || data.triaged]
                )
            }
            return [null, null]
        }
        return [null, null];
    };

    handleTriageChange = (value, effective_id, sId, state, treeNode, nodeId, leafData) => {
        this.props.changeTrTriageStatus(getSearchParams({id: effective_id, triage: value}), effective_id);
        let currNode = nodeId;
        let bottomToTopPath = [nodeId];
        while (state.childToParent[currNode]) {
            currNode = state.childToParent[currNode];
            bottomToTopPath.push(currNode);
        }
        let topToBottom = bottomToTopPath.slice().reverse();

        // Change name to actual names
        // ["Qualify_Rubrik_Perf_CDM_Launcher/5.2", "Qualify_Rubrik_Perf_CDM_Launcher/5.2Perf_Vmware_Launcher"]
        // ['Qualify_Rubrik_Perf_CDM_Launcher/5.2', 'Perf_Vmware_Launcher']
        for (let i = topToBottom.length-1; i>0; i--) {
            topToBottom[i] = topToBottom[i].replace(topToBottom[i-1], "")
        }

        let data = this.props.suiteTrees;
        for (const node of topToBottom) {
            data = data.children[node];
            if (!data.data.effective_tr_id) {
                let oldVal = (this.props.updatedInfo[effective_id] && this.props.updatedInfo[effective_id].triaged) || leafData.triaged;
                let triagedList = ((this.props.updatedInfo[data.data.id] && this.props.updatedInfo[data.data.id].triaged) || data.data.triaged).slice();
                triagedList[triagedList.indexOf(oldVal)] = value;
                this.props.updateInfo(data.data.id, {"triaged": triagedList})
            }
        }
    };

    handleBranchChange = (branch) => {
        let branchState = {...this.state.branches};
        branchState[this.state.selectedBranch] = false;
        branchState[branch] = true;
        let fetchSuite = POLARIS_CATEGORY_MAP[CATEGORIES[this.state.selectedCategory]];
        let suites = {...this.state.suites};
        for (const suite of Object.keys(this.state.suites)) {
            suites[suite].show = this.state.selectedProduct !== "polaris" ? suites[suite].branch === branch : suites[suite].branch === branch && fetchSuite.has(suite.split("/")[0])
        }
        this.setState({
            branches: branchState,
            selectedBranch: branch,
            specificVersion: branch,
            specificSearchVersion: branch,
            suites
        });
    };

    handleManagerChange = (manager) => {
        let newManagerState = {...this.state.managers};
        if (this.state.selectedManager) {
            newManagerState[this.state.selectedManager] = false;
        }
        newManagerState[manager] = true;
        this.setState({selectedManager: manager, managers: newManagerState})
    };

    handleProductChange = (product) => {
        let productState = {...this.state.products};
        productState[this.state.selectedProduct] = false;
        productState[product] = true;
        let fetchSuite = POLARIS_CATEGORY_MAP[CATEGORIES[this.state.selectedCategory]];
        let selectedBranch = product !== "polaris" ? "5.1" : "master";
        let suites = {...this.state.suites};
        for (const suite of Object.keys(this.state.suites)) {
            suites[suite].show = product !== "polaris" ? suites[suite].product === product && suites[suite].branch === selectedBranch : suites[suite].product === product && suites[suite].branch === selectedBranch && fetchSuite.has(suite.split("/")[0]);
        }
        this.setState({
            products: productState,
            selectedProduct: product,
            specificVersion: selectedBranch,
            specificSearchVersion: selectedBranch,
            selectedBranch,
            branches: this.getNewBranchState({branch: selectedBranch, product}),
            suites
        });

    };

    getRecentVersions = (value="", branch=this.state.selectedBranch) => {
        window.clearTimeout(this.specificVersionCall);
        this.specificVersionCall = window.setTimeout(() => {
            this.props.getRecentVersions(getSearchParams({
                branch,
                value,
                pipeline_name: this.props.suite,
                start_date: "4w"
            }));
        }, 300);
    };

    presentSecondSelect = (product) => {
        if (product === "polaris") {
            return (
                <NavTab
                    ref={node => this.navTab = node}
                    categories={CATEGORIES}
                    style={{borderBottom: "1px solid rgb(220,220,220)"}}
                    selectedTab={this.state.selectedCategory}
                    onTabChange={tabIndex => {
                        let suites = {...this.state.suites};
                        let fetchSuite = POLARIS_CATEGORY_MAP[CATEGORIES[tabIndex]];
                        for (const suite of Object.keys(suites)) {
                            suites[suite].show = fetchSuite.has(suite.split("/")[0]) && this.state.selectedBranch === suites[suite].branch;
                        }
                        this.setState({suites, selectedCategory: tabIndex})
                    }}
                />
            );
        } else {
            return (
                <SecondSelect style={{borderBottom: "1px solid rgb(220,220,220)", top: "60px", paddingLeft: "38px", paddingRight: "110px"}}>
                    <LargeInput
                        value={this.state.suiteSearch}
                        getResults={this.handleSuiteSearchDebounce}
                        handleKeyUp={(value) => this.setState({suiteSearch: value})}
                        handleEnter={(value) => this.handleSuiteEnter(value)}
                        data={this.props.suites}
                    />
                    <Filter
                        value={this.state.specificVersion}
                        style={{marginLeft: "auto"}}
                        handleChange={(value) => this.setState({specificVersion: value})}
                        title={"Specific Branch Version"}
                        handleKeyUp={(e) => {
                            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "ArrowLeft") {
                                return;
                            }
                            this.getRecentVersions(e.target.value, this.state.selectedBranch)
                        }}
                        onFocus={(value) => this.getRecentVersions(value, this.state.selectedBranch)}
                        dropdownData={this.props.versionSuggestions}
                        handleFilterEnter={(val) => {this.setState({specificVersion: val, specificSearchVersion: val})}}
                    />
                </SecondSelect>
            );
        }
    };

    editNewIssueInput = (event) => {
        this.setState({newIssue: event.target.value, issueError: ""});
    };

    handleManagerClick = () => {

    };

    handleNewIssueActions = (event) => {
        if (event.keyCode === 13) {
            if (validIssue(event.target.value)) {
                this.props.changeTrIssueLink(getSearchParams({
                    id: this.state.tr_id,
                    issue: event.target.value,
                    tc_id: this.state.tc_id,
                    ts_id: this.state.ts_id,
                }), this.state.tr_id);
                this.setState({newIssue: ""});
            } else {
                this.setState({issueError: "Not a valid Jira Issue"});
            }
        }
    };

    handleSuiteEnter = (value) => {
        let suites = {...this.state.suites};
        let suiteId = value + "/" + this.state.selectedBranch;
        if (suiteId in this.state.suites) {
            suites[suiteId].show = true;
        } else {
            this.props.getManagerSuiteTree(getSearchParams({
                version: this.state.selectedBranch,
                product: this.state.selectedProduct,
                suite: value,
            }), [value], this.state.selectedProduct);
        }
        this.setState({suiteSearch: "", suites});
    };

    render() {
        return (
            <Fragment>
                <TopSelect title= {
                    <span
                        style={{
                            transition: ".4s linear opacity, .4s linear visibility"
                        }}
                    >
                        <span
                            style={{
                                fontSize: "25px",
                                marginRight: "7px",
                                fontWeight: "700",
                                fontFamily: "Roboto",
                                color: "rgb(0, 125, 255)"
                            }}
                        >
                            {this.state.selectedBranch}
                        </span>
                        <span style={{fontFamily: "Roboto", fontSize: "23px", fontWeight: 400, color: "black"}}>
                            {this.state.selectedProduct}
                        </span>
                    </span>
                }>
                    <DropDown
                        title="Product"
                        data={this.state.products}
                        handleClick={this.handleProductChange}
                        style={{color: "rgb(160,160,163)"}}
                    />
                    <DropDown
                        title="Versions"
                        data={this.state.branches}
                        handleClick={this.handleBranchChange}
                        style={{color: "rgb(160,160,163)"}}
                    />
                    <DropDown title="Suites" style={{color: "rgb(160,160,163)"}}>
                        <div>
                            <div
                                className="suite-actions"
                                onClick={() => {
                                let newSuites = {...this.state.suites};
                                for (const suite of Object.keys(this.state.suites)) {
                                    newSuites[suite].show = false;
                                }
                                this.setState({suites: newSuites, selectedManager: null});
                            }}>Clear Board
                            </div>
                            <div>
                                <ToggleSwitch
                                    checked={this.state.flatten}
                                    onClick={() => this.setState((state) => ({flatten: !state.flatten}))}
                                    style={{paddingLeft: "5px"}}
                                    title={"Flatten"}
                                />
                            </div>
                        </div>
                    </DropDown>
                    <DropDown title="Managers" style={{marginRight: "20px", color: "rgb(160,160,163)"}} data={this.state.managers} handleClick={this.handleManagerChange} alignment="right"/>
                </TopSelect>
                {this.presentSecondSelect(this.state.selectedProduct)}
                <div className="main-container" style={{paddingTop: "120px"}}>
                    <div className="flex-container nested-table-container">
                        <NestedTable
                            data={this.props.suiteTrees}
                            topLevelDataFilter={this.state.suites}
                            loading={this.props.loading}
                            translateName={(name) => translateName(name.split("/")[0])}
                            renderCustomCell={this.renderCustomCell}
                            emptyBoard={this.state.emptyBoard}
                            flatten={this.state.flatten}
                            hideSkipsAndNotRun={this.state.selectedProduct === "polaris"}
                            sortableColumns={SORTABLE_COLUMNS}
                        />
                    </div>
                </div>
                {this.state.openEditModal &&
                <Modal>
                    <div className="modal-content-container" style={{width: "30%"}} onClick={(event) => event.stopPropagation()}>
                        <div style={{color: "black", marginBottom: "10px", fontWeight: 500, fontSize: "1.3em"}}>Add Issue</div>
                        <div style={{marginBottom: "6px"}}>
                            <div onClick={() => window.open(this.state.issueLink, "_blank")} className="issue-url">
                                {this.state.issueList.split(",").map(
                                    ele => {
                                        if (!ele) {
                                            return;
                                        }
                                        return (
                                            <div style={{marginLeft: "4px", display: "flex", alignItems: "center"}}>
                                                <span style={{marginRight: "2px"}}>{ele}</span>
                                                <i className="material-icons delete-issue" onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.props.changeTrIssueLink(getSearchParams({
                                                        id: this.state.tr_id,
                                                        issue: ele,
                                                        tc_id: this.state.tc_id,
                                                        ts_id: this.state.ts_id,
                                                        remove: "true"
                                                    }), this.state.tr_id);
                                                }}>close</i>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                        <div style={{marginTop: "auto"}}>
                            <span>Add Issues: </span>
                            <input style={{width: "80%"}} autofocus={"true"} type="text" value={this.state.newIssue} onChange={this.editNewIssueInput} onKeyUp={this.handleNewIssueActions}/>
                            <div style={{color: "rgb(200,80,60)"}}>{this.state.issueError}</div>
                        </div>
                    </div>
                </Modal>
                }
            </Fragment>
        );
    }
}


SuiteDashboard.defaultProps = {
    product: ["brik"],
    branch: [defaultDashboardVersion],
    "start-date": ["4w"],
    category: [0],
    suite: ["Qualify_CDM_Basic"]
};


const mapStateToProps = (state) => ({
    all_branches: state.generalData.branches,
    all_products: state.generalData.products,
    all_managers: state.generalData.managers,
    suiteTrees: state.suiteDashboard.suiteTrees,
    loading: state.suiteDashboard.loading,
    updatedInfo: state.suiteDashboard.updatedInfo,
    managerSuites: state.suiteDashboard.managerSuites,
    suites: state.generalData.suites,
    versionSuggestions: state.qualityDashboard.versionSuggestions,
});


export default connect(mapStateToProps, {
    getBranchList,
    getProductList,
    getManagerList,
    getManagerSuiteTree,
    changeTrTriageStatus,
    changeTrIssueLink,
    getManagersSuites,
    getSuites,
    getRecentVersions,
    updateInfo
})(SuiteDashboard);
