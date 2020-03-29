import React from 'react';
import classNames from 'classnames';
import * as PropTypes from 'prop-types';
import {fade, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import InputBase from '@material-ui/core/InputBase';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import moment from "moment"
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import TestResultForm from "./TestResultForm";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import _ from "lodash";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import {isJSON, isSubset} from "../../../utils";


function createTableData(testResult) {
    return {
        'id': testResult['id'],
        'url': testResult['url'],
        'label': testResult['label'],
        'test_case': {
            'id': testResult['test_case']['id'],
            'url': testResult['test_case']['url'],
            'name': testResult['test_case']['label'],
        },
        'repo': {
            'id': testResult['repo']['id'],
            'url': testResult['repo']['url'],
            'name': testResult['repo']['label'],
        },
        'product': {
            'id': testResult['product']['id'],
            'url': testResult['product']['url'],
            'name': testResult['product']['label']
        },
        'branch': {
            'id': testResult['branch']['id'],
            'url': testResult['branch']['url'],
            'name': testResult['branch']['label'],
        },
        'version': {
            'id': testResult['version']['id'],
            'url': testResult['version']['url'],
            'name': testResult['version']['label'],
        },
        'owner': {
            'id': testResult['owner']['id'],
            'url': testResult['owner']['url'],
            'name': testResult['owner']['label'],
        },
        'test_category': testResult['test_category'],
        'start_time': testResult['start_time'],
        'end_time': testResult['end_time'],
        'status': testResult['status'],
        'status_message': testResult['status_message'],
        'stack_trace': testResult['stack_trace'],
        'triage_status': testResult['triage_status'],
        'triage_resolution': testResult['triage_resolution'],
        'triage_comment': testResult['triage_comment'],
        'issue_tracker_url': testResult['issue_tracker_url'],
        'build_version': testResult['build_version_str'] || testResult['version']['label'].split(':').splice(-1).join(''),
        'data': testResult['data']
    };
}

function createMenuData(item) {
    return {
        'value': item.id,
        'label': item.label
    }
}

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
    {id: 'test_case', numeric: true, disablePadding: false, label: 'Test Case'},
    {id: 'status', numeric: true, disablePadding: false, label: 'Status'},
    {id: 'product', numeric: true, disablePadding: false, label: 'Product'},
    {id: 'build_version', numeric: true, disablePadding: false, label: 'Build Version'},
    {id: 'start_time', numeric: true, disablePadding: false, label: 'Start Time'},
    {id: 'end_time', numeric: true, disablePadding: false, label: 'End Time'},
];

const tableHeadStyles = theme => ({
    paddingCheckbox: {
        padding: "0px 4px 0px 4px",
    },
    headPaddingTitle: {
        padding: "14px 16px 14px 36px"
    },
});

class EnhancedTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {classes, onSelectAllClick, order, orderBy, numSelected, rowsOnPage, rowsPerPage} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell className={classes.paddingCheckbox}
                               padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowsOnPage}
                            checked={numSelected === rowsOnPage && rowsOnPage > 0 && numSelected > 0}
                            onChange={onSelectAllClick}
                        />
                    </TableCell>
                    {rows.map(
                        row => (
                            <TableCell
                                key={row.id}
                                className={classes.headPaddingTitle}
                                align={row.numeric ? 'center' : 'left'}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.id ? order : false}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === row.id}
                                        direction={order}
                                        onClick={this.createSortHandler(row.id)}
                                    >
                                        {row.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        ),
                        this,
                    )}
                </TableRow>
            </TableHead>
        );
    }
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    rowsOnPage: PropTypes.number.isRequired,
};

EnhancedTableHead = withStyles(tableHeadStyles)(EnhancedTableHead);

const toolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
    search: {
        position: 'relative',
        whiteSpace: 'nowrap',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
            '&:focus': {
                width: 250,
            },
        },
    },
    button: {
        margin: theme.spacing(1),
        whiteSpace: "nowrap",
    },
});

