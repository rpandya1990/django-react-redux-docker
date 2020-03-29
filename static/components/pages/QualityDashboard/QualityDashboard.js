import React, {Fragment} from 'react';
import ReactDOM from "react-dom";
import TopSelect from "../../reusable/TopSelect";
import DropDown from "../../reusable/DropDown";
import InputBlock from "../../reusable/InputBlock";
import {connect} from "react-redux";
import {getBranchList, getPipelineList, getSuites, getProductList} from "../../../actions/generalData";
import {
    getEffectivePipelineRunByRun,
    getEffectiveSystemRunByRun,
    redirectFeatureTableauDash,
    getFilteredPerformanceContext,
    getLastFiveTrend,
    getPerformanceContext,
    getPerformanceRunSummary,
    getHighVariablePerfMetrics,
    getPerformanceMetricData,
    getPipelineContext,
    getPerformanceRunByRun,
    getPipelineRunByRun,
    getRecentVersions,
    getPreviousPerfMetricVersions,
    getSystemClusterBreakdown,
    getSystemClusters,
    getSystemContext,
    getSystemRunByRun,
    getSystemTestAcrossBuilds,
    getBuildByBuildRegression,
    fetchPolarisPipelineData,
    getPolarisRunByRun,
    getFeatureStressTestResults,
    getFeatureStressRunByRun
} from "../../../actions/qualityDashboard";
import {getSearchParams, PolarisVersion} from "../../../utils";
import "../../../css/Loader.css";
import "../../../css/Dashboard.css";
import _ from "lodash"
import NavTab from "../../reusable/NavTab";
import PerformanceQualityBigCard from "./PerformanceQuality/PerformanceQualityBigCard";
import SystemQualityBigCard from "./SystemQuality/SystemQualityBigCard";
import PipelineQualityBigCard from "./PipelineQuality/PipelineQualityBigCard";
import PolarisQualityBigCard from "./PolarisQuality/PolarisQualityBigCard";
import FeatureStressQualityBigCard from "./FeatureStressQuality/FeatureStressQualityBigCard";
import Filter from "../../reusable/Filter";
import LargeInput from "../../reusable/LargeInput";
import {
    defaultDashboardVersion,
    deafultDashboardPipeline,
    defaultDashboardStartDate
} from "../../../info";


const SEARCH_PARAMS = {
    "pipeline": "pipelines",
    "branch": "branches",
    "start-date": "startDate",
    "version-starts-with": "specificBranchVersion",
    "feature": "feature",
    "product": "products",
    "category": "selectedCategory"
};

const POLARIS_CATEGORIES = ["AppFlows",	"O365",	"Cloud Native",	"VSphere", "RADAR", "Data Governance", "Core Services", "All"];
const POLARIS_CATEGORY_MAP = {
    "All" : ["AppFlows", "integration_brikmock", "integration_4_2", "integration_5_0", "integration_5_1",
        "cloud_native", "Cloud Native Azure", "Cloud_Setup_AWS_Appflows", "Cloud_Setup_Azure", "cloud simpl", "data_classification",
        "Feature Branch Tests - Global SLA", "integration_o365", "odc", "radar", "integration_vsphere", "Integration_watchers",
        "o365_calendar", "o365_onedrive"
    ],
    "AppFlows": ["AppFlows"],
    "O365": ["integration_o365", "o365_calendar", "o365_onedrive"],
    "Cloud Native": ["cloud_native", "Cloud Native Azure"],
    "VSphere": ["integration_vsphere"],
    "RADAR": ["radar"],
    "Data Governance": ["odc", "data_classification"],
    "Core Services": ["integration_4_2", "integration_5_0", "integration_5_1", "integration_brikmock",
                      "Feature Branch Tests - Global SLA", "Integration_watchers"],
    "Cloud Setup": ["Cloud_Setup_AWS_Appflows", "Cloud_Setup_Azure", "cloud simpl"]
};

const POLARIS_CANARY_CATEGORY_MAP = {
    "All": ["Canary_prod001", "Canary_prod002", "Canary_prod003", "Canary_prod000"],
    "O365": ["Canary_prod001", "Canary_prod002", "Canary_prod003", "Canary_prod000"],
};


class QualityDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.dropDownStyle = {
            borderLeft: "2px solid rgb(50, 70, 90)"
        };
        this.categories = ["Pipeline", "System", "Performance", "Stress"];
        this.maxPipelineCount = 2;
        this.state = {
            pipelines: {},
            branches: {},
            products: {},
            suiteSearchField: "",
            loadingPipeline: true,
            loadingSystem: true,
            loadingPerformance: true,
            startDate: this.props["start-date"][0] ,
            specificBranchVersion: this.props["version-starts-with"][0],
            selectedProduct: this.props.product[0],
            selectedBranch: this.props.branch[0],
            selectedCategory: this.props.category[0],
            scrollActivated: false,
            feature: _.isEmpty(this.props.feature) ? null : this.props.feature[0],
            build1: "",
            build2: "",
            initialBuildRegressionLoad: true,
            stressResults: {}
        };


        if (!_.isEmpty(props.all_branches)) {
            props.all_branches[this.state.selectedProduct].forEach(branch => {
                this.state.branches[branch] = false;
            });
        }

        for (const branch of this.props.branch) {
            this.state.branches[branch] = true;
        }

        if (!_.isEmpty(props.all_pipelines)) {
            props.all_pipelines.forEach(pipeline => {
                this.state.pipelines[pipeline] = false;
            });
        }

        for (const product of props.product) {
            this.state.products[product] = product === this.state.selectedProduct;
        }


        for (const pipeline of this.props.pipeline) {
            this.state.pipelines[pipeline] = true;
        }
        this.specificVersionCall = null;
        this.sendSuiteSuggestCall = null;
        this.handleScrollEventClosure = this.handleScrollEvents();
        window.addEventListener("scroll", this.handleScrollEventClosure);
    }

    handleScrollEvents = () => {
        let scrollCall = null;
        return () => {
            clearTimeout(scrollCall);
            scrollCall = setTimeout(() => {
                if (window.scrollY > 3) {
                    this.setState({scrollActivated: true});
                } else {
                    this.setState({scrollActivated: false});
                }
            }, 50);
        }
    };

    componentDidMount() {
        this.initSearchParams();

        this.props.getBranchList();
        this.props.getPipelineList();
        this.props.getProductList();
        this.getRecentVersions();
        this.props.getFeatureStressTestResults(this.props.branch);

        if (this.state.selectedProduct === "polaris") {
            if (this.props.all_branches[this.state.selectedProduct]) {
                this.fetchPolarisData();
            }
        } else {
            this.handlePipelineContext();
            this.handleSystemContext();
            this.handlePerformanceContext();
            this.handleFeatureStressContext();

            this.handlePipelineRunByRun();

            this.handleFeatureStressRunByRun();
            this.handleSystemRunByRun();
            this.handleSystemClusters();
            this.handleSystemTestAcrossBuilds();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScrollEventClosure);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.state.initialBuildRegressionLoad && !_.isEqual(this.props.versionSuggestions, nextProps.versionSuggestions)) {
            let build1 = "";
            let build2 = "";
            let versionSuggestions = nextProps.versionSuggestions;
            if (versionSuggestions.length > 1) {
                if (versionSuggestions.length === 2 || versionSuggestions[0].split(".").length <= 2) {
                    build1 = versionSuggestions[0];
                    build2 = versionSuggestions[1];
                } else {
                    if (versionSuggestions[0].split(".").length !== versionSuggestions[1].split(".").length) {
                        build1 = versionSuggestions[1];
                        build2 = versionSuggestions[2];
                    } else if (versionSuggestions[0].split(".")[2][0] !== versionSuggestions[1].split(".")[2][0]) {
                        build1 = versionSuggestions[1];
                        build2 = versionSuggestions[2];
                    } else {
                        build1 = versionSuggestions[0];
                        build2 = versionSuggestions[1];
                    }
                }
            }
            this.setState({
                build1,
                build2,
                initialBuildRegressionLoad: false
            });
        }
        if (!_.isEmpty(nextProps.all_products, this.props.all_products)) {
            let productState = {};
            for (const product of nextProps.all_products) {
                productState[product] = product === this.state.selectedProduct;
            }
            this.setState({products: productState});
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.selectedProduct !== prevState.selectedProduct || this.state.selectedBranch !== prevState.selectedBranch || this.state.feature !== prevState.feature) {
            this.handleSubmit();
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
                const latestBranch = this.props.all_branches[this.state.selectedProduct][0];
                stateBranches[latestBranch] = true;
            }

            this.setState({branches: stateBranches});
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
                    stateBranches[this.state.selectedBranch] = true;
                }

                this.setState({
                    branches: stateBranches,
                });
            }
        }

        if (!_.isEqual(this.props.all_pipelines, prevProps.all_pipelines)) {
            let userPipelines = this.state.pipelines;
            for (const branch of this.props.all_pipelines) {
                if (!(branch in this.state.pipelines)) {
                    userPipelines[branch] = false;
                }
            }
            this.setState({pipelines: userPipelines});
        }

        if (prevState.build1 !== this.state.build1 || prevState.build2 !== this.state.build2) {
            this.getBuildByBuildRegression();
        }

        if (this.state.selectedProduct === "brik") {
            if (!_.isEqual(_.sortBy(this.props["start-date"]), _.sortBy(prevProps["start-date"])) ||
                !_.isEqual(_.sortBy(this.props["version-starts-with"]), _.sortBy(prevProps["version-starts-with"])) ||
                !_.isEqual(_.sortBy(this.props.branch), _.sortBy(prevProps.branch)) ||
                !_.isEqual(_.sortBy(this.props.pipeline), _.sortBy(prevProps.pipeline))) {
                this.setState({initialBuildRegressionLoad: true});
                this.getRecentVersions();
                this.handlePipelineContext();
                this.handleSystemContext();
                this.handlePerformanceContext();
                this.handleFeatureStressContext();

                this.handlePipelineRunByRun();

                this.handleFeatureStressRunByRun();
                this.handleSystemRunByRun();
                this.handleSystemClusters();
                this.handleSystemTestAcrossBuilds();
            }
        }
        if (this.state.selectedProduct === "polaris" && (prevState.selectedCategory !== this.state.selectedCategory || !_.isEqual(prevProps.all_branches[this.state.selectedProduct], this.props.all_branches[this.state.selectedProduct]))) {
            this.fetchPolarisData();
        }
        if (prevState.selectedCategory !== this.state.selectedCategory) {
            this.initSearchParams();
        }
    }

    redirectToProductQuality = (params, link="") => {
        const selectedBranch = this.props.branch[0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];

        params["branch"] = selectedBranch;
        params["start-date"] = selectedStartDate;
        params["product"] = this.state.selectedProduct;

        if (!_.has(params, "version-starts-with") && selectedBranch !== selectedVersion) {
            params["version-starts-with"] = selectedVersion;
        }

        let searchParams = getSearchParams(params, ["product", "triage", "filters", "branch", "start-date", "version-starts-with", "suites"]);
        this.props.history.push(`/product_quality_report?${link}&${searchParams.toString()}`);
    };


    handleBranchChange = (branch) => {
        let branchState = {...this.state.branches};
        branchState[this.state.selectedBranch] = false;
        branchState[branch] = true;
        this.setState({
            branches: branchState,
            selectedBranch: branch,
            specificBranchVersion: branch
        });
    };

    handlePipelineChange = (pipeline) => {
        let pipelineState = {...this.state.pipelines};
        let count = 0;
        pipelineState[pipeline] = !this.state.pipelines[pipeline];
        for (const pipeline of Object.keys(pipelineState)) {
            count += pipelineState[pipeline];
        }
        if (count > this.maxPipelineCount) {
            return;
        }
        this.setState({pipelines: pipelineState});
    };

    handleSubmit = ({feature} = {}) => {
        // let paramList = [];
        // for (const pipeline of Object.keys(this.state.pipelines)) {
        //     if (this.state.pipelines[pipeline]) {
        //         paramList.push("pipeline=" + pipeline);
        //     }
        // }
        // let copyBranchVersion = {...this.state.specificBranchVersion};
        // for (const branch of Object.keys(this.state.branches)) {
        //     if (this.state.branches[branch]) {
        //         paramList.push("branch=" + branch);
        //     }
        //     copyBranchVersion[branch] = branch
        // }
        // this.setState({specificBranchVersion: copyBranchVersion});
        // let url = `/quality_dashboard?${paramList.join("&")}&start-date=${this.state.startDate}`;
        // if (feature) {
        //     url += `&feature=${feature}`;
        // }
        this.initSearchParams();
        // this.props.history.push(url);
    };

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

    handlePipelineContext = () => {
        const selectedPipelines = this.props.pipeline;
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedPipelines.sort().join("") + selectedStartDate;

        if (_.isEmpty(this.props.pipeline_context) ||
            !_.has(this.props.pipeline_context, hashKey) ||
            _.isEmpty(this.props.pipeline_context[hashKey])) {
            this.props.getPipelineContext(getSearchParams({
                'pipeline': selectedPipelines,
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };

    handleSystemContext = () => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        if (_.isEmpty(this.props.system_context) ||
            !_.has(this.props.system_context, hashKey) ||
            _.isEmpty(this.props.system_context[hashKey])) {
            this.props.getSystemContext(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };

    handlePerformanceContext = () => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];

        if (_.isEmpty(this.props.performance_context) ||
            !_.has(this.props.performance_context, selectedVersion) ||
            _.isEmpty(this.props.performance_context[selectedVersion])) {
            this.props.getPerformanceContext(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                "start-date": this.props['start-date'][0]
            }), selectedVersion);
        }
    };

    handleFeatureStressContext = () => {
        const selectedBranch = this.props.branch;
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        this.props.getFeatureStressTestResults(selectedVersion);
    }

    handleEffectivePipelineRunByRun = () => {
        const selectedPipelines = this.props.pipeline;
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedPipelines.sort().join("") + selectedStartDate;

        if (_.isEmpty(this.props.effective_run_by_run['pipeline']) ||
            !_.has(this.props.effective_run_by_run['pipeline'], hashKey) ||
            _.isEmpty(this.props.effective_run_by_run['pipeline'][hashKey])) {
            this.props.getEffectivePipelineRunByRun(getSearchParams({
                'pipeline': selectedPipelines,
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };

    handlePipelineRunByRun = () => {
        const selectedPipelines = this.props.pipeline;
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedPipelines.sort().join("") + selectedStartDate;

        if (_.isEmpty(this.props.run_by_run['pipeline']) ||
            !_.has(this.props.run_by_run['pipeline'], hashKey) ||
            _.isEmpty(this.props.run_by_run['pipeline'][hashKey])) {
            this.props.getPipelineRunByRun(getSearchParams({
                'pipeline': selectedPipelines,
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };

    handleEffectiveSystemRunByRun = () => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        if (_.isEmpty(this.props.effective_run_by_run['system']) ||
            !_.has(this.props.effective_run_by_run['system'], hashKey) ||
            _.isEmpty(this.props.effective_run_by_run['system'][hashKey])) {
            this.props.getEffectiveSystemRunByRun(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };

    handleSystemRunByRun = () => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        if (_.isEmpty(this.props.run_by_run['system']) ||
            !_.has(this.props.run_by_run['system'], hashKey) ||
            _.isEmpty(this.props.run_by_run['system'][hashKey])) {
            this.props.getSystemRunByRun(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };

    handleSystemTestAcrossBuilds = () => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        if (_.isEmpty(this.props.system_test_across_builds) ||
            !_.has(this.props.system_test_across_builds, hashKey) ||
            _.isEmpty(this.props.system_test_across_builds[hashKey])) {
            this.props.getSystemTestAcrossBuilds(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };


    handleSystemClusters = () => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        if (_.isEmpty(this.props.system_clusters) ||
            !_.has(this.props.system_clusters, hashKey) ||
            _.isEmpty(this.props.system_clusters[hashKey])) {
            this.props.getSystemClusters(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion,
                'start-date': selectedStartDate,
            }), selectedVersion);
        }
    };

    handleClusterBreakdown = (selectedCategory, selectedCluster) => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        if (_.isEmpty(this.props.system_clusters_breakdown) ||
            !_.has(this.props.system_clusters_breakdown, hashKey) ||
            !_.has(this.props.system_clusters_breakdown[hashKey], selectedCategory) ||
            !_.has(this.props.system_clusters_breakdown[hashKey][selectedCategory], selectedCluster) ||
            _.isEmpty(this.props.system_clusters_breakdown[hashKey][selectedCategory][selectedCluster])) {
            this.props.getSystemClusterBreakdown(getSearchParams({
                'branch': selectedBranch,
                'start-date': selectedStartDate,
                'test_category': selectedCategory,
                'cluster_name': selectedCluster,
            }), selectedBranch);
        }
    };

    handleVersionStartsWith = (versionStartsWith) => {
        this.setState({specificBranchVersion: versionStartsWith}, () => this.initSearchParams());
    };

    handlePerformanceVersionSelection = (branch, feature, version, time) => {
        let params = getSearchParams({branch, feature, version, time, "start-date": this.props['start-date'][0]});
        this.props.getFilteredPerformanceContext(params, branch, version, feature);
    };

    getRecentVersions = (value="", branch=this.props.branch[0], pipeline_name=this.props.pipeline) => {
        window.clearTimeout(this.specificVersionCall);
        this.specificVersionCall = window.setTimeout(() => {
            this.props.getRecentVersions(getSearchParams({
                branch,
                value,
                pipeline_name: pipeline_name,
                start_date: this.props['start-date'][0]
            }));
        }, 300);
    };

    getLastFiveTrend = () => {
        const selectedPipelines = this.props.pipeline;
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedPipelines.sort().join("") + selectedStartDate;

        if (_.isEmpty(this.props.lastFiveTrend) ||
            !_.has(this.props.lastFiveTrend, hashKey) ||
            _.isEmpty(this.props.lastFiveTrend[hashKey])) {
            this.props.getLastFiveTrend(getSearchParams({
                'branch': selectedBranch,
                'suite_name': selectedPipelines,
                "version-starts-with": selectedVersion,
                "start-date": selectedStartDate,
            }))
        }
    };

    handleFeatureStressRunByRun = () => {
        const selectedBranch = this.props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            this.props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(this.props['start-date'][0]) ?
            '4w' :
            this.props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        this.props.getFeatureStressRunByRun(getSearchParams({
            'branch': selectedBranch,
            'version-starts-with': selectedVersion,
            'start-date': selectedStartDate,
        }), selectedVersion);
    };


    renderPipelineQualityBigCard = props => {
        const selectedPipelines = props.pipeline;
        const selectedBranch = props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(props['start-date'][0]) ?
            '4w' :
            props['start-date'][0];

        const generalHashKey = selectedVersion + selectedPipelines.sort().join("") + selectedStartDate;
        const comparisonHashKey = [this.state.build1, this.state.build2].sort().join("") + this.props.branch[0] + this.props.pipeline.sort().join("");
        return (
            <PipelineQualityBigCard
                branch={selectedBranch}
                specificBranchVersion={selectedVersion}
                maxPipelineCount={this.maxPipelineCount}
                selectedPipelines={selectedPipelines}
                data={props.pipeline_context[generalHashKey]}
                fetching_pipeline={Boolean(
                    _.isEmpty(props.fetching_pipeline) ||
                    !_.has(props.fetching_pipeline, selectedVersion) ||
                    props.fetching_pipeline[selectedVersion]
                )}
                fetching_effective_run_by_run={Boolean(
                    _.isEmpty(props.fetching_effective_run_by_run) ||
                    !_.has(props.fetching_effective_run_by_run['pipeline'], selectedVersion) ||
                    props.fetching_effective_run_by_run['pipeline'][selectedVersion]
                )}
                fetching_run_by_run={Boolean(
                    _.isEmpty(props.fetching_run_by_run) ||
                    !_.has(props.fetching_run_by_run['pipeline'], selectedVersion) ||
                    props.fetching_run_by_run['pipeline'][selectedVersion]
                )}
                effective_run_by_run={props.effective_run_by_run['pipeline'][generalHashKey]}
                run_by_run={props.run_by_run['pipeline'][generalHashKey]}
                handleEffectivePipelineRunByRun={this.handleEffectivePipelineRunByRun}
                handlePipelineRunByRun={this.handlePipelineRunByRun}
                redirectToProductQuality={this.redirectToProductQuality}
                handleVersionStartsWith={this.handleVersionStartsWith}
                getRecentVersions={this.getRecentVersions}
                versionSuggestions={props.versionSuggestions}
                lastFiveTrend={props.lastFiveTrend[generalHashKey]}
                getLastFiveTrend={this.getLastFiveTrend}
                getBuildByBuildRegression={this.getBuildByBuildRegression}
                buildByBuildRegression={this.props.buildByBuildRegression[comparisonHashKey]}
                fetchingBuildByBuildRegression={this.props.fetchingBuildByBuildRegression}
                build1={this.state.build1}
                build2={this.state.build2}
                changeRegressionBuild={this.changeRegressionBuild}
            />
        );
    };

    changeRegressionBuild = ({build1, build2}) => {
        this.setState({build1, build2});
    };

    getBuildByBuildRegression = () => {
        const hashKey = [this.state.build1, this.state.build2].sort().join("") + this.props.branch[0] + this.props.pipeline.sort().join("");
        this.props.getBuildByBuildRegression(getSearchParams({
            pipeline: this.props.pipeline,
            branch: this.props.branch[0],
            build1: this.state.build1,
            build2: this.state.build2,
        }), hashKey)
    };

    renderSystemQualityBigCard = props => {
        const selectedBranch = props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(props['start-date'][0]) ?
            '4w' :
            props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        return (
            <SystemQualityBigCard
                branch={selectedBranch}
                specificBranchVersion={selectedVersion}
                fetching_system={Boolean(
                    _.isEmpty(props.fetching_system) ||
                    !_.has(props.fetching_system, selectedVersion) ||
                    props.fetching_system[selectedVersion]
                )}
                fetching_system_clusters={Boolean(
                    _.isEmpty(props.fetching_system_clusters) ||
                    !_.has(props.fetching_system_clusters, selectedVersion) ||
                    props.fetching_system_clusters[selectedVersion]
                )}
                fetching_system_clusters_breakdown={
                    _.isEmpty(props.fetching_system_clusters_breakdown) ||
                    !_.has(props.fetching_system_clusters_breakdown, selectedVersion) ?
                        {} :
                        props.fetching_system_clusters_breakdown
                }
                fetching_effective_run_by_run={Boolean(
                    _.isEmpty(props.fetching_effective_run_by_run) ||
                    !_.has(props.fetching_effective_run_by_run['system'], selectedVersion) ||
                    props.fetching_effective_run_by_run['system'][selectedVersion]
                )}
                fetching_run_by_run={Boolean(
                    _.isEmpty(props.fetching_run_by_run) ||
                    !_.has(props.fetching_run_by_run['system'], selectedVersion) ||
                    props.fetching_run_by_run['system'][selectedVersion]
                )}
                fetching_system_test_across_builds={Boolean(
                    _.isEmpty(props.fetching_system_test_across_builds) ||
                    !_.has(props.fetching_system_test_across_builds, selectedVersion) ||
                    props.fetching_system_test_across_builds[selectedVersion]
                )}
                handleClusterBreakdown={(test_category, cluster_name) => {
                    this.handleClusterBreakdown(test_category, cluster_name)
                }}
                data={props.system_context[hashKey]}
                system_clusters={props.system_clusters[hashKey]}
                system_clusters_breakdown={
                    !_.isEmpty(props.system_clusters_breakdown) &&
                    _.has(props.system_clusters_breakdown, hashKey) ?
                        props.system_clusters_breakdown[hashKey] : {}
                }
                system_test_across_builds={
                    !_.isEmpty(props.system_test_across_builds) &&
                    _.has(props.system_test_across_builds, hashKey) ?
                        props.system_test_across_builds[hashKey] : {}
                }
                effective_run_by_run={props.effective_run_by_run['system'][hashKey]}
                run_by_run={props.run_by_run['system'][hashKey]}
                handleEffectiveSystemRunByRun={this.handleEffectiveSystemRunByRun}
                handleSystemRunByRun={this.handleSystemRunByRun}
                handleSystemClusters={this.handleSystemClusters}
                redirectToProductQuality={this.redirectToProductQuality}
                handleVersionStartsWith={this.handleVersionStartsWith}
                getRecentVersions={this.getRecentVersions}
                versionSuggestions={props.versionSuggestions}/>
        );
    };

    renderFeatureStressBigCard = props => {
        const selectedBranch = props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(props['start-date'][0]) ?
            '4w' :
            props['start-date'][0];

        const hashKey = selectedVersion + selectedStartDate;

        return (
            <FeatureStressQualityBigCard
                branch={selectedBranch}
                specificBranchVersion={selectedVersion}
                updateFeatureState={(feature) => {
                    this.setState({feature: feature});
                }}
                stressResults={props.stressResults}
                run_by_run={props.run_by_run['feature_stress'][hashKey]}
                redirectToProductQuality={this.redirectToProductQuality}
                handleVersionStartsWith={this.handleVersionStartsWith}
                getRecentVersions={this.getRecentVersions}
                versionSuggestions={props.versionSuggestions}/>
        );
    };


    fetchPolarisData = () => {
        let polarisCat = POLARIS_CATEGORIES[this.state.selectedCategory];
        let suitesMain = POLARIS_CATEGORY_MAP[polarisCat].map((suite) => suite + "/" + this.state.selectedBranch);
        let suitesCanary = POLARIS_CANARY_CATEGORY_MAP[polarisCat];
        if (!this.latestPolarisVersion) {
            let latestPolarisVersions = this.props.all_branches[this.state.selectedProduct].sort((a, b) => {
                if (a < b) {
                    return 1
                } else if (a > b) {
                    return -1;
                }
                return 0;
            });
            this.latestPolarisVersion = latestPolarisVersions[0];
        }
        let suitesLatest = POLARIS_CATEGORY_MAP[polarisCat].map((suite) => suite + "/" + this.latestPolarisVersion);
        let canaryId = null;
        let masterId = this.getGeneralHashKey(this.state.selectedBranch, suitesMain, this.state.startDate);
        let latestBranchId = this.getGeneralHashKey(this.latestPolarisVersion, suitesLatest, this.state.startDate);
        this.props.fetchPolarisPipelineData(getSearchParams({
            'pipeline': suitesLatest,
            'branch': this.latestPolarisVersion,
            'start-date': this.state.startDate,
            'product': this.state.selectedProduct
        }), polarisCat, latestBranchId);
        this.props.fetchPolarisPipelineData(getSearchParams({
            'pipeline': suitesMain,
            'branch': this.state.selectedBranch,
            'start-date': this.state.startDate,
            'product': this.state.selectedProduct
        }), polarisCat, masterId);
        if (suitesCanary) {
            suitesCanary = suitesCanary.map((suite) => suite + "/" + this.state.selectedBranch);
            canaryId = this.getGeneralHashKey(this.state.selectedBranch, suitesCanary, this.state.startDate);
            this.props.fetchPolarisPipelineData(getSearchParams({
                'pipeline': suitesCanary,
                'branch': this.state.selectedBranch,
                'start-date': this.state.startDate,
                'product': this.state.selectedProduct
            }), polarisCat, canaryId);
        }
        if (polarisCat !== "All") {
            this.props.getPolarisRunByRun(getSearchParams({
                'pipeline': suitesMain,
                'branch': this.state.selectedBranch,
                'start-date': this.state.startDate,
                "product": this.state.selectedProduct
            }), polarisCat, masterId);
        }
        this.setState({
            canaryId,
            masterId,
            latestBranchId
        })
    };

    renderPerformanceQualityBigCard = props => {
        const selectedBranch = props.branch[0];
        const selectedVersion = _.isEmpty(this.props["version-starts-with"]) ?
            selectedBranch :
            props["version-starts-with"][0];
        const selectedStartDate = _.isEmpty(props['start-date'][0]) ?
            '4w' :
            props['start-date'][0];

        return (
            <PerformanceQualityBigCard
                branch={selectedBranch}
                data={props.performance_context[selectedVersion]}
                performance_run_summary={props.performance_run_summary}
                performance_run_by_run={props.run_by_run['performance']}
                high_variable_perf_metrics={props.high_variable_perf_metrics}
                filtered_performance={props.filtered_performance_context}
                performanceMetricData={props.performance_metric_data}
                feature={props.feature}
                featureTableauLink={props.featureTableauLink}
                changePerfMetricJiraTags={props.changePerfMetricJiraTags}
                fetchingBaseline={props.fetchingBaseline}
                fetching_performance={Boolean(
                    _.isEmpty(props.fetching_performance) ||
                    !_.has(props.fetching_performance, selectedVersion) ||
                    props.fetching_performance[selectedVersion]
                )}
                fetching_filtered_performance={Boolean(
                    _.isEmpty(props.fetching_filtered_performance_context) ||
                    !_.has(props.fetching_filtered_performance_context, selectedVersion) ||
                    props.fetching_filtered_performance_context[selectedVersion]
                )}
                getPerformanceMetricData={props.getPerformanceMetricData}
                getPerformanceRunSummary={props.getPerformanceRunSummary}
                getPerformanceRunByRun={props.getPerformanceRunByRun}
                getHighVariablePerfMetrics={props.getHighVariablePerfMetrics}
                redirectFeatureTableauDash={this.props.redirectFeatureTableauDash}
                handlePerformanceVersionSelection={this.handlePerformanceVersionSelection}
                updateFeatureState={(feature) => {
                    this.setState({feature: feature});
                }}
                getPreviousPerfMetricVersions={this.props.getPreviousPerfMetricVersions}
                previous_perf_metric_versions={props.previous_perf_metric_versions}
                startDate={props["start-date"][0]}
                handleVersionStartsWith={this.handleVersionStartsWith}
            />
        );
    };

    getGeneralHashKey = (branch, suites, startDate) => {
        return branch + suites.sort().join("") + startDate;
    };

    renderCards = (props) => {
        const {selectedCategory, selectedProduct} = this.state;
        if (selectedProduct === "brik") {
            return (
                <div className="row">
                    <div className="col-xs-11">
                        {this.categories[selectedCategory] === "Pipeline"
                        && this.renderPipelineQualityBigCard(props)}
                        {this.categories[selectedCategory] === "System"
                        && this.renderSystemQualityBigCard(props)}
                        {this.categories[selectedCategory] === "Performance"
                        && this.renderPerformanceQualityBigCard(props)}
                        {this.categories[selectedCategory] === "Stress"
                        && this.renderFeatureStressBigCard(props)}
                    </div>
                </div>
            )
        } else {
            let polarisCat = POLARIS_CATEGORIES[this.state.selectedCategory];
            return (
                <div className="row">
                    <div className="col-xs-11">
                        <PolarisQualityBigCard
                            canaryId={this.state.canaryId}
                            masterId={this.state.masterId}
                            latestBranchId={this.state.latestBranchId}
                            latestBranch={this.latestPolarisVersion}
                            branch={this.state.selectedBranch}
                            category={polarisCat}
                            data={this.props.polarisPipelineContext[polarisCat] || {}}
                            graphData={this.props.polarisRunByRun[polarisCat] || {}}
                            redirectToProductQuality={this.redirectToProductQuality}
                        />
                    </div>
                </div>
            )
        }
    };

    handleSuiteLookUp = (value) => {
        window.clearTimeout(this.sendSuiteSuggestCall);
        this.sendSuiteSuggestCall = window.setTimeout(() =>
            this.props.getSuites(getSearchParams({branch: this.props.branch[0], search: value})), 300
        );
    };

    handleProductChange = (product) => {
        let products = {...this.state.products};
        let branches = {...this.state.branches};
        products[this.state.selectedProduct] = false;
        products[product] = true;
        let currBranch = product === "polaris" ? "master"  : defaultDashboardVersion;
        branches[this.state.selectedBranch] = false;
        branches[currBranch] = true;
        this.setState({startDate: "2w", selectedCategory: 0, branches, specificBranchVersion: currBranch, selectedBranch: currBranch, selectedProduct: product, products});
    };

    renderTopSelect = () => {
        return (
            <TopSelect
                topSelectBlockStyle={this.state.scrollActivated && this.state.selectedProduct !== "polaris" ? {borderBottom: "1px solid rgb(220,220,220)"} : {}}
                endAlignContent={false}
                title={
                    <span
                        style={{
                            opacity: this.state.scrollActivated && this.state.selectedProduct !== "polaris" ? 0 : 1,
                            visibility: this.state.scrollActivated && this.state.selectedProduct !== "polaris" ? "hidden" : "visible",
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
                            {this.props.branch[0]}
                        </span>
                        <span style={{fontFamily: "Roboto", fontSize: "23px", fontWeight: 400, color: "black"}}>
                            Quality
                        </span>
                    </span>
                }
            >
                <LargeInput
                    value={this.state.suiteSearchField}
                    getResults={this.handleSuiteLookUp}
                    handleKeyUp={(value) => this.setState({suiteSearchField: value})}
                    handleEnter={(value) => this.redirectToProductQuality({suites: value})}
                    style={{marginRight: "15px", marginLeft: "auto", paddingLeft: "150px"}}
                    data={this.props.suites}
                />
                {this.state.selectedProduct !== "polaris" &&
                <DropDown
                    key="version-dropdown"
                    title="Version"
                    data={this.state.branches}
                    closedButtonStyle={{
                        color: "rgb(145,145,148)",
                    }}
                    handleClick={this.handleBranchChange}
                />}
                {this.state.selectedProduct !== "polaris" &&
                <DropDown
                    key="pipeline-dropdown"
                    title="Pipeline"
                    data={this.state.pipelines}
                    handleClick={this.handlePipelineChange}
                    handleSubmit={this.handleSubmit}
                    closedButtonStyle={{
                        color: "rgb(145,145,148)",
                    }}
                />
                }
                <DropDown
                    key="product-dropdown"
                    title="Product"
                    data={this.state.products}
                    handleClick={this.handleProductChange}
                    closedButtonStyle={{
                        color: "rgb(145,145,148)",
                    }}
                />
                <InputBlock key="starttime-filter"
                    style={
                        {
                            fontSize: "12px",
                            padding: "0px 20px",
                            paddingTop: "2px",
                        }
                    }
                    title="Start Time" inputValue={this.state.startDate}
                    handleEnter={this.handleSubmit}
                    handleChange={(e) => this.setState({startDate: e.target.value})}
                />
            </TopSelect>
        );
    };

    renderNavTab = () => {
        if (this.state.selectedProduct === "brik") {
            return (
                <NavTab
                    style={this.state.scrollActivated ? {backgroundColor: "transparent", borderBottom: "none", zIndex: 100, width: "auto"} : {zIndex: 100, backgroundColor: "transparent", width: "auto"}}
                    tabGroupStyle={this.state.scrollActivated ? {transform: "translate(-15px, -50px)"} : {transform: "translate(0px, 0px)"}}
                    categories={this.categories}
                    selectedTab={this.state.selectedCategory}
                    onTabChange={tabIndex => {
                        this.setState({selectedCategory: tabIndex})
                    }}
                />
            )
        } else {
            return (
                <NavTab
                    style={{backgroundColor: "rgba(255,255,255,1)", borderBottom: "1px solid rgb(220,220,220)"}}
                    categories={POLARIS_CATEGORIES}
                    selectedTab={this.state.selectedCategory}
                    onTabChange={tabIndex => {
                        this.setState({selectedCategory: tabIndex})
                    }}
                />
            )
        }

    };

    render() {
        return (
            <div>
                <div style={{height: "97px", transition: ".8s background-color", backgroundColor: this.state.scrollActivated && this.state.selectedProduct !== "polaris" ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)"}}>
                    {this.renderTopSelect()}
                    {this.renderNavTab()}
                </div>
                <div className="main-container" style={{paddingTop: "12px"}}>
                    <div className="flex-container">
                        {this.renderCards(this.props)}
                    </div>
                </div>
            </div>
        )
    }
}


QualityDashboard.defaultProps = {
    product: ["brik"],
    branch: [defaultDashboardVersion],
    "version-starts-with": [defaultDashboardVersion],
    "start-date": [defaultDashboardStartDate],
    pipeline: [deafultDashboardPipeline],
    all_branches: {},
    all_pipelines: [],
    feature: [],
    category: [0],
    subCategory: [0]
};


const mapStateToProps = (state) => ({
    all_branches: state.generalData.branches,
    all_pipelines: state.generalData.pipelines,
    all_products: state.generalData.products,
    pipeline_context: state.qualityDashboard.pipeline_context,
    system_context: state.qualityDashboard.system_context,
    performance_context: state.qualityDashboard.performance_context,
    performance_run_summary: state.qualityDashboard.performance_run_summary,
    high_variable_perf_metrics: state.qualityDashboard.high_variable_perf_metrics,
    feature_stress_context: state.qualityDashboard.feature_stress_context,
    effective_run_by_run: state.qualityDashboard.effective_run_by_run,
    run_by_run: state.qualityDashboard.run_by_run,
    system_test_across_builds: state.qualityDashboard.system_test_across_builds,
    system_clusters: state.qualityDashboard.system_clusters,
    system_clusters_breakdown: state.qualityDashboard.system_clusters_breakdown,
    fetching_pipeline: state.qualityDashboard.fetching_pipeline,
    fetching_performance: state.qualityDashboard.fetching_performance,
    fetching_system: state.qualityDashboard.fetching_system,
    fetching_effective_run_by_run: state.qualityDashboard.fetching_effective_run_by_run,
    fetching_run_by_run: state.qualityDashboard.fetching_run_by_run,
    fetching_system_test_across_builds: state.qualityDashboard.fetching_system_test_across_builds,
    fetching_system_clusters: state.qualityDashboard.fetching_system_clusters,
    fetching_system_clusters_breakdown: state.qualityDashboard.fetching_system_clusters_breakdown,
    filtered_performance_context: state.qualityDashboard.filtered_performance_context,
    fetching_filtered_performance_context: state.qualityDashboard.fetching_filtered_performance_context,
    performance_metric_data: state.qualityDashboard.performance_metric_data,
    versionSuggestions: state.qualityDashboard.versionSuggestions,
    previous_perf_metric_versions: state.qualityDashboard.previous_perf_metric_versions,
    lastFiveTrend: state.qualityDashboard.lastFiveTrend,
    buildByBuildRegression: state.qualityDashboard.buildByBuildRegression,
    fetchingBuildByBuildRegression: state.qualityDashboard.fetchingBuildByBuildRegression,
    suites: state.generalData.suites,
    fetchingBaseline: state.qualityDashboard.fetching_baseline,
    polarisFetching: state.qualityDashboard.polarisFetching,
    polarisPipelineContext: state.qualityDashboard.polarisPipelineContext,
    polarisRunByRun: state.qualityDashboard.polarisRunByRun,
    stressResults: state.qualityDashboard.stressResults
});


export default connect(mapStateToProps, {
    getBranchList,
    getPipelineList,
    getPipelineContext,
    getPerformanceContext,
    getPerformanceRunSummary,
    getHighVariablePerfMetrics,
    getEffectivePipelineRunByRun,
    getPerformanceRunByRun,
    getPipelineRunByRun,
    getEffectiveSystemRunByRun,
    getSystemContext,
    getSystemRunByRun,
    getFeatureStressRunByRun,
    getSystemTestAcrossBuilds,
    getSystemClusters,
    getSystemClusterBreakdown,
    getFilteredPerformanceContext,
    getPerformanceMetricData,
    getRecentVersions,
    getPreviousPerfMetricVersions,
    redirectFeatureTableauDash,
    getLastFiveTrend,
    getBuildByBuildRegression,
    getSuites,
    getProductList,
    fetchPolarisPipelineData,
    getPolarisRunByRun,
    getFeatureStressTestResults,
})(QualityDashboard);
