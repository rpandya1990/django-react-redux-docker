import React from "react";
import Filter from "../../../reusable/Filter";
import RegressionTable from "./RegressionTable";
import _ from "lodash";


class BuildRegression extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focus: null,
            startsWithFilterString: "",
            containsFilterString: "",
            build1: "",
            build2: ""
        }
    }

    changeRegressionBuild = (build, value) => {
        if (build === 1) {
            this.setState({build1: value});
        } else if (build === 2) {
            this.setState({build2: value});
        }
    };

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.build2 !== this.props.build2 || nextProps.build1 !== this.props.build1) {
            this.setState({build1: nextProps.build1, build2: nextProps.build2});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.fetchingBuildByBuildRegression && !this.state.focus &&
            (this.state.build1 && this.state.build2) && (this.state.build1 !== prevState.build1 || this.state.build2 !== prevState.build2)) {
            let {build1, build2} = this.state;
            this.props.changeRegressionBuild({build1, build2});
        }
    }

    render() {
        return (
            <div style={{flexBasis: "1238px", minWidth: "1238px", maxHeight: "500px", marginRight: "0px"}}
                 className="dashboard-item">
                <div className="half-title" style={{paddingTop: "10px", marginBottom: "5px"}}>
                    <span style={{}}>Regression</span>
                </div>
                <div style={{display: "flex", margin: "0px 50px"}}>
                    <Filter
                        value={this.state.build2}
                        dropdownData={this.props.versionSuggestions}
                        handleChange={(value) => this.changeRegressionBuild(2, value)}
                        handleKeyUp={(e) => {
                            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "ArrowLeft") {
                                return;
                            }
                        }}
                        onFocus={(value) => {
                            this.setState({focus: "build2"});
                            this.props.getRecentVersions("");
                        }}
                        focused={this.state.focus === "build2"}
                        title={"Earlier Build: " + this.state.build2}
                        style={{marginRight: "30px",  minWidth: "200px"}}
                        handleFilterEnter={
                            (value) => {
                                this.changeRegressionBuild(2, value);
                                this.setState({focus: null});
                            }
                        }
                    />
                    <Filter
                        dropdownData={this.props.versionSuggestions}
                        onFocus={(value) => {
                            this.setState({focus: "build1"});
                            this.props.getRecentVersions("");
                        }}
                        focused={this.state.focus === "build1"}
                        value={this.state.build1}
                        handleChange={(value) => this.changeRegressionBuild(1, value)}
                        handleKeyUp={(e) => {
                            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "ArrowLeft") {
                                return;
                            }
                        }}
                        title={"Later Build: " + this.state.build1}
                        style={{marginRight: "10px", minWidth: "200px"}}
                        handleFilterEnter={
                            (value) => {
                                this.changeRegressionBuild(1, value);
                                this.setState({focus: null});
                            }
                        }
                    />
                    <Filter
                        title="Starts With Search"
                        style={{marginLeft: "auto", marginRight: "20px"}}
                        onFocus={() => {
                            this.setState({focus: "search1"});
                        }}
                        focused={this.state.focus === "search1"}
                        focusColor="rgba(225, 16, 15, 0.75)"
                        value={this.state.startsWithFilterString}
                        handleChange={(value) => {
                            this.setState({startsWithFilterString: value});
                        }}
                    />
                    <Filter
                        title="Contains Search"
                        onFocus={() => {
                            this.setState({focus: "search2"});
                        }}
                        focused={this.state.focus === "search2"}
                        style={{marginRight: "20px"}}
                        focusColor="rgba(225, 16, 15, 0.75)"
                        value={this.state.containsFilterString}
                        handleChange={(value) => {
                            this.setState({containsFilterString: value});
                        }}
                    />
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "10px"
                }}>
                    <RegressionTable
                        containsFilterString={this.state.containsFilterString}
                        startsWithFilterString={this.state.startsWithFilterString}
                        buildByBuildRegression={this.props.buildByBuildRegression}
                        displayLoader={this.props.fetchingBuildByBuildRegression}/>
                </div>
            </div>
        )
    }
}


export default BuildRegression;
