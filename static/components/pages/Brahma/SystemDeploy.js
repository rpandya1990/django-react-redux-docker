import React, {Component} from "react";
import {connect} from "react-redux";
import ReactJson from 'react-json-view'
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CloseIcon from '@material-ui/icons/Close';
import ArchiveIcon from '@material-ui/icons/Archive';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import moment from 'moment';
import {
    check_depoyed_system_status,
    delete_config, delete_deployment,
    deploy_system, fetch_logs
} from "../../../actions/brahma";
import TablePagination from "@material-ui/core/TablePagination";
import Fab from '@material-ui/core/Fab';

class SystemDeploy extends Component {
    constructor(props) {
        super(props);

        this.state = {
            config_rowsPerPage: 5,
            config_page: 0,
            deployed_rowsPerPage: 5,
            deployed_page: 0
        };

        this.config_id_to_name_mapping = {};

        this.props.config.forEach(({id, name}) => {
            this.config_id_to_name_mapping[id] = name;
        });

        this.deployConfig = this.deployConfig.bind(this);

        this.handleConfigPageChange = this.handleConfigPageChange.bind(this);
        this.handleConfigRowsPerPageChange = this.handleConfigRowsPerPageChange.bind(this);

        this.handleDeployedSysPageChange = this.handleDeployedSysPageChange.bind(this);
        this.handleDeployedSysRowsPerPageChange = this.handleDeployedSysRowsPerPageChange.bind(this);
    }

    componentDidMount() {
        this.dataPolling = setInterval(
            () => {
                this.props.check_depoyed_system_status(
                    this.props.deployed_system
                );
            },
            5000);
    }

    componentWillUnmount() {
        clearInterval(this.dataPolling);
    }

    renderDownloadButton(classes, data, id, name) {
        const json = JSON.stringify(data, null, '\t');
        const file = "text/json;charset=utf-8," + encodeURIComponent(json);

        return (
            <Button href={`data:'${file}`}
                    download={`${name}.json`}
                    color="inherit"
                    className={classes.button}
                    style={{textDecoration: 'none', color: '#fff'}}>
                Download &nbsp; <ArchiveIcon/>
            </Button>
        )
    }

    deleteConfig(id) {
        this.props.delete_config(id);

        this.setState({
            [`delete_config_modal_${id}`]: false
        });
    }

    deleteDeployment(id) {
        this.props.delete_deployment(id);

        this.setState({
            [`delete_deployment_modal_${id}`]: false
        });
    }

    handleConfigPageChange(e, newVal) {
        this.setState({config_page: newVal})
    }

    handleConfigRowsPerPageChange(e) {
        this.setState({config_rowsPerPage: e.target.value})
    }

    handleDeployedSysPageChange(e, newVal) {
        this.setState({deployed_page: newVal})
    }

    handleDeployedSysRowsPerPageChange(e) {
        this.setState({deployed_rowsPerPage: e.target.value})
    }

