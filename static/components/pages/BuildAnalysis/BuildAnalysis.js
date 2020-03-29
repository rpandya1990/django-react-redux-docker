import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import * as PropTypes from "prop-types";

import "../../../css/ProductQuality.css";
import TopSelect from "../../reusable/TopSelect";

import {
    getTestStateAcrossBuilds,
    getTestStateBreakdown,
    getTestStateSummary,
    getTitle,
    toggleFetchingPermissions
} from "../../../actions/testState";
import NavTab from "../../reusable/NavTab";
import BuildByBuildCard from "./BuildByBuildCard";
import FailureBreakdownCard from "./FailureBreakdownCard";
import BuildSummaryCard from "./BuildSummaryCard";
import * as _ from "lodash";
import {GET_TEST_STATE_ACROSS_BUILDS, GET_TEST_STATE_BREAKDOWN, GET_TEST_STATE_SUMMARY} from "../../../actions/types";


class BuildAnalysis extends Component {
    constructor(props) {
        super(props);

        this.tabs = ["Build by Build", "Failure Breakdown", "Summary"];

        this.state = {
            selectedTab: 0,
            page: props.page,
        };
    }

    componentDidMount() {
        this.props.getTitle(this.props.id, this.props.suites && this.props.suites[0].split(","));

        const params = new URLSearchParams(this.getSearchParams().toString());
        params.delete("filters");

        if (_.isEmpty(this.props.testStateData) || !_.has(this.props.testStateData, params.toString())) {
            this.props.getTestStateAcrossBuilds(this.getSearchParams());
        }

        this.props.toggleFetchingPermissions(true);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.id, this.props.id) ||
            !_.isEqual(prevProps.suites, this.props.suites)) {
            this.props.getTitle(this.props.id, this.props.suites && this.props.suites[0].split(","));
        }
        this.props.toggleFetchingPermissions(true);
    }

    componentWillUnmount() {
        this.props.toggleFetchingPermissions(false);
    }

    fetchStateBreakDown = () => {
        const params = new URLSearchParams(this.getSearchParams().toString());
        params.delete("filters");

        if (_.isEmpty(this.props.testStateBreakDown) || !_.has(this.props.testStateBreakDown, params.toString())) {
            this.props.getTestStateBreakdown(this.getSearchParams());
        }
    };

    fetchStateSummary = () => {
        const params = new URLSearchParams(this.getSearchParams().toString());
        params.delete("filters");

        if (_.isEmpty(this.props.testStateSummary) || !_.has(this.props.testStateSummary, params.toString())) {
            this.props.getTestStateSummary(this.getSearchParams());
        }
    };

    getSearchParams = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete("filters");
        params.sort();
        BuildAnalysis.defaultProps.filters.forEach(filter => params.append("filters", filter));
        return params;
    };

    renderBuildByBuildCard = props => {
        const params = new URLSearchParams(this.getSearchParams().toString());
        params.delete("filters");

        return (
            <BuildByBuildCard title={props.title}
                              data={_.has(props.testStateData, params.toString()) ?
                                  props.testStateData[params.toString()] : {}}
                              product={props.product}
                              fetching={props.fetching[GET_TEST_STATE_ACROSS_BUILDS] > 0}
                              addingTableRows={props.addingTableRows}
                              filters={props.filters}
                              handleChangeFilters={(status) => {
                                  const urlParams = new URLSearchParams(window.location.search);
                                  urlParams.delete('filters');

                                  if (props.filters.length === 1 && props.filters.includes(status)) {
                                      return;
                                  }

                                  const filters = (props.filters && props.filters.includes(status)) ?
                                      props.filters.filter(value => {
                                          return value !== status
                                      }) : [...props.filters, status];

                                  filters.forEach(value => {
                                      urlParams.append('filters', value);
                                  });

                                  const {pathname, hash, state} = this.props.location;
                                  this.props.history.push({
                                      pathname,
                                      search: urlParams.toString(),
                                      hash,
                                      state,
                                  });
                              }}
            />
        )
    };

    renderFailureBreakdownCard = props => {
        const params = new URLSearchParams(this.getSearchParams().toString());
        params.delete("filters");

        return (
            <FailureBreakdownCard title={props.title}
                                  data={_.has(props.testStateBreakDown, params.toString()) ?
                                      props.testStateBreakDown[params.toString()] : []}
                                  fetching={props.fetching[GET_TEST_STATE_BREAKDOWN] > 0}
                                  handleFetchData={this.fetchStateBreakDown}/>
        )
    };

    renderSummaryCard = props => {
        const params = new URLSearchParams(this.getSearchParams().toString());
        params.delete("filters");

        return (
            <BuildSummaryCard title={props.title}
                              data={_.has(props.testStateSummary, params.toString()) ?
                                  props.testStateSummary[params.toString()] : []}
                              fetching={props.fetching[GET_TEST_STATE_SUMMARY] > 0}
                              handleFetchData={this.fetchStateSummary}/>
        )
    };

    renderCards = (props) => {
        const {selectedTab} = this.state;

        switch (this.tabs[selectedTab]) {
            case "Build by Build":
                return this.renderBuildByBuildCard(props);
            case "Failure Breakdown":
                return this.renderFailureBreakdownCard(props);
            case "Summary":
                return this.renderSummaryCard(props);
            default:
                return this.renderBuildByBuildCard(props);
        }
    };

    renderTopSelect = () => {
        return (
            <TopSelect
                title={
                    <span>
                        <span
                            style={{
                                fontSize: "24px",
                                marginRight: "7px",
                                fontFamily: "Montserrat",
                                color: "rgb(36,25,36)",
                            }}
                        >
                            Build
                        </span>
                        <span style={{fontFamily: "Roboto", fontSize: "22px", fontWeight: 300, color: "rgb(90,90,90)"}}>
                            Analysis
                        </span>
                    </span>
                }/>
        );
    };

    render() {
        return (
            <Fragment>
                {this.renderTopSelect()}
                <NavTab categories={this.tabs}
                        selectedTab={this.state.selectedTab}
                        onTabChange={tabIndex => {
                            this.setState({selectedTab: tabIndex})
                        }}/>
                <div className="main-container">
                    <div className="flex-container" style={{padding: "24px"}}>
                        {this.renderCards(this.props)}
                    </div>
                </div>
            </Fragment>
        );
    }
}

