import React, {Fragment} from 'react';
import {connect} from "react-redux";
import {getSearchParams} from "../../utils";
import "../../css/Loader.css";
import "../../../css/Dashboard.css";
import _ from "lodash"
import NavTab from "../../reusable/NavTab";


class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.dropDownStyle = {
            borderLeft: "2px solid rgb(50, 70, 90)"
        };
        this.state = {
            items: [],
            categories: ["Home", "About"],
            selectedCategory: 0
        };
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
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScrollEventClosure);
    }

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
                    {this.renderNavTab()}
                </div>
            </div>
        )
    }
}


HomePage.defaultProps = {
    items: ["abc", "def", "ghj"]
};


const mapStateToProps = (state) => ({
    all_items: state.generalData.branches
});


export default connect(mapStateToProps, {
    getItems
})(HomePage);