class EnhancedTableToolbar extends React.Component {
    constructor(props) {
        super(props);

        this.searchHandler = null;

        this.searchMenu = [
            {
                'value': 'test_case',
                'label': 'Test Case'
            },
            {
                'value': 'test_suite',
                'label': 'Test Suite'
            },
            {
                'value': 'data',
                'label': 'Data'
            }
        ];

        this.state = {
            selectedSearch: 0,
            searchAnchorEl: null,
            productAnchorEl: null,
            branchAnchorEl: null,
            versionAnchorEl: null,
            statusAnchorEl: null,
            categoryAnchorEl: null,
            productSelectedIndex: 0,
            branchSelectedIndex: 0,
            versionSelectedIndex: 0,
            statusSelectedIndex: 0,
            categorySelectedIndex: 0,
            repoMenu: this.getMenuData(props.repositories),
            productMenu: this.getMenuData(props.products),
            branchMenu: this.getMenuData(props.branches),
            versionMenu: this.getMenuData(props.versions),
            statusMenu: this.getMenuData(props.test_status),
            triageMenu: this.getMenuData(props.triage_status),
            categoryMenu: this.getMenuData(props.test_category),
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.repositories, nextProps.repositories)) {
            this.setState({repoMenu: this.getMenuData(nextProps.repositories)})
        }
        if (!_.isEqual(this.props.products, nextProps.products)) {
            this.setState({productMenu: this.getMenuData(nextProps.products)})
        }
        if (!_.isEqual(this.props.branches, nextProps.branches)) {
            this.setState({branchMenu: this.getMenuData(nextProps.branches)})
        }
        if (!_.isEqual(this.props.versions, nextProps.versions)) {
            this.setState({versionMenu: this.getMenuData(nextProps.versions)})
        }
        if (!_.isEqual(this.props.test_status, nextProps.test_status)) {
            this.setState({statusMenu: this.getMenuData(nextProps.test_status)})
        }
        if (!_.isEqual(this.props.triage_status, nextProps.triage_status)) {
            this.setState({triageMenu: this.getMenuData(nextProps.triage_status)})
        }
        if (!_.isEqual(this.props.test_category, nextProps.test_category)) {
            this.setState({categoryMenu: this.getMenuData(nextProps.test_category)})
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevState.productSelectedIndex, this.state.productSelectedIndex) ||
            !_.isEqual(prevState.branchSelectedIndex, this.state.branchSelectedIndex) ||
            !_.isEqual(prevState.versionSelectedIndex, this.state.versionSelectedIndex) ||
            !_.isEqual(prevState.statusSelectedIndex, this.state.statusSelectedIndex) ||
            !_.isEqual(prevState.categorySelectedIndex, this.state.categorySelectedIndex)) {
            const selectedProduct = this.state.productSelectedIndex === 0 ? null : this.state.productMenu[this.state.productSelectedIndex].value;
            const selectedBranch = this.state.branchSelectedIndex === 0 ? null : this.state.branchMenu[this.state.branchSelectedIndex].value;
            const selectedVersion = this.state.versionSelectedIndex === 0 ? null : this.state.versionMenu[this.state.versionSelectedIndex].value;
            const selectedStatus = this.state.statusSelectedIndex === 0 ? null : this.state.statusMenu[this.state.statusSelectedIndex].value;
            const selectedCategory = this.state.categorySelectedIndex === 0 ? null : this.state.categoryMenu[this.state.categorySelectedIndex].value;
            this.props.onChangeFilters(selectedProduct, selectedBranch, selectedVersion, selectedStatus, selectedCategory);
        }
    }

    getMenuData = (data) => {
        const menuData = [
            {
                'value': 'null',
                'label': 'Any'
            }
        ];
        data.forEach(item => {
            menuData.push(createMenuData(item));
        });
        return menuData;
    };

    render() {
        const {numSelected, classes} = this.props;
        const {
            searchAnchorEl, productAnchorEl, branchAnchorEl, versionAnchorEl, statusAnchorEl, categoryAnchorEl,
            productSelectedIndex, branchSelectedIndex, versionSelectedIndex, statusSelectedIndex, categorySelectedIndex,
            productMenu, branchMenu, versionMenu, statusMenu, triageMenu, categoryMenu, selectedSearch
        } = this.state;

        return numSelected > 0 ? (
                (
                    <Toolbar
                        className={classNames(classes.root, {
                            [classes.highlight]: numSelected > 0,
                        })}
                    >
                        <div className={classes.title}>
                            <Typography color="inherit" variant="subtitle1">
                                {numSelected} selected
                            </Typography>
                        </div>
                        <div className={classes.spacer}/>
                        <div className={classes.actions}>
                            <Tooltip title="Delete">
                                <IconButton aria-label="Delete"
                                            onClick={e => {
                                                this.props.onClickDelete();
                                            }}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Tooltip>
                        </div>
                    </Toolbar>
                )
            ) :
            (
                <Toolbar
                    className={classNames(classes.root, {
                        [classes.highlight]: numSelected > 0,
                    })}
                >
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "nowrap",
                        width: "100%",
                        justifyContent: "space-between"
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start"
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                minWidth: "450px"
                            }}>
                                <div style={{
                                    display: "flex",
                                    whiteSpace: "nowrap"
                                }}>
                                    <div className={classes.title}>
                                        <Typography variant="h6" id="tableTitle">
                                            Test Results
                                        </Typography>
                                    </div>
                                </div>
                                <div style={{
                                    display: "flex",
                                    flex: "0 0 14rem",
                                    alignItems: "flex-start",
                                    alignSelf: "center",
                                }}>
                                    <div className={classes.grow}/>
                                    <div className={classes.search}>
                                        <IconButton aria-label="Search"
                                                    aria-owns={searchAnchorEl ? 'menu-list-grow' : undefined}
                                                    aria-haspopup="true"
                                                    onClick={e => {
                                                        this.setState({searchAnchorEl: e.currentTarget});
                                                    }}>
                                            <SearchIcon/>
                                        </IconButton>
                                        <Popper open={Boolean(searchAnchorEl)}
                                                anchorEl={searchAnchorEl}
                                                transition disablePortal>
                                            {({TransitionProps, placement}) => (
                                                <Grow
                                                    {...TransitionProps}
                                                    style={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                                                >
                                                    <Paper id="menu-list-grow">
                                                        <ClickAwayListener onClickAway={() => {
                                                            this.setState({searchAnchorEl: null});
                                                        }}>
                                                            <MenuList>
                                                                {this.searchMenu.map((item, index) =>
                                                                    <MenuItem
                                                                        key={item.value}
                                                                        selected={index === selectedSearch}
                                                                        onClick={() => {
                                                                            this.setState({
                                                                                searchAnchorEl: null,
                                                                                selectedSearch: index
                                                                            });
                                                                        }}>{item.label}</MenuItem>
                                                                )}
                                                            </MenuList>
                                                        </ClickAwayListener>
                                                    </Paper>
                                                </Grow>
                                            )}
                                        </Popper>
                                        <InputBase
                                            placeholder="Search…"
                                            classes={{
                                                root: classes.inputRoot,
                                                input: classes.inputInput,
                                            }}
                                            onKeyUp={e => {
                                                const search = e.target.value;
                                                if (this.searchHandler !== null) {
                                                    window.clearTimeout(this.searchHandler);
                                                }
                                                this.searchHandler = setTimeout((search) => {
                                                    this.props.onSearch(this.searchMenu[selectedSearch], search);
                                                }, 1000, search);

                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end"
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center"
                            }}>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    alignItems: "flex-start",
                                    alignSelf: "center",
                                    justifyContent: "flex-end"
                                }}>
                                    <div>
                                        <Button
                                            className={classes.button}
                                            aria-owns={productAnchorEl ? 'simple-menu' : undefined}
                                            aria-haspopup="true"
                                            variant="outlined"
                                            onClick={(event) => {
                                                this.setState({productAnchorEl: event.currentTarget});
                                            }}
                                        >
                                            {`Product: ${productMenu[productSelectedIndex].label}`}
                                        </Button>
                                        <Menu id="product-menu" anchorEl={productAnchorEl}
                                              open={Boolean(productAnchorEl)}
                                              onClose={() => {
                                                  this.setState({productAnchorEl: null});
                                              }}>
                                            {productMenu.map((option, index) => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                    selected={index === productSelectedIndex}
                                                    onClick={e => {
                                                        this.setState({
                                                            productSelectedIndex: index,
                                                            productAnchorEl: null
                                                        })
                                                    }}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </div>
                                    <div>
                                        <Button
                                            className={classes.button}
                                            aria-owns={branchAnchorEl ? 'simple-menu' : undefined}
                                            aria-haspopup="true"
                                            variant="outlined"
                                            onClick={(event) => {
                                                this.setState({branchAnchorEl: event.currentTarget});
                                            }}
                                        >
                                            {`Branch: ${branchMenu[branchSelectedIndex].label}`}
                                        </Button>
                                        <Menu id="branch-menu" anchorEl={branchAnchorEl}
                                              open={Boolean(branchAnchorEl)}
                                              onClose={() => {
                                                  this.setState({branchAnchorEl: null});
                                              }}>
                                            {branchMenu.map((option, index) => {
                                                return <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                    selected={index === branchSelectedIndex}
                                                    onClick={e => {
                                                        let productIndex = productSelectedIndex;
                                                        if (index !== 0) {
                                                            let searchProduct = 'null';
                                                            if (branchMenu[index].label.split(':')[0] === 'sdmain') {
                                                                searchProduct = 'brik';
                                                            } else if (branchMenu[index].label.split(':')[0] === 'spark') {
                                                                searchProduct = 'polaris';
                                                            }
                                                            productIndex = productMenu.findIndex(value => {
                                                                return value.label === searchProduct;
                                                            });
                                                        }

                                                        if (productIndex < 0 || productIndex >= productMenu.length) {
                                                            productIndex = productSelectedIndex;
                                                        }

                                                        this.setState({
                                                            productSelectedIndex: productIndex,
                                                            branchSelectedIndex: index,
                                                            branchAnchorEl: null
                                                        })
                                                    }}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            })}
                                        </Menu>
                                    </div>
                                    <div>
                                        <Button
                                            className={classes.button}
                                            aria-owns={versionAnchorEl ? 'simple-menu' : undefined}
                                            aria-haspopup="true"
                                            variant="outlined"
                                            onClick={(event) => {
                                                this.setState({versionAnchorEl: event.currentTarget});
                                            }}
                                        >
                                            {`Version: ${versionMenu[versionSelectedIndex].label}`}
                                        </Button>
                                        <Menu id="version-menu" anchorEl={versionAnchorEl}
                                              open={Boolean(versionAnchorEl)}
                                              onClose={() => {
                                                  this.setState({versionAnchorEl: null});
                                              }}>
                                            {versionMenu.map((option, index) => {
                                                return <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                    selected={index === versionSelectedIndex}
                                                    onClick={e => {
                                                        let productIndex = productSelectedIndex;
                                                        if (index !== 0) {
                                                            let searchProduct = 'null';
                                                            if (versionMenu[index].label.split(':')[0] === 'sdmain') {
                                                                searchProduct = 'brik';
                                                            } else if (versionMenu[index].label.split(':')[0] === 'spark') {
                                                                searchProduct = 'polaris';
                                                            }
                                                            productIndex = productMenu.findIndex(value => {
                                                                return value.label === searchProduct;
                                                            });
                                                        }

                                                        if (productIndex < 0 || productIndex >= productMenu.length) {
                                                            productIndex = productSelectedIndex;
                                                        }

                                                        let branchIndex = branchSelectedIndex;
                                                        if (index !== 0) {
                                                            let searchBranch = versionMenu[index].label.split(':').slice(0, 2).join(":");

                                                            branchIndex = branchMenu.findIndex(value => {
                                                                return value.label === searchBranch;
                                                            });
                                                        }

                                                        if (branchIndex < 0 || branchIndex >= branchMenu.length) {
                                                            branchIndex = branchSelectedIndex;
                                                        }

                                                        this.setState({
                                                            productSelectedIndex: productIndex,
                                                            branchSelectedIndex: branchIndex,
                                                            versionSelectedIndex: index,
                                                            versionAnchorEl: null
                                                        })
                                                    }}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            })}
                                        </Menu>
                                    </div>
                                    <div>
                                        <Button
                                            className={classes.button}
                                            aria-owns={statusAnchorEl ? 'simple-menu' : undefined}
                                            aria-haspopup="true"
                                            variant="outlined"
                                            onClick={(event) => {
                                                this.setState({statusAnchorEl: event.currentTarget});
                                            }}
                                        >
                                            {`Status: ${statusMenu[statusSelectedIndex].label}`}
                                        </Button>
                                        <Menu id="status-menu" anchorEl={statusAnchorEl}
                                              open={Boolean(statusAnchorEl)}
                                              onClose={() => {
                                                  this.setState({statusAnchorEl: null});
                                              }}>
                                            {statusMenu.map((option, index) => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                    selected={index === statusSelectedIndex}
                                                    onClick={e => {
                                                        this.setState({
                                                            statusSelectedIndex: index,
                                                            statusAnchorEl: null
                                                        });
                                                    }}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </div>
                                    <div>
                                        <Button
                                            className={classes.button}
                                            aria-owns={categoryAnchorEl ? 'simple-menu' : undefined}
                                            aria-haspopup="true"
                                            variant="outlined"
                                            onClick={(event) => {
                                                this.setState({categoryAnchorEl: event.currentTarget});
                                            }}
                                        >
                                            {`Category: ${this.state.categoryMenu[categorySelectedIndex].label}`}
                                        </Button>
                                        <Menu id="category-menu" anchorEl={categoryAnchorEl}
                                              open={Boolean(categoryAnchorEl)}
                                              onClose={() => {
                                                  this.setState({categoryAnchorEl: null});
                                              }}>
                                            {categoryMenu.map((option, index) => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                    selected={index === categorySelectedIndex}
                                                    onClick={e => {
                                                        this.setState({
                                                            categorySelectedIndex: index,
                                                            categoryAnchorEl: null
                                                        })
                                                    }}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </div>
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    alignSelf: "center",
                                }}>
                                    <div className={classes.actions}>
                                        <Tooltip title="Add Test Result">
                                            <IconButton aria-label="Add Test Result"
                                                        onClick={e => {
                                                            this.props.onClickAdd();
                                                        }}>
                                                <AddIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Toolbar>
            )
    }
}

EnhancedTableToolbar.defaultProps = {
    repositories: [],
    products: [],
    branches: [],
    versions: [],
    test_status: [],
    triage_status: [],
    test_category: [],
};

EnhancedTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onSearch: PropTypes.func.isRequired,
    onChangeFilters: PropTypes.func.isRequired,
    onClickAdd: PropTypes.func.isRequired,
    onClickDelete: PropTypes.func.isRequired
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
    root: {
        width: '100%',
        boxShadow: "0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12)"
    },
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    paddingCheckbox: {
        padding: "0 4px 0 4px"
    },
    bodyPaddingContent: {
        padding: "14px 16px 14px 16px"
    },
    dialogContent: {
        maxWidth: '800px',
    }
});