BuildAnalysis.propTypes = {
    title: PropTypes.string.isRequired,
    testStateSummary: PropTypes.object.isRequired,
    testStateBreakDown: PropTypes.object.isRequired,
    testStateData: PropTypes.object.isRequired,
    getTitle: PropTypes.func.isRequired,
    getTestStateSummary: PropTypes.func.isRequired,
    getTestStateBreakdown: PropTypes.func.isRequired,
    getTestStateAcrossBuilds: PropTypes.func.isRequired
};

BuildAnalysis.defaultProps = {
    id: [],
    branch: ["5.1"],
    product: ["brik", "polaris"],
    'start-date': "4w",
    'end-date': null,
    filters: ['success', 'skip', 'xfail', 'error', 'fail', 'uxpass', 'notrun'],
    "version-starts-with": null,
    triage: null,
    suites: null,
    testcase: null,
    page: 1,
};


const mapStateToProps = (state) => ({
    fetching: state.generalData.fetching,
    title: state.testState.title,
    testStateSummary: state.testState.testStateSummary,
    testStateBreakDown: state.testState.testStateBreakDown,
    testStateData: state.testState.testStateData,
    addingTableRows: state.testState.addingTableRows
});


export default connect(mapStateToProps, {
    getTitle,
    getTestStateSummary,
    getTestStateBreakdown,
    getTestStateAcrossBuilds,
    toggleFetchingPermissions
})(BuildAnalysis)