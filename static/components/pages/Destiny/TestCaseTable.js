import React, {Component} from 'react';
import classNames from 'classnames';
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
import ForwardIcon from '@material-ui/icons/Forward';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import AddIcon from '@material-ui/icons/Add';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Button from "@material-ui/core/Button";
import TestCaseForm from "./TestCaseForm";
import Dialog from "@material-ui/core/Dialog";
import red from '@material-ui/core/colors/red';
import TestCaseCopyForm from "./TestCaseCopyForm";
import TestCaseMoveForm from "./TestCaseMoveForm";
import TestCaseDeleteForm from "./TestCaseDeleteForm";
import _ from "lodash";
import {getTestCaseData, isJSON, isSubset} from "../../../utils";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import * as PropTypes from "prop-types";


function createTableData(testCase) {
    return {
        'id': testCase['id'],
        'url': testCase['url'],
        'label': testCase['label'],
        'name': testCase['name'],
        'repo': {
            'id': testCase['repo']['id'],
            'url': testCase['repo']['url'],
            'name': testCase['repo']['label'],
        },
        'product': {
            'id': testCase['product']['id'],
            'url': testCase['product']['url'],
            'name': testCase['product']['label']
        },
        'branch': {
            'id': testCase['branch']['id'],
            'url': testCase['branch']['url'],
            'name': testCase['branch']['label'],
        },
        'version': {
            'id': testCase['version']['id'],
            'url': testCase['version']['url'],
            'name': testCase['version']['label'],
        },
        'owner': {
            'id': testCase['owner']['id'],
            'url': testCase['owner']['url'],
            'name': testCase['owner']['label'],
        },
        'test_suites': testCase['test_suites'],
        'description': testCase['description'],
        'steps': testCase['steps'],
        'test_category': testCase['test_category'],
        'test_module': testCase['test_module'],
        'test_class': testCase['test_class'],
        'test_method': testCase['test_method'],
        'test_spec': testCase['test_spec'],
        'data': testCase['data'],
        'effective_status': testCase['effective_status'],
        'flakiness_percentage': testCase['flakiness_percentage'],
        'last_five_fail_percentage': testCase['last_five_fail_percentage'],
        'test_type': testCase['test_type'],
        'test_tags': testCase['test_tags']
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
    {id: 'name', numeric: true, disablePadding: false, label: 'Name'},
    {id: 'product', numeric: true, disablePadding: false, label: 'Product'},
    {id: 'version', numeric: true, disablePadding: false, label: 'Version'},
    {id: 'effective_status', numeric: true, disablePadding: false, label: 'Status'},
    {id: 'owner', numeric: true, disablePadding: false, label: 'Owner'},
];

const tableHeadStyles = theme => ({
    paddingCheckbox: {
        padding: "0px 4px 0px 4px",
    },
    headPaddingTitle: {
        padding: "14px 16px 14px 36px"
    },
});

class EnhancedTableHead extends Component {
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
    rowsOnPage: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
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
    icon: {
        margin: theme.spacing(2),
    },
    iconHover: {
        margin: theme.spacing(2),
        '&:hover': {
            color: red[800],
        },
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
            statusAnchorEl: null,
            categoryAnchorEl: null,
            productSelectedIndex: 0,
            branchSelectedIndex: 0,
            statusSelectedIndex: 0,
            categorySelectedIndex: 0,
            repoMenu: this.getMenuData(props.repositories),
            productMenu: this.getMenuData(props.products),
            branchMenu: this.getMenuData(props.branches),
            versionMenu: this.getMenuData(props.versions),
            statusMenu: this.getMenuData(props.test_status),
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
        if (!_.isEqual(this.props.test_category, nextProps.test_category)) {
            this.setState({categoryMenu: this.getMenuData(nextProps.test_category)})
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevState.productSelectedIndex, this.state.productSelectedIndex) ||
            !_.isEqual(prevState.branchSelectedIndex, this.state.branchSelectedIndex) ||
            !_.isEqual(prevState.statusSelectedIndex, this.state.statusSelectedIndex) ||
            !_.isEqual(prevState.categorySelectedIndex, this.state.categorySelectedIndex)) {
            const selectedProduct = this.state.productSelectedIndex === 0 ? null : this.state.productMenu[this.state.productSelectedIndex].value;
            const selectedBranch = this.state.branchSelectedIndex === 0 ? null : this.state.branchMenu[this.state.branchSelectedIndex].value;
            const selectedStatus = this.state.statusSelectedIndex === 0 ? null : this.state.statusMenu[this.state.statusSelectedIndex].value;
            const selectedCategory = this.state.categorySelectedIndex === 0 ? null : this.state.categoryMenu[this.state.categorySelectedIndex].value;
            this.props.onChangeFilters(selectedProduct, selectedBranch, selectedStatus, selectedCategory);
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
            searchAnchorEl, productAnchorEl, branchAnchorEl, statusAnchorEl, categoryAnchorEl,
            productSelectedIndex, branchSelectedIndex, statusSelectedIndex, categorySelectedIndex,
            productMenu, branchMenu, statusMenu, categoryMenu, selectedSearch
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
                            <Tooltip title="Copy">
                                <IconButton aria-label="Copy"
                                            onClick={e => {
                                                this.props.onClickCopy();
                                            }}>
                                    <FileCopyIcon/>
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className={classes.actions}>
                            <Tooltip title="Move">
                                <IconButton aria-label="Move"
                                            onClick={e => {
                                                this.props.onClickMove();
                                            }}>
                                    <ForwardIcon/>
                                </IconButton>
                            </Tooltip>
                        </div>
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
                                            Test Cases
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
                                        <Tooltip title="Add Test Case">
                                            <IconButton aria-label="Add Test Case"
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
    test_category: [],
};

EnhancedTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onSearch: PropTypes.func.isRequired,
    onChangeFilters: PropTypes.func.isRequired,
    onClickAdd: PropTypes.func.isRequired,
    onClickCopy: PropTypes.func.isRequired,
    onClickMove: PropTypes.func.isRequired,
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
});