class TestResultTable extends React.Component {
    constructor(props) {
        super(props);

        this.offset = 15;

        this.state = {
            openDetailDialog: false,
            openDeleteDialog: false,
            triggerFormSave: false,
            selectedTestResult: null,
            order: props.order,
            orderBy: props.orderBy,
            selected: props.selected,
            data: this.getTableData(props.data),
            page: props.page,
            rowCount: props.rowCount,
            rowsPerPage: props.rowsPerPage,
            name: null,
            test_suite: null,
            data_field: null,
            product: null,
            branch: null,
            version: null,
            status: null,
            category: null
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.data, nextProps.data)) {
            this.setState({
                data: this.getTableData(nextProps.data)
            });
        }
        if (!_.isEqual(this.props.rowCount, nextProps.rowCount)) {
            this.setState({
                rowCount: nextProps.rowCount
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {name, product, branch, version, status, category, rowsPerPage} = this.state;

        if (!_.isEqual(prevState.name, name) ||
            !_.isEqual(prevState.product, product) ||
            !_.isEqual(prevState.branch, branch) ||
            !_.isEqual(prevState.version, version) ||
            !_.isEqual(prevState.status, status) ||
            !_.isEqual(prevState.category, category)) {
            this.props.handleFetchData(name, product, branch, version, status, category, 0, rowsPerPage + this.offset);
        }

        if (!_.isEqual(prevState.rowsPerPage, this.state.rowsPerPage)) {
            const {name, product, branch, status, category, page, rowCount, rowsPerPage} = this.state;

            const filteredData = this.getFilteredData();

            if (filteredData.length < rowCount &&
                filteredData.length < (page + 1) * rowsPerPage + this.offset) {
                this.props.handleFetchData(name, product, branch, version, status, category, filteredData.length, rowsPerPage + this.offset);
            }
        }


        if (!_.isEqual(prevState.page, this.state.page)) {
            const {name, product, branch, status, category, page, rowCount, rowsPerPage} = this.state;

            const filteredData = this.getFilteredData();

            if (filteredData.length < rowCount &&
                filteredData.length < (page + 1) * rowsPerPage + this.offset) {
                this.props.handleFetchData(name, product, branch, version, status, category, filteredData.length, rowsPerPage + this.offset);
            }
        }

        if (!_.isEqual(prevState.data, this.state.data)) {
            const nextSelected = this.state.selected.filter(id => _.some(this.getFilteredData(), {"id": id}));
            if (!_.isEqual(this.state.selected, nextSelected)) {
                this.setState({selected: nextSelected})
            }
        }
    }

    getTableData = (data) => {
        const tableData = [];
        data.forEach(item => {
            tableData.push(createTableData(item));
        });
        return tableData;
    };


    handleRequestSort = (event, property) => {
        if (!_.isEmpty(this.state.selected)) {
            this.setState({selected: []});
        }

        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    handleSelectAllClick = event => {
        if (event.target.checked) {
            const {order, orderBy, rowsPerPage, page} = this.state;
            const selectedRows = stableSort(this.getFilteredData(), getSorting(order, orderBy)).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(n => n.id);
            this.setState({selected: selectedRows});
            return;
        }
        this.setState({selected: []});
    };

    handleClick = (event, id) => {
        event.stopPropagation();
        const {selected} = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        this.setState({selected: newSelected});
    };

    handleChangePage = (event, page) => {
        this.setState({page: page, selected: []});
    };

    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value, selected: []});
    };

