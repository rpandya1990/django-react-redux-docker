import React, {Component} from "react";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import {Formik} from "formik";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import * as Yup from "yup";
import withStyles from "@material-ui/core/styles/withStyles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";

class WizardFormFirstPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 5
        };

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleRowsPerPageChange = this.handleRowsPerPageChange.bind(this);

        this.initialFormValues = {
            hypervisor_manager: '',
            hypervisor: []
        };

        const {availableHypervisor} = this.props;

        availableHypervisor.forEach(hypervisor => {
            let obj = {
                selected: false,
                id: hypervisor.id,
                datastores: hypervisor.datastores.map(datastore => {
                    return {
                        selected: false,
                        id: datastore.id
                    }
                })
            };

            this.initialFormValues.hypervisor.push(obj);
        });

        this.validationSchema = Yup.object().shape({
            hypervisor_manager: Yup.string()
                .required('Required'),
            hypervisor: Yup.array()
                .of(
                    Yup.object().shape({
                        selected: Yup.boolean(),
                        id: Yup.number(),
                        datastores: Yup.array()
                            .of(
                                Yup.object().shape({
                                    selected: Yup.boolean(),
                                    id: Yup.number()
                                })
                            )
                    })
                )
        })
    }

    handleFormSubmit = (values, {setSubmitting, resetForm}) => {
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({modal: false});
        this.props.handleAddHypervisors(values);
    };

    handlePageChange(e, newVal) {
        this.setState({page: newVal})
    }

    handleRowsPerPageChange(e) {
        this.setState({rowsPerPage: e.target.value})
    }

    renderRevealPasswordField(classes, row) {
        return (
            <Tooltip title={`click to ${
                this.state[`view_password_${row.id}`] ?
                    'hide'
                    :
                    'reveal'
                } password`} placement="top" style={{padding: 0}}>

                <Button className={classes.button} onClick={() => this.setState({
                    [`view_password_${row.id}`]: !this.state[`view_password_${row.id}`]
                })} align="center">
                    {this.state[`view_password_${row.id}`] ?
                        <div> {row.password} </div>
                        :
                        <div> {new Array(row.password.length + 1).join("*")} </div>
                    }
                </Button>

            </Tooltip>
        )
    }

    renderHypervisorManagerInfo() {
        const {classes, hypervisor_manager} = this.props;

        const hypervisor_manager_fields = [
            ['Hostname', 'hostname'],
            ['Type', 'type'],
            ['Port', 'port'],
            ['Username', 'username']
        ];

        return (
            <div>
                <h4>Hypervisor Manager</h4>

                <Grid container alignItems={"flex-start"} spacing={1}>
                    <Paper className={classes.root}>
                        <Table className={classes.table}>

                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    {hypervisor_manager_fields.map(field => (
                                        <TableCell align="center" key={field[0]}>{field[0]}</TableCell>
                                    ))}
                                    <TableCell align="center">Password</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow key={hypervisor_manager.name}>
                                    <TableCell component="th" scope="row">
                                        {hypervisor_manager.name}
                                    </TableCell>
                                    {hypervisor_manager_fields.map(field => (
                                        <TableCell align="center"
                                                   key={field[0]}>{hypervisor_manager[field[1]]}</TableCell>
                                    ))}
                                    <TableCell
                                        align="center">{this.renderRevealPasswordField(classes, hypervisor_manager)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </div>
        )
    }

    renderHypervisorInfo() {
        const hypervisor_fields = [
            ['Type', 'type'],
            ['Additional Load', 'additional_load'],
            ['Concurrency', 'concurrency']
        ];

        const {classes, hypervisors} = this.props;
        const {page, rowsPerPage} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, hypervisors.length - page * rowsPerPage);

        return (
            <div>
                <h4>Hypervisors</h4>

                <Grid container alignItems={"flex-start"} spacing={1}>
                    <Paper className={classes.root}>
                        <Table className={classes.table}>

                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    {hypervisor_fields.map(field => (
                                        <TableCell align="center" key={field[0]}>{field[0]}</TableCell>
                                    ))}
                                    <TableCell align="center">Datastores</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {hypervisors
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(row => (
                                        <TableRow key={row.name}>
                                            <TableCell component="th" scope="row"> {row.name} </TableCell>

                                            {hypervisor_fields.map(field => (
                                                <TableCell align="center"
                                                           key={field[0]}>{row[field[1]].toString()}</TableCell>
                                            ))}

                                            <TableCell align="center">
                                                <Tooltip title="click to view datastores" placement="top"
                                                         style={{padding: 0}}>
                                                    <Button className={classes.button} onClick={() => this.setState({
                                                        [`datastore_details_${row.id}`]: true
                                                    })} align="center">
                                                        {row.datastores.length}
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>

                                            {this.renderDatastoreViewDialog(classes, row)}
                                        </TableRow>
                                    ))}


                                {emptyRows > 0 && page > 0 && (
                                    <TableRow style={{height: 53 * emptyRows}}>
                                        <TableCell colSpan={6}/>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={hypervisors.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            backIconButtonProps={{
                                'aria-label': 'Previous Page',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'Next Page',
                            }}
                            onChangePage={this.handlePageChange}
                            onChangeRowsPerPage={this.handleRowsPerPageChange}
                        />
                    </Paper>
                </Grid>
            </div>
        )
    }

    renderDatastoreViewDialog(classes, row) {
        return (
            <Dialog
                open={!!this.state[`datastore_details_${row.id}`]}
                onClose={() => this.setState({
                    [`datastore_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{margin: '0 5px'}}>
                    <DialogTitle> Datastores </DialogTitle>

                    <Paper className={classes.root} style={{marginBottom: '10px'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Type</TableCell>
                                    <TableCell align="center">Additional Load</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {row.datastores.map((datastore, index) => (
                                    <TableRow key={row.name + index}>
                                        <TableCell component="th" scope="row">{datastore.name}</TableCell>
                                        <TableCell align="center">{datastore.type}</TableCell>
                                        <TableCell align="center">{datastore.additional_load.toString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`datastore_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderInfo() {
        return (
            <div style={{padding: '20px 5px'}}>
                {this.renderHypervisorManagerInfo()}
                {this.renderHypervisorInfo()}

                <Button variant="contained" onClick={() => this.props.resetPage()}
                        style={{backgroundColor: '#e10050', color: 'white'}}>
                    Reset
                </Button>
            </div>
        )
    }

    renderHypervisorAndDatastoreFields(
        {
            values,
            handleChange,
        }) {

        const hypervisor_manager_id = values.hypervisor_manager;
        const {classes, availableHypervisor} = this.props;

        return (
            <Grid container alignItems="flex-start" spacing={2}>
                {availableHypervisor.map((hypervisor, index) => {
                    if (hypervisor.hypervisor_manager !== hypervisor_manager_id)
                        return null;

                    return (
                        <Grid item xs={12} key={hypervisor.id}>

                            <ExpansionPanel>
                                <ExpansionPanelSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography className={classes.heading}>
                                        {hypervisor.name}
                                    </Typography>
                                </ExpansionPanelSummary>

                                <ExpansionPanelDetails style={{borderTop: '2px solid lightgray'}}>
                                    <Grid container alignItems="flex-start">

                                        <Grid item xs={12}>Hypervisor:</Grid>

                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name={`hypervisor[${index}].selected`}
                                                        checked={values.hypervisor[index].selected}
                                                        onChange={handleChange}
                                                        value="additional_load"
                                                        color="primary"
                                                        inputProps={{
                                                            'aria-label': 'secondary checkbox',
                                                        }}
                                                    />
                                                }
                                                label={hypervisor.name}
                                                labelPlacement="end"
                                                className={classes.checkbox}
                                                style={{marginLeft: '4px'}}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>Datastores:</Grid>

                                        {hypervisor.datastores.map((datastore, index_2) => (
                                            <Grid item xs={12} key={datastore.id}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            name={`hypervisor[${index}].datastores[${index_2}].selected`}
                                                            checked={values.hypervisor[index].datastores[index_2].selected}
                                                            onChange={handleChange}
                                                            value="additional_load"
                                                            color="primary"
                                                            inputProps={{
                                                                'aria-label': 'secondary checkbox',
                                                            }}
                                                        />
                                                    }
                                                    label={datastore.name}
                                                    labelPlacement="end"
                                                    className={classes.checkbox}
                                                    style={{marginLeft: '6px'}}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        </Grid>
                    )
                })}
            </Grid>
        )
    }

    renderAddDialog() {
        const {availableHypervisorManager} = this.props;

        return (
            <Formik
                initialValues={this.initialFormValues}
                onSubmit={this.handleFormSubmit}
                validationSchema={this.validationSchema}
            >
                {({
                      values,
                      touched,
                      errors,
                      isSubmitting,
                      handleChange,
                      handleBlur,
                      handleSubmit
                  }) => (
                    <Grid container justify="center" alignItems="center">
                        <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}
                              spacing={2} item xs={8}>

                            <Grid item xs={12}>
                                <TextField
                                    select
                                    name="hypervisor_manager"
                                    label="Choose Hypervisor Manager"
                                    value={values.hypervisor_manager}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    helperText={(errors.hypervisor_manager && touched.hypervisor_manager)
                                    && errors.hypervisor_manager}
                                    error={errors.hypervisor_manager && touched.hypervisor_manager}
                                    margin="normal"
                                    variant="outlined"
                                    fullWidth
                                    required
                                >
                                    {availableHypervisorManager.map(item => (
                                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                    ))}

                                </TextField>
                            </Grid>

                            {values.hypervisor_manager !== '' &&
                            <Grid item xs={12} style={{marginBottom: '10px'}}>
                                <InputLabel htmlFor="ds_form" style={{marginTop: '10px'}}> Hypervisors </InputLabel>

                                {this.renderHypervisorAndDatastoreFields({values, handleChange})}
                            </Grid>}

                            <Grid item xs={12}>
                                <Button color="primary" variant="contained"
                                        type="submit" disabled={isSubmitting} onClick={handleSubmit}>
                                    Add
                                </Button>
                            </Grid>

                        </Grid>
                    </Grid>
                )}
            </Formik>
        )
    }

    render() {
        return (
            <div>
                <div style={{minHeight: '200px', margin: '20px 5px'}}>
                    {this.props.hypervisor_manager !== '' ?
                        <div>{this.renderInfo()}</div>
                        :
                        <div>{this.renderAddDialog()}</div>
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({});

const style = theme => ({
    paper: {
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
    checkbox: {
        position: 'relative',
        left: '-15px',
        top: '5px'
    },
    table: {
        minWidth: 650,
    },
    button: {
        textTransform: 'none'
    },
    deleteIcon: {
        color: '#e10050'
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {}
)(WizardFormFirstPage));