    renderConfigTable(classes, config) {
        const {config_page, config_rowsPerPage} = this.state;
        const emptyRows = config_rowsPerPage - Math.min(config_rowsPerPage, config.length - config_page * config_rowsPerPage);

        return (
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="center">Date created</TableCell>
                            <TableCell align="center">Config</TableCell>
                            <TableCell align="center">Deploy</TableCell>
                            <TableCell align="center" padding="checkbox"></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {config
                            .slice(config_page * config_rowsPerPage, config_page * config_rowsPerPage + config_rowsPerPage)
                            .map(row => (
                                <TableRow key={row.id}>
                                    <TableCell component="th" scope="row"> {row.name} </TableCell>
                                    <TableCell
                                        align="center"> {moment(row.record_create_time).format('llll')} </TableCell>

                                    <TableCell align="center">
                                        <Button color="primary" className={classes.button}
                                                onClick={() => this.setState({
                                                    [`config_details_${row.id}`]: true
                                                })} align="center"> view </Button>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Tooltip title="deploy this config" placement="top">
                                            <Button className={classes.button}
                                                    style={{
                                                        textDecoration: 'none',
                                                        color: '#2196f3',
                                                        marginRight: '5px'
                                                    }}
                                                    onClick={() => this.deployConfig(row.id)}>
                                                <CloudUploadIcon/>
                                            </Button>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell align="center" padding="checkbox">
                                        <Tooltip title="remove this config" placement="top">
                                            <IconButton aria-label="Delete"
                                                        onClick={() => this.setState({
                                                            [`delete_config_modal_${row.id}`]: true
                                                        })}>
                                                <RemoveCircleIcon className={classes.deleteIcon}/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>

                                    {this.renderDeleteConfigDialog(classes, row.id)}
                                    {this.renderViewConfig(classes, row)}
                                </TableRow>
                            ))}

                        {emptyRows > 0 && config_page > 0 && (
                            <TableRow style={{height: 65 * emptyRows}}>
                                <TableCell colSpan={6}/>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={config.length}
                    rowsPerPage={config_rowsPerPage}
                    page={config_page}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={this.handleConfigPageChange}
                    onChangeRowsPerPage={this.handleConfigRowsPerPageChange}
                />
            </Paper>
        )
    }

    deployConfig(id) {
        this.props.deploy_system(id);
    }

    renderViewConfig(classes, {config, id}) {
        return (
            <Dialog
                open={!!this.state[`config_details_${id}`]}
                onClose={() => this.setState({
                    [`config_details_${id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => this.setState({
                            [`config_details_${id}`]: false
                        })} aria-label="Close">
                            <CloseIcon/>
                        </IconButton>

                        <Typography variant="h6" className={classes.title}>
                            Config
                        </Typography>

                        {this.renderDownloadButton(classes, JSON.parse(config), id, `config_${this.config_id_to_name_mapping[id]}`)}
                    </Toolbar>
                </AppBar>

                <ReactJson
                    src={JSON.parse(config)}
                    theme="monokai"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    style={{
                        height: '100%',
                        maxHeight: '100%',
                        overflow: 'auto',
                        padding: '30px'
                    }}
                />
            </Dialog>
        )
    }

    renderDeleteConfigDialog(classes, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_config_modal_${id}`]}
                onClose={() => this.setState({[`delete_config_modal_${id}`]: false})}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Config?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_config_modal_${id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteConfig(id)} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderStatus(classes, row) {
        let output;

        if (row.status === 'SUCCESS')
            output = <div style={{color: '#009688'}}> SUCCESS </div>;

        else if (row.status === 'PENDING')
            output = <div style={{color: '#afb42b'}}> PENDING </div>;

        else
            output =
                <Tooltip title="view error traceback" placement="top">
                    <Button className={classes.button}
                            onClick={() => this.setState({
                                [`deployed_failure_details_${row.id}`]: true
                            })} align="center"
                            style={{color: '#e10050'}}>
                        FAILED
                    </Button>
                </Tooltip>;

        return output;
    }

    renderDeploymentTable(classes, deployed_systems) {
        const {deployed_page, deployed_rowsPerPage} = this.state;
        const emptyRows = deployed_rowsPerPage - Math.min(deployed_rowsPerPage, deployed_systems.length - deployed_page * deployed_rowsPerPage);

        return (
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell align="center">Date created</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Deployment of config</TableCell>
                            <TableCell align="center">System Spec</TableCell>
                            <TableCell align="center">Deployed Spec</TableCell>
                            <TableCell align="center">Logs</TableCell>
                            <TableCell align="center" padding="checkbox"></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {deployed_systems
                            .slice(deployed_page * deployed_rowsPerPage, deployed_page * deployed_rowsPerPage + deployed_rowsPerPage)
                            .map(row => (
                                <TableRow key={row.id}>
                                    <TableCell component="th" scope="row"> {row.id} </TableCell>
                                    <TableCell
                                        align="center"> {moment(row.record_create_time).format('llll')} </TableCell>

                                    <TableCell align="center"> {this.renderStatus(classes, row)} </TableCell>

                                    <TableCell
                                        align="center"> {this.config_id_to_name_mapping[row.for_config]} </TableCell>

                                    {row.status === 'SUCCESS'
                                        ?
                                        <TableCell align="center">
                                            <Button color="primary" className={classes.button}
                                                    onClick={() => this.setState({
                                                        [`system_spec_details_${row.id}`]: true
                                                    })} align="center"> view </Button>
                                        </TableCell>
                                        :
                                        <TableCell align="center"></TableCell>
                                    }

                                    {row.status === 'SUCCESS'
                                        ?
                                        <TableCell align="center">
                                            <Button color="primary" className={classes.button}
                                                    onClick={() => this.setState({
                                                        [`deployed_spec_details_${row.id}`]: true
                                                    })} align="center"> view </Button>
                                        </TableCell>
                                        :
                                        <TableCell align="center"></TableCell>
                                    }

                                    <TableCell align="center">
                                        <Button color="primary" className={classes.button}
                                                onClick={() => {
                                                    this.setState({
                                                        [`deployed_logs_details_${row.id}`]: true
                                                    })
                                                }} align="center"> view </Button>
                                    </TableCell>

                                    <TableCell align="center" padding="checkbox">
                                        <Tooltip title="remove this record" placement="top">
                                            <IconButton aria-label="Delete"
                                                        onClick={() => this.setState({
                                                            [`delete_deployment_modal_${row.id}`]: true
                                                        })}>
                                                <RemoveCircleIcon className={classes.deleteIcon}/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>

                                    {this.renderDeleteDeploymentDialog(classes, row.id)}
                                    {this.renderViewLogs(classes, row)}

                                    {row.status === 'SUCCESS' && this.renderViewSystemSpec(classes, row)}
                                    {row.status === 'SUCCESS' && this.renderViewDeployedSpec(classes, row)}
                                    {row.status === 'FAILED' && this.renderTraceback(classes, row)}

                                </TableRow>
                            ))}

                        {emptyRows > 0 && deployed_page > 0 && (
                            <TableRow style={{height: 65 * emptyRows}}>
                                <TableCell colSpan={6}/>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={deployed_systems.length}
                    rowsPerPage={deployed_rowsPerPage}
                    page={deployed_page}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={this.handleDeployedSysPageChange}
                    onChangeRowsPerPage={this.handleDeployedSysRowsPerPageChange}
                />
            </Paper>
        );
    }

    renderDeleteDeploymentDialog(classes, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_deployment_modal_${id}`]}
                onClose={() => this.setState({[`delete_deployment_modal_${id}`]: false})}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Deployment Record ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_deployment_modal_${id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteDeployment(id)} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderViewSystemSpec(classes, {output, id, for_config}) {
        let spec = output
            .replace(/'/g, "\"")
            .replace(/False/g, "false")
            .replace(/True/g, "true");

        try {
            spec = JSON.parse(spec)['system']['system_spec'];
        } catch (e) {
            spec = {
                message: 'error in parsing json',
                error: e.message,
                output: output
            }
        }

        return (
            <Dialog
                open={!!this.state[`system_spec_details_${id}`]}
                onClose={() => this.setState({
                    [`system_spec_details_${id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => this.setState({
                            [`system_spec_details_${id}`]: false
                        })} aria-label="Close">
                            <CloseIcon/>
                        </IconButton>

                        <Typography variant="h6" className={classes.title}>
                            System Spec
                        </Typography>

                        {this.renderDownloadButton(classes, spec,
                            id, `system_spec (config = ${this.config_id_to_name_mapping[for_config]}, deployment = ${id})`)}
                    </Toolbar>
                </AppBar>

                <ReactJson
                    src={spec}
                    theme="monokai"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    style={{
                        height: '100%',
                        maxHeight: '100%',
                        overflow: 'auto',
                        padding: '30px'
                    }}
                />
            </Dialog>
        )
    }

    renderViewDeployedSpec(classes, {output, id, for_config}) {
        let spec = output
            .replace(/'/g, "\"")
            .replace(/False/g, "false")
            .replace(/True/g, "true");

        try {
            spec = JSON.parse(spec)['system']['system_deployed'];
        } catch (e) {
            spec = {
                message: 'error in parsing json',
                error: e.message,
                output: output
            }
        }

        return (
            <Dialog
                open={!!this.state[`deployed_spec_details_${id}`]}
                onClose={() => this.setState({
                    [`deployed_spec_details_${id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => this.setState({
                            [`deployed_spec_details_${id}`]: false
                        })} aria-label="Close">
                            <CloseIcon/>
                        </IconButton>

                        <Typography variant="h6" className={classes.title}>
                            Deployed Spec
                        </Typography>

                        {this.renderDownloadButton(classes, spec,
                            id, `deployed_spec (config = ${this.config_id_to_name_mapping[for_config]}, deployment = ${id})`)}
                    </Toolbar>
                </AppBar>

                <ReactJson
                    src={spec}
                    theme="monokai"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    style={{
                        height: '100%',
                        maxHeight: '100%',
                        overflow: 'auto',
                        padding: '30px'
                    }}
                />
            </Dialog>
        )
    }

    scrollToBottom(id) {
        let el = document.querySelector(`.logs_${id}`);
        el.scroll({
            top: Number.MAX_SAFE_INTEGER,
            behavior: 'smooth'
        })
    }

    scrollToTop(id) {
        let el = document.querySelector(`.logs_${id}`);
        el.scroll({
            top: 0,
            behavior: 'smooth'
        })
    }

    renderViewLogs(classes, {logs, id, for_config}) {
        const file = "data:text/plain;charset=UTF-8," + encodeURIComponent(logs);

        return (
            <Dialog
                open={!!this.state[`deployed_logs_details_${id}`]}
                onClose={() => this.setState({
                    [`deployed_logs_details_${id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => this.setState({
                            [`deployed_logs_details_${id}`]: false
                        })} aria-label="Close">
                            <CloseIcon/>
                        </IconButton>

                        <Typography variant="h6" className={classes.title}>
                            Output Log
                        </Typography>

                        <Button href={`${file}`}
                                download={`output_logs (config = ${this.config_id_to_name_mapping[for_config]}, deployment = ${id}).txt`}
                                className={classes.button}
                                style={{textDecoration: 'none', color: '#fff', backgroundColor: '#009688'}}>
                            Download &nbsp; <ArchiveIcon/>
                        </Button>
                    </Toolbar>
                </AppBar>

                <div style={{
                    whiteSpace: 'pre',
                    background: 'rgb(39, 40, 34)',
                    color: 'white',
                    padding: '20px',
                    height: '100%',
                    maxHeight: '100%',
                    overflow: 'auto',
                    lineHeight: '0.9'
                }} className={`logs_${id}`}>
                    {logs}

                    <Fab color="primary" aria-label="Add" style={{position: 'fixed', right: '30px', bottom: '95px'}}
                         onClick={() => this.scrollToTop(id)}>
                        <ArrowDropUpIcon/>
                    </Fab>

                    <Fab color="primary" aria-label="Add" style={{position: 'fixed', right: '30px', bottom: '30px'}}
                         onClick={() => this.scrollToBottom(id)}>
                        <ArrowDropDownIcon/>
                    </Fab>
                </div>

            </Dialog>
        );
    }

    renderTraceback(classes, {output, id, for_config}) {
        // remove unicode string part and fix newline
        output = output.replace(/u\\/g, "").replace(/\\'/g, "'").replace(/\\n/g, '\u000A');

        const file = "data:text/plain;charset=UTF-8," + encodeURIComponent(output);

        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`deployed_failure_details_${id}`]}
                maxWidth="md"
                onClose={() => this.setState({[`deployed_failure_details_${id}`]: false})}
            >
                <div className={classes.paper}>
                    <DialogTitle> Error Traceback </DialogTitle>

                    <DialogContent style={{whiteSpace: 'pre', lineHeight: '1.7'}}>
                        {output}
                    </DialogContent>

                    <DialogActions>
                        <Button href={`${file}`}
                                download={`error_log (config = ${for_config}, deployment = ${id}).txt`}
                                className={classes.button}
                                style={{textDecoration: 'none', color: '#fff', backgroundColor: '#009688'}}>
                            Download &nbsp; <ArchiveIcon/>
                        </Button>

                        <Button onClick={() => this.setState({[`deployed_failure_details_${id}`]: false})}>
                            Close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    render() {
        const {classes, config, deployed_system} = this.props;

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Saved Configs</h4>
                {this.renderConfigTable(classes, config)}

                <br/>
                <h4>Deployments</h4>
                {this.renderDeploymentTable(classes, deployed_system)}
            </div>
        )
    }
}

const mapStateToProps = state => ({});

const style = theme => ({
    paper: {
        minWidth: 600,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    root: {
        width: '100%',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
        overflowX: 'auto',
    },
    table: {
        minWidth: 650,
    },
    button: {
        textTransform: 'none'
    },
    deleteIcon: {
        color: '#e10050'
    },
    appBar: {
        position: 'relative',
        backgroundColor: '#009688'
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
        color: '#FFFFFF'
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {
        delete_config,
        delete_deployment,
        deploy_system,
        check_depoyed_system_status,
        fetch_logs
    }
)(SystemDeploy));