    handleChangeFilters = (product, branch, version, status, category) => {
        this.setState({
            product: product,
            branch: branch,
            version: version,
            status: status,
            category: category
        });
    };

    handleUpload = files => {
        const reader = new FileReader();

        Array.from(files).forEach(file => {
            reader.readAsText(file);
            reader.onload = () => {
                const data = reader.result;
                this.props.handleBulkImport(data);
            };
        });
    };

    handleSearch = (field, search) => {
        if (_.isNull(search) || _.isEmpty(search) || search.length === 0) {
            search = null;
        }

        switch (field.value) {
            case 'test_case':
                this.setState({
                    name: search,
                    test_suite: null,
                    data_field: null,
                });
                break;
            case 'test_suite':
                this.setState({
                    name: null,
                    test_suite: search,
                    data_field: null,
                });
                break;
            case 'data':
                this.setState({
                    name: null,
                    test_suite: null,
                    data_field: search,
                });
                break;
            default:
                this.setState({
                    name: null,
                    test_suite: null,
                    data_field: null,
                });
        }
    };

    handleClickAdd = () => {
        this.setState({
            openDetailDialog: true,
            selectedTestResult: null
        })
    };

    handleClickSave = (testResult) => {
        this.props.handleAddData(testResult);
        this.setState({
            openDetailDialog: false,
            selectedTestResult: null
        });
    };