class TestCaseTable extends Component {
    constructor(props) {
        super(props);

        this.offset = 15;

        this.state = {
            openDetailDialog: false,
            openCopyDialog: false,
            openMoveDialog: false,
            openDeleteDialog: false,
            triggerFormSave: false,
            selectedTestCase: null,
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
        const {name, product, branch, status, category, test_suite, rowsPerPage} = this.state;

        if (!_.isEqual(prevState.name, name) ||
            !_.isEqual(prevState.product, product) ||
            !_.isEqual(prevState.branch, branch) ||
            !_.isEqual(prevState.status, status) ||
            !_.isEqual(prevState.category, category) ||
            !_.isEqual(prevState.test_suite, test_suite)) {
            this.props.handleFetchData(name, product, branch, status, category, test_suite, 0, rowsPerPage + this.offset);
        }

        if (!_.isEqual(prevState.rowsPerPage, this.state.rowsPerPage)) {
            const {name, product, branch, status, category, test_suite, page, rowCount, rowsPerPage} = this.state;

            const filteredData = this.getFilteredData();

            if (filteredData.length < rowCount &&
                filteredData.length < (page + 1) * rowsPerPage + this.offset) {
                this.props.handleFetchData(name, product, branch, status, category, test_suite, filteredData.length, rowsPerPage + this.offset);
            }
        }

        if (!_.isEqual(prevState.page, this.state.page)) {
            const {name, product, branch, status, category, test_suite, page, rowCount, rowsPerPage} = this.state;

            const filteredData = this.getFilteredData();

            if (filteredData.length < rowCount &&
                filteredData.length < (page + 1) * rowsPerPage + this.offset) {
                this.props.handleFetchData(name, product, branch, status, category, test_suite, filteredData.length, rowsPerPage + this.offset);
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
            const selectedRows = stableSort(this.getFilteredData(), getSorting(order, orderBy)).slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(testCase => testCase.id);
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

    handleChangeFilters = (product, branch, status, category) => {
        this.setState({
            product: product,
            branch: branch,
            status: status,
            category: category
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
            selectedTestCase: null
        })
    };

    handleClickSave = (testCase) => {
        this.props.handleAddData(testCase);
        this.setState({
            openDetailDialog: false,
            selectedTestCase: null
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

    handleDialogClose = event => {
        this.setState({
            openDetailDialog: false,
            selectedTestCase: null
        })
    };

    getFilteredData = () => {
        const {data, name, product, branch, status, category, test_suite, data_field, orderBy, order} = this.state;

        const orderByField = testCase => {
            switch (orderBy) {
                case "id":
                    return testCase.id;
                case "name":
                    return testCase.name.split('.').splice(-2).join('.').toLowerCase();
                case "product":
                    return testCase.product.name;
                case "version":
                    return testCase.version.name;
                case "status":
                    return testCase.effective_status;
                case "owner":
                    return testCase.owner.name;
                default:
                    return testCase.id;
            }
        };

        return _.orderBy(data.filter(testCase => {
            return ((name == null || testCase.name.toLowerCase().includes(name.toLowerCase())) &&
                (test_suite == null || (!_.isEmpty(testCase.test_suites) &&
                    _.some(testCase.test_suites, testSuite => {
                        return testSuite.label.toLowerCase().includes(test_suite.toLowerCase())
                    }))) &&
                (data_field == null || !isJSON(Object.assign(data_field)) || isSubset(JSON.parse(Object.assign(data_field)), testCase.data, true)) &&
                (product === null || testCase.product.id === product) &&
                (branch === null || testCase.branch.id === branch) &&
                (status === null || testCase.effective_status === status) &&
                (category === null || testCase.test_category === category));

        }), orderByField, order);
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    render() {
        const {classes, users, repositories, products, branches, versions, test_status, test_framworks, test_category} = this.props;
        const {openDetailDialog, openCopyDialog, openMoveDialog, openDeleteDialog, selectedTestCase, data, order, orderBy, selected, rowsPerPage, rowCount, page} = this.state;
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
                                          test_category={test_category}
                                          onSearch={this.handleSearch}
                                          onChangeFilters={this.handleChangeFilters}
                                          onClickAdd={this.handleClickAdd}
                                          onClickCopy={() => {
                                              this.setState({openCopyDialog: true});
                                          }}
                                          onClickMove={() => {
                                              this.setState({openMoveDialog: true});
                                          }}
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
                                    .map(testCase => {
                                        const isSelected = this.isSelected(testCase.id);
                                        return (
                                            <TableRow
                                                hover
                                                onClick={event => this.handleClick(event, testCase.id)}
                                                role="checkbox"
                                                aria-checked={isSelected}
                                                tabIndex={-1}
                                                key={testCase.id}
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
                                                            selectedTestCase: testCase,
                                                            openDetailDialog: true
                                                        });
                                                    }}>{testCase.name.split('.').splice(-2).join('.')}</a>
                                                </TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{testCase.product.name}</TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{testCase.version.name}</TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{testCase.effective_status}</TableCell>
                                                <TableCell className={classes.bodyPaddingContent}
                                                           align="center">{testCase.owner.name}</TableCell>
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
                </Paper>
                <Dialog aria-labelledby="form-dialog-title"
                        open={openDetailDialog}
                        onClose={this.handleDialogClose}
                        fullWidth={true}
                        maxWidth={'md'}>
                    <TestCaseForm testCase={selectedTestCase}
                                  users={users}
                                  repositories={repositories}
                                  products={products}
                                  branches={branches}
                                  versions={versions}
                                  test_status={test_status}
                                  test_framworks={test_framworks}
                                  test_category={test_category}
                                  onClickCancel={this.handleDialogClose}
                                  onClickUpload={this.handleUpload}
                                  onClickSave={this.handleClickSave}/>
                </Dialog>
                <Dialog
                    open={openCopyDialog}
                    onClose={() => {
                        this.setState({openCopyDialog: false});
                    }}
                    fullWidth={true}
                    maxWidth={'md'}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <TestCaseCopyForm
                        branches={branches}
                        versions={versions}
                        onClickCopy={(branch, version) => {
                            const {selected} = this.state;
                            selected.forEach(id => {
                                const testCases = data.filter(testCase => {
                                    return testCase.id === id
                                });
                                if (_.isEmpty(testCases)) {
                                    return;
                                }

                                const testCase = getTestCaseData(testCases[0]);
                                this.props.handleCopyData(testCase, branch, version);
                            });
                            this.setState({openCopyDialog: false});
                        }}
                        onClickCancel={() => {
                            this.setState({openCopyDialog: false});
                        }}/>
                </Dialog>
                <Dialog
                    open={openMoveDialog}
                    onClose={() => {
                        this.setState({openMoveDialog: false});
                    }}
                    fullWidth={true}
                    maxWidth={'md'}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <TestCaseMoveForm
                        branches={branches}
                        versions={versions}
                        onClickMove={(branch, version) => {
                            const {selected} = this.state;
                            selected.forEach(id => {
                                const testCases = data.filter(testCase => {
                                    return testCase.id === id
                                });
                                if (_.isEmpty(testCases)) {
                                    return;
                                }

                                const testCase = getTestCaseData(testCases[0]);
                                this.props.handleMoveData(testCase, branch, version);
                            });
                            this.setState({openMoveDialog: false});
                        }}
                        onClickCancel={() => {
                            this.setState({openMoveDialog: false});
                        }}/>
                </Dialog>
                <Dialog
                    open={openDeleteDialog}
                    onClose={() => {
                        this.setState({openDeleteDialog: false});
                    }}
                    maxWidth={'md'}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <TestCaseDeleteForm
                        onClickDelete={() => {
                            const {selected} = this.state;
                            selected.forEach(id => {
                                this.props.handleDeleteData(id);
                            });
                            this.setState({openDeleteDialog: false});
                        }}
                        onClickCancel={() => {
                            this.setState({openDeleteDialog: false});
                        }}/>
                </Dialog>
            </div>
        );
    }
}

TestCaseTable.defaultProps = {
    order: 'desc',
    orderBy: 'id',
    selected: [],
    data: [],
    users: [],
    repositories: [],
    products: [],
    branches: [],
    versions: [],
    test_status: [],
    test_category: [],
    page: 0,
    rowCount: 0,
    rowsPerPage: 8,
};

TestCaseTable.propTypes = {
    classes: PropTypes.object.isRequired,
    handleFetchData: PropTypes.func.isRequired,
    handleAddData: PropTypes.func.isRequired,
    handleCopyData: PropTypes.func.isRequired,
    handleMoveData: PropTypes.func.isRequired,
    handleDeleteData: PropTypes.func.isRequired,
    handleBulkImport: PropTypes.func.isRequired,
};

export default withStyles(styles)(TestCaseTable);