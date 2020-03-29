import React, {Fragment} from "react";
import {Arrow} from "./Icons";
import "../../css/NestedTable.css";
import _ from "lodash";


class NestedTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parentToChildren: {},
            childToParent: {},
            displayTree: {},
            rootToLeaf: {},
            leaves: {}
        };
        this.MARGIN_ADDITION = 16;
        this.MARGIN_BASE = 6;
        for (const col of Object.keys(this.props.sortableColumns)) {
            this.state[col] = col;
        }
        let displayTree = {};
        let parentToChildren = {};
        let childToParent = {};
        let leaves = {};
        for (const child of Object.keys(this.props.data.children)) {
            this.findInitialState({[child]: this.props.data.children[child]}, displayTree, parentToChildren , childToParent, leaves, "", child, null);
        }
        this.state = Object.assign({}, this.state, {
            displayTree,
            parentToChildren,
            childToParent,
            leaves
        });
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(nextProps.data.children, this.props.data.children)) {
            let displayTreeBranch = {};
            let parentToChildrenBranch = {};
            let childToParentBranch = {};
            let leavesBranch = {};
            for (const child of Object.keys(nextProps.data.children)) {
                if (!(child in this.props.data.children)) {
                    this.findInitialState({[child]: nextProps.data.children[child]}, displayTreeBranch, parentToChildrenBranch , childToParentBranch, leavesBranch, "", child, null);
                }
            }
            this.setState(
                {
                    displayTree: Object.assign({}, this.state.displayTree, displayTreeBranch),
                    childToParent: Object.assign({}, this.state.childToParent, childToParentBranch),
                    parentToChildren: Object.assign({}, this.state.parentToChildren, parentToChildrenBranch),
                    leaves: Object.assign({}, this.state.leaves, leavesBranch),
                }
            )
        }
        // if (nextProps.emptyBoard !== this.props.emptyBoard && nextProps.emptyBoard) {
        //     let displayTreeState = {};
        //     for (const node in Object.keys(this.props.displayTree)) {
        //
        //     }
        //     this.setState(
        //         {
        //             displayTree: Object.assign({}, this.state.displayTree, displayTreeBranch),
        //             childToParent: Object.assign({}, this.state.childToParent, childToParentBranch)
        //         }
        //     )
        // }
    }

    getItemRepresentation = (item, columnName, comparison) => {
        if (item === columnName || item === "-----") {
            return item;
        }
        if (comparison === "greater") {
            return ">" + item;
        } else if (comparison === "less than") {
            return "<" + item;
        }
        return item;
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    renderColumnTitles = (columns) => {
        return (
            <tr className="header-suite-row">
                <th>Test Cases/Suites </th>
                {columns.map(column => {
                    if (column.name in this.props.sortableColumns) {
                        return (
                            <th>
                                <select onChange={(event) => this.setState({[column.name]:event.target.value})}>
                                    {[column.name, "-----", ...this.props.sortableColumns[column.name].values].map(
                                        item => {
                                            return (
                                                <option
                                                    disabled={item === "-----"}
                                                    selected={item === this.state[column.name]}
                                                    value={item}
                                                >
                                                    {this.getItemRepresentation(item, column.name, this.props.sortableColumns[column.name].comparison)}
                                                </option>
                                            );
                                        }
                                    )}
                                </select>
                            </th>
                        );
                    } else {
                        return <th key={column.name}>{column.name}</th>;
                    }

                })}
            </tr>
        );
    };

    findInitialState = (data, displayTree, parentToChildren, childToParent, leaves,
                        parentId="", root=null, treeParent=null) => {
        if (!data) {
            return;
        }
        parentToChildren[parentId] = Object.keys(data).map(key => parentId+key);
        return Object.keys(data).map(
            (rowTitle,i) => {
                displayTree[parentId+rowTitle] = !parentId;
                childToParent[parentId+rowTitle] = parentId;
                this.findInitialState(data[rowTitle].children, displayTree, parentToChildren, childToParent, leaves,
                    parentId+rowTitle, root, rowTitle);
                if (_.isEmpty(data[rowTitle].children)) {
                    leaves[parentId+rowTitle] = rowTitle;
                }
            }
        );
    };

    dfsCloseSuites = (suiteId, stateCopy) => {
        for (const id of this.state.parentToChildren[suiteId]) {
            if (this.state.displayTree[id]) {
                stateCopy[id] = !this.state.displayTree[id];
                this.dfsCloseSuites(id, stateCopy);
            }
        }
    };

    presentData = (column, data, treeNode, nodeId) => {
        if (!data) {
            return [null, null];
        }
        if (column.custom) {
            return this.props.renderCustomCell(column, data, this.state, treeNode, nodeId);
        }
        if (column.link) {
            if (column.link.attribute_link) {
                return [<a target="_blank" style={{textDecoration: "none"}} href={data[column.link.attribute_link]}>{data[column.id]}</a>, data[column.id]];
            } else if (column.link.icon && data[column.id]) {
                return [<a target="_blank" href={data[column.id]} style={{display: "flex", justifyContent: "center", textDecoration: "none"}}><i className="material-icons" style={{fontSize: "19px"}}>{column.link.icon}</i></a>, null];
            }
        }
        return [<div>{data[column.id]}</div>, data[column.id]];
    };

    filterByColumns = (datum, rowHasChildren, treeNode, nodeId) => {
        for (const column of this.props.data.columns) {
            if ((this.props.flatten && rowHasChildren) || this.presentData(column, datum.data, treeNode, nodeId)[1] === null || typeof this.state[column.name] === "undefined" || (typeof this.state[column.name] !== "undefined" && this.state[column.name] === column.name)) {
                continue;
            }
            if (this.props.sortableColumns[column.name].comparison === "multi") {
                if (this.props.sortableColumns[column.name].multiComparisonValues[this.state[column.name]]) {
                    return this.props.sortableColumns[column.name].multiComparisonValues[this.state[column.name]].includes(this.presentData(column, datum.data, treeNode, nodeId)[1])
                }
            } else if (this.props.sortableColumns[column.name].comparison === "exact") {
                let val = this.presentData(column, datum.data, treeNode, nodeId)[1];
                if (Array.isArray(val)) {
                    return val.includes(this.state[column.name]);
                } else {
                    return val === this.state[column.name];
                }
            } else if (this.props.sortableColumns[column.name].comparison === "greater") {
                if (this.props.sortableColumns[column.name].type === "int") {
                    return parseInt(this.presentData(column, datum.data, treeNode, nodeId)[1]) > parseInt(this.state[column.name])
                } else {
                    return this.presentData(column, datum.data, treeNode, nodeId)[1] > this.state[column.name]
                }
            } else if (this.props.sortableColumns[column.name].comparison === "less than") {
                if (this.props.sortableColumns[column.name].type === "int") {
                    return parseInt(this.presentData(column, datum.data, treeNode, nodeId)[1]) < parseInt(this.state[column.name])
                } else {
                    return this.presentData(column, datum.data, treeNode, nodeId)[1] < this.state[column.name];
                }
            }
        }
        return true;
    };

    renderNestedBodyData = (data, margin=0, parent="") => {
        if (!data) {
            return;
        }
        return Object.keys(data).filter((ele) => {
            if (parent) {
                return true;
            }
            return this.props.topLevelDataFilter[ele] && this.props.topLevelDataFilter[ele].show;
        }).sort().map(
            (rowTitle,i) => {
                let rowHasChildren = !_.isEmpty(this.state.parentToChildren[parent+rowTitle]);
                let rowDisplay = "none";
                if (this.props.flatten) {
                    if (!rowHasChildren) {
                        rowDisplay = "table-row";
                    }
                } else {
                    if (this.state.displayTree[parent+rowTitle]) {
                        if (!this.props.hideSkipsAndNotRun || (this.props.hideSkipsAndNotRun && !(data[rowTitle].data.state === "NotRun" || data[rowTitle].data.state === "Skip"))) {
                            rowDisplay = "table-row";
                        }
                    }
                }
                if (!this.filterByColumns(data[rowTitle], rowHasChildren, rowTitle, parent+rowTitle)) {
                    return;
                }
                let tableRow = (
                    <tr style={{display: rowDisplay}} className={"suite-row " + (rowHasChildren ? "" : "last-child")} key={parent+rowTitle} onClick={() => {
                        if (!rowHasChildren) {
                            return;
                        }
                        let stateAdjustments = {};
                        for (const id of this.state.parentToChildren[parent+rowTitle]) {
                            stateAdjustments[id] = !this.state.displayTree[id];
                            if (this.state.displayTree[id]) {
                                this.dfsCloseSuites(id, stateAdjustments);
                            }
                        }
                        this.setState({displayTree: {...this.state.displayTree, ...stateAdjustments}});
                    }}>
                        <td style={{width: "42%"}} className="suite-cell">
                            <div style={{marginLeft: this.props.flatten ? this.MARGIN_BASE + "px" : margin+this.MARGIN_BASE+"px", display: "flex", alignItems: "center", borderLeft: !parent ? "3px solid rgb(200,200,200)" : "1px solid rgb(200,200,200)", paddingLeft: "8px"}}>
                                <div style={{marginRight: "2px", color: "black"}}>{this.props.translateName(rowTitle)}</div>
                                {rowHasChildren && <Arrow style={{color: "rgb(160,160,160)"}} flip={this.state.displayTree[this.state.parentToChildren[parent+rowTitle][0]]} defaultState="down"/>}
                            </div>
                        </td>
                        {this.props.data.columns.map((column,j) => {
                            return <td key={column+i+j} className="suite-cell">{this.presentData(column, data[rowTitle].data, rowTitle, parent+rowTitle)[0]}</td>
                        })}
                    </tr>
                );
                return (
                    <Fragment key={rowTitle+i}>
                        {tableRow}
                        {this.renderNestedBodyData(data[rowTitle].children, this.MARGIN_ADDITION + margin, parent+rowTitle)}
                    </Fragment>
                );
            }
        );
    };

    render () {
        return (
            <div>
                {this.props.loading ? <div className="loading-bar"/> : <div style={{height: "4px"}}/>}
                {(!_.isEmpty(this.props.data.children) && !_.isEmpty(this.props.data.columns)) && (
                    <table style={{animation: ".8s fade-in", width: "100%"}} >
                        <thead>
                        {this.renderColumnTitles(this.props.data.columns)}
                        </thead>
                        <tbody style={{display: "table-row-group"}}>
                        {this.renderNestedBodyData(this.props.data.children)}
                        </tbody>
                    </table>
                )}
            </div>
        )
    }
}


NestedTable.defaultProps = {
    renderCustomCell: () => {},
    loading: false,
    translateName: (name) => name,
    flatten: false,
    sortableColumns: {},
    hideSkipsAndNotRun: false   //this is pretty specific, we can abstract this out to a generic filter prop
};


export default NestedTable;
