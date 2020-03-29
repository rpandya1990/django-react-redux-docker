import React, {Component} from "react";
import {connect} from "react-redux";
import {
    add_exception_to_fileset,
    add_excludes_to_fileset,
    add_fileset,
    add_path_to_fileset,
    delete_fileset,
    remove_exception_from_fileset,
    remove_excludes_from_fileset,
    remove_path_from_fileset,
    toggle_fileset_status
} from '../../../actions/brahma';
import {Formik} from 'formik';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import withStyles from "@material-ui/core/styles/withStyles";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import * as Yup from "yup";
import List from "@material-ui/core/List";
import {Divider} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TablePagination from "@material-ui/core/TablePagination";

class FilesetCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form_modal: false,
            page: 0,
            rowsPerPage: 5
        };

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleRowsPerPageChange = this.handleRowsPerPageChange.bind(this);

        this.initialFormValues = {
            name: '', template_name: '',
            snappable: '', fileset_paths: '',
            exceptions: '', excludes: ''
        };

        this.form = [
            {heading: 'Name', name: 'name', type: 'text'},
            {heading: 'Template', name: 'template_name', type: 'text'},
            {heading: 'Snappable', name: 'snappable', type: 'text'},
            {heading: 'Fileset Paths (space separated)', name: 'fileset_paths', type: 'text'},
            {heading: 'Exceptions (space separated)', name: 'exceptions', type: 'text'},
            {heading: 'Exclusions (space separated)', name: 'excludes', type: 'text'}
        ];

        this.validationSchema = Yup.object().shape({
            name: Yup.string()
                .required('Required'),
            template_name: Yup.string()
                .required('Required'),
            snappable: Yup.string()
                .required('Required'),
            fileset_paths: Yup.string(),
            exceptions: Yup.string(),
            excludes: Yup.string()
        });
    }

    handlePageChange(e, newVal) {
        this.setState({page: newVal})
    }

    handleRowsPerPageChange(e) {
        this.setState({rowsPerPage: e.target.value})
    }

    renderAddedFilesets(classes, fileset) {
        const fileset_fields = [
            ['Name', 'name'],
            ['Snappable', 'snappable']
        ];

        const {page, rowsPerPage} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, fileset.length - page * rowsPerPage);

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Filesets</h4>

                <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight: '200px'}}>
                    <Paper className={classes.root}>
                        <Table className={classes.table}>

                            <TableHead>
                                <TableRow>
                                    <TableCell>Template Name</TableCell>
                                    {fileset_fields.map(field => (
                                        <TableCell align="center" key={field[0]}>{field[0]}</TableCell>
                                    ))}
                                    <TableCell align="center">Fileset Paths</TableCell>
                                    <TableCell align="center">Exceptions</TableCell>
                                    <TableCell align="center">Excludes</TableCell>
                                    <TableCell align="center">Global status</TableCell>

                                    <TableCell align="center" padding={"checkbox"}>
                                        <Tooltip title="Add Fileset" placement="top">
                                            <IconButton aria-label="Add"
                                                        onClick={() => this.setState({form_modal: true})}>
                                                <AddCircleIcon className={classes.addIcon}/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {fileset
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(row => (
                                        <TableRow key={row.id}>
                                            <TableCell component="th" scope="row"> {row.template_name} </TableCell>

                                            {fileset_fields.map(field => (
                                                <TableCell align="center" key={field[0]}>{row[field[1]]}</TableCell>
                                            ))}

                                            <TableCell align="center">
                                                <Tooltip title="click to view fileset paths" placement="top"
                                                         style={{padding: 0}}>
                                                    <Button className={classes.button} onClick={() => this.setState({
                                                        [`fileset_details_${row.id}`]: true
                                                    })} align="center">
                                                        {row.fileset_paths.length}
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Tooltip title="click to view exceptions" placement="top"
                                                         style={{padding: 0}}>
                                                    <Button className={classes.button} onClick={() => this.setState({
                                                        [`exception_details_${row.id}`]: true
                                                    })} align="center">
                                                        {row.exceptions.length}
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Tooltip title="click to view exclusions" placement="top"
                                                         style={{padding: 0}}>
                                                    <Button className={classes.button} onClick={() => this.setState({
                                                        [`exclude_details_${row.id}`]: true
                                                    })} align="center">
                                                        {row.excludes.length}
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell align="center">
                                                {row.is_global ?
                                                    <Tooltip title="click to make private" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_fileset_status(row.id)}
                                                                align="center">
                                                            Public
                                                        </Button>
                                                    </Tooltip>
                                                    :
                                                    <Tooltip title="click to make public" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_fileset_status(row.id)}
                                                                align="center">
                                                            Private
                                                        </Button>
                                                    </Tooltip>
                                                }
                                            </TableCell>

                                            <TableCell align="center" padding="checkbox">
                                                <Tooltip title="remove this fileset" placement="top">
                                                    <IconButton aria-label="Delete" onClick={() => this.setState({
                                                        [`delete_fileset_modal_${row.id}`]: true
                                                    })}>
                                                        <RemoveCircleIcon className={classes.deleteIcon}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            {this.renderFilesetViewDialog(classes, row)}
                                            {this.renderExceptionViewDialog(classes, row)}
                                            {this.renderExcludesViewDialog(classes, row)}
                                            {this.renderDeleteFilesetDialog(classes, row)}
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
                            count={fileset.length}
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

                {this.renderAddFilesetDialog(classes)}
            </div>
        )
    }

    renderExceptionViewDialog(classes, row) {
        return (
            <Dialog
                open={!!this.state[`exception_details_${row.id}`]}
                onClose={() => this.setState({
                    [`exception_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper}>
                    <DialogTitle> Exceptions </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {row.exceptions.map((exception, index) => (
                            <div key={index}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={11}>
                                            <ListItemText primary={exception}/>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Tooltip title="remove this exception" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => this.setState({
                                                    [`delete_exception_modal_${index}`]: true
                                                })}>
                                                    <CancelIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                            {this.renderDeleteExceptionDialog(classes, exception, index, row.id)}
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <Formik
                        initialValues={{exception: ''}}
                        validationSchema={Yup.object().shape({
                            exception: Yup.string()
                                .required('Required')
                        })}
                        onSubmit={({exception}, {setSubmitting, resetForm}) => {
                            this.props.add_exception_to_fileset(exception, row.id);
                            setSubmitting(false);
                            resetForm({exception: ''});
                        }}
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
                            <form onSubmit={handleSubmit} className={classes.pathForm}>
                                <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                    <Grid item xs={12}>
                                        <TextField
                                            name="exception"
                                            label="Exception"
                                            value={values.exception}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            helperText={(errors.exception && touched.exception) && errors.exception}
                                            error={errors.exception && touched.exception}
                                            margin="normal"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>

                                <Button color="primary" variant="contained"
                                        type="submit" disabled={isSubmitting}>
                                    Add exception
                                </Button>
                            </form>
                        )}
                    </Formik>


                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`exception_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderFilesetViewDialog(classes, row) {
        return (
            <Dialog
                open={!!this.state[`fileset_details_${row.id}`]}
                onClose={() => this.setState({
                    [`fileset_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper}>
                    <DialogTitle> Fileset Paths </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {row.fileset_paths.map((path, index) => (
                            <div key={index}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={11}>
                                            <ListItemText primary={path}/>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Tooltip title="remove this fileset path" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => this.setState({
                                                    [`delete_fileset_path_modal_${index}`]: true
                                                })}>
                                                    <CancelIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                            {this.renderDeleteFilesetPathDialog(classes, path, index, row.id)}
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <Formik
                        initialValues={{path: ''}}
                        validationSchema={Yup.object().shape({
                            path: Yup.string()
                                .required('Required')
                        })}
                        onSubmit={({path}, {setSubmitting, resetForm}) => {
                            this.props.add_path_to_fileset(path, row.id);
                            setSubmitting(false);
                            resetForm({path: ''});
                        }}
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
                            <form onSubmit={handleSubmit} className={classes.pathForm}>
                                <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                    <Grid item xs={12}>
                                        <TextField
                                            name="path"
                                            label="Fileset Path"
                                            value={values.path}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            helperText={(errors.path && touched.path) && errors.path}
                                            error={errors.path && touched.path}
                                            margin="normal"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>

                                <Button color="primary" variant="contained"
                                        type="submit" disabled={isSubmitting}>
                                    Add path
                                </Button>
                            </form>
                        )}
                    </Formik>


                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`fileset_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderExcludesViewDialog(classes, row) {
        return (
            <Dialog
                open={!!this.state[`exclude_details_${row.id}`]}
                onClose={() => this.setState({
                    [`exclude_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper}>
                    <DialogTitle> Exclusions </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {row.excludes.map((exclude, index) => (
                            <div key={index}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={11}>
                                            <ListItemText primary={exclude}/>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Tooltip title="remove this exclusion" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => this.setState({
                                                    [`delete_exclude_modal_${index}`]: true
                                                })}>
                                                    <CancelIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                            {this.renderDeleteExcludesDialog(classes, exclude, index, row.id)}
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <Formik
                        initialValues={{exclude: ''}}
                        validationSchema={Yup.object().shape({
                            exclude: Yup.string()
                                .required('Required')
                        })}
                        onSubmit={({exclude}, {setSubmitting, resetForm}) => {
                            this.props.add_excludes_to_fileset(exclude, row.id);
                            setSubmitting(false);
                            resetForm({exclude: ''});
                        }}
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
                            <form onSubmit={handleSubmit} className={classes.pathForm}>
                                <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                    <Grid item xs={12}>
                                        <TextField
                                            name="exclude"
                                            label="Exclude"
                                            value={values.exclude}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            helperText={(errors.exclude && touched.exclude) && errors.exclude}
                                            error={errors.exclude && touched.exclude}
                                            margin="normal"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>

                                <Button color="primary" variant="contained"
                                        type="submit" disabled={isSubmitting}>
                                    Add exclusion
                                </Button>
                            </form>
                        )}
                    </Formik>


                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`exclude_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderAddFilesetDialog(classes) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.form_modal}
                onClose={() => this.setState({form_modal: false})}
            >
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
                        <div className={classes.paper}>
                            <DialogTitle> Add Fileset </DialogTitle>

                            <form onSubmit={handleSubmit}>
                                <DialogContent>
                                    <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                        {this.form.map(field => (
                                            <Grid item xs={12} key={field.name}>
                                                <TextField
                                                    type={field.type}
                                                    name={field.name}
                                                    label={field.heading}
                                                    value={values[field.name]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors[field.name] && touched[field.name]) && errors[field.name]}
                                                    error={errors[field.name] && touched[field.name]}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => this.setState({form_modal: false})}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" variant="contained"
                                            type="submit" disabled={isSubmitting}>
                                        Add Fileset
                                    </Button>
                                </DialogActions>
                            </form>
                        </div>
                    )}
                </Formik>
            </Dialog>
        )
    }

    renderDeleteFilesetDialog(classes, fileset) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_fileset_modal_${fileset.id}`]}
                onClose={() => this.setState({[`delete_fileset_modal_${fileset.id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Fileset named '{fileset.name}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_fileset_modal_${fileset.id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteFileset(fileset.id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeleteFilesetPathDialog(classes, path, index, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_fileset_path_modal_${index}`]}
                onClose={() => this.setState({[`delete_fileset_path_modal_${index}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Fileset path named '{path}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_fileset_path_modal_${index}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteFilesetPath(index, id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeleteExceptionDialog(classes, exception, index, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_exception_modal_${index}`]}
                onClose={() => this.setState({[`delete_exception_modal_${index}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Exclusion named '{exception}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_exception_modal_${index}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteException(index, id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeleteExcludesDialog(classes, exclude, index, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_exclude_modal_${index}`]}
                onClose={() => this.setState({[`delete_exclude_modal_${index}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Exclusion named '{exclude}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_exclude_modal_${index}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteExcludes(index, id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    handleFormSubmit(values, {setSubmitting, resetForm}) {
        if (values['fileset_paths'] === '')
            values['fileset_paths'] = [];
        else
            values['fileset_paths'] = values['fileset_paths'].split(" ");

        if (values['exceptions'] === '')
            values['exceptions'] = [];
        else
            values['exceptions'] = values['exceptions'].split(" ");

        if (values['excludes'] === '')
            values['excludes'] = [];
        else
            values['excludes'] = values['excludes'].split(" ");

        this.props.add_fileset(values);
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({form_modal: false})
    }

    deleteFileset(id) {
        this.props.delete_fileset(id);
        this.setState({
            [`delete_fileset_modal_${id}`]: false
        })
    }

    deleteFilesetPath(index, id) {
        this.props.remove_path_from_fileset(index, id);
        this.setState({
            [`delete_fileset_path_modal_${index}`]: false
        })
    }

    deleteException(index, id) {
        this.props.remove_exception_from_fileset(index, id);
        this.setState({
            [`delete_exception_modal_${index}`]: false
        })
    }

    deleteExcludes(index, id) {
        this.props.remove_excludes_from_fileset(index, id);
        this.setState({
            [`delete_exclude_modal_${index}`]: false
        })
    }

    render() {
        const {classes, fileset} = this.props;

        return (
            <div>
                {this.renderAddedFilesets(classes, fileset)}
            </div>
        )
    }
}

const mapStateToProps = state => ({});

const style = theme => ({
    paper: {
        minWidth: 500,
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
    deleteButton: {
        backgroundColor: '#e10050',
        color: '#FFF'
    },
    addIcon: {
        color: '#009688'
    },
    pathForm: {
        padding: '2px 10px'
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {
        add_fileset,
        add_path_to_fileset,
        add_exception_to_fileset,
        add_excludes_to_fileset,
        remove_path_from_fileset,
        remove_exception_from_fileset,
        remove_excludes_from_fileset,
        delete_fileset,
        toggle_fileset_status
    }
)(FilesetCard));