    handleDialogClose = event => {
        this.setState({
            openDetailDialog: false,
            selectedTestResult: null
        })
    };

    getFilteredData = () => {
        const {data, name, product, branch, version, status, category, test_suite, data_field, orderBy, order} = this.state;

        const orderByField = testResult => {
            switch (orderBy) {
                case "id":
                    return testResult.id;
                case "test_case":
                    return testResult.test_case.name.split("::").splice(2).join('.').split(":")[0].toLowerCase();
                case "product":
                    return testResult.product.name;
                case "branch":
                    return testResult.branch.name;
                case "version":
                    return testResult.version.name;
                case "status":
                    return testResult.status;
                case "start_time":
                    return moment(testResult.start_time);
                case "end_time":
                    return moment(testResult.end_time);
                default:
                    return testResult.id;
            }
        };

        return _.orderBy(data.filter(testResult => {
            return ((name == null || testResult.test_case.name.toLowerCase().includes(name.toLowerCase())) &&
                (data_field == null || !isJSON(Object.assign(data_field)) || isSubset(JSON.parse(Object.assign(data_field)), testResult.data, true)) &&
                (product === null || testResult.product.id === product) &&
                (branch === null || testResult.branch.id === branch) &&
                (version === null || testResult.version.id === version) &&
                (status === null || testResult.status === status) &&
                (category === null || testResult.test_category === category));

        }), orderByField, order);
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    render() {
        const {classes, repositories, products, branches, versions, test_status, triage_status, test_category} = this.props;
        const {openDetailDialog, openDeleteDialog, selectedTestResult, data, order, orderBy, selected, rowsPerPage, rowCount, page} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

        const filteredData = this.getFilteredData();

        return (
            <div>
                <Paper className={classes.root}>
                    <EnhancedTableToolbar repositories={repositories}
                                          products={products}
                                          branches={branches}
                                          versions={versions}
                                          test_status={test_status}
                                          triage_status={triage_status}
                                          test_category={test_category}
                                          onSearch={this.handleSearch}
                                          onChangeFilters={this.handleChangeFilters}
                                          onClickAdd={this.handleClickAdd}
                                          onClickDelete={() => {
                                              this.setState({openDeleteDialog: true});
                                          }}
                                          numSelected={selected.length}/>
                    <div className={classes.tableWrapper}>
                        <Table className={classes.table} aria-labelledby="tableTitle">
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={this.handleSelectAllClick}
                                onRequestSort={this.handleRequestSort}
                                rowsPerPage={rowsPerPage}
                                rowsOnPage={Math.min(rowsPerPage, filteredData.length)}
                            />
                            <TableBody>
                                {stableSort(filteredData, getSorting(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(testResult => {
                                        const isSelected = this.isSelected(testResult.id);
                                        return (
                                            <TableRow
                                                hover
                                                onClick={event => this.handleClick(event, testResult.id)}
                                                role="checkbox"
                                                aria-checked={isSelected}
                                                tabIndex={-1}
                                                key={testResult.id}
                                                selected={isSelected}
                                            >
                                                <TableCell className={classes.paddingCheckbox}
                                                           padding="checkbox">
                                                    <Checkbox checked={isSelected}/>
                                                </TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center" component="th" scope="row">
                                                    <a href="#" onClick={e => {
                                                        e.stopPropagation();
                                                        this.setState({
                                                            selectedTestResult: testResult,
                                                            openDetailDialog: true
                                                        });
                                                    }}>{testResult.test_case.name.split("::").splice(2).join('.').split(":")[0]}</a>
                                                </TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{testResult.status}</TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{testResult.product.name}</TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{testResult.build_version}</TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{moment(testResult.start_time).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{moment(testResult.end_time).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow style={{height: 49 * emptyRows}}>
                                        <TableCell colSpan={6}/>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <TablePagination
                        rowsPerPageOptions={[5, 8, 15, 25, 50, 100]}
                        component="div"
                        count={rowCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                    <Dialog aria-labelledby="form-dialog-title"
                            open={openDetailDialog}
                            onClose={this.handleDialogClose}
                            maxWidth={'md'}>
                        <TestResultForm testResult={selectedTestResult}
                                        repositories={repositories}
                                        products={products}
                                        branches={branches}
                                        versions={versions}
                                        test_status={test_status}
                                        triage_status={triage_status}
                                        test_category={test_category}
                                        onClickCancel={this.handleDialogClose}
                                        onClickUpload={this.handleUpload}
                                        onClickSave={this.handleClickSave}/>
                    </Dialog>
                    <Dialog
                        open={openDeleteDialog}
                        onClose={() => {
                            this.setState({openDeleteDialog: false});
                        }}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Are you Sure?"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                This will delete the selected Test Results permanently.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                this.setState({openDeleteDialog: false});
                            }}
                                    color="primary">
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                const {selected} = this.state;
                                selected.forEach(id => {
                                    this.props.handleDeleteData(id);
                                });
                                this.setState({openDeleteDialog: false});
                            }}
                                    color="primary" autoFocus>
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </div>
        );
    }
}

TestResultTable.defaultProps = {
    order: 'desc',
    orderBy: 'id',
    selected: [],
    data: [],
    repositories: [],
    products: [],
    branches: [],
    versions: [],
    test_status: [],
    triage_status: [],
    test_category: [],
    page: 0,
    rowCount: 0,
    rowsPerPage: 8,
};

TestResultTable.propTypes = {
    classes: PropTypes.object.isRequired,
    handleFetchData: PropTypes.func.isRequired,
    handleAddData: PropTypes.func.isRequired,
    handleDeleteData: PropTypes.func.isRequired,
    handleBulkImport: PropTypes.func.isRequired,
};

export default withStyles(styles)(TestResultTable);