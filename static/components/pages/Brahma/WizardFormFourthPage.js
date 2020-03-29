import React, {Component} from "react";
import {connect} from "react-redux";
import ReactJson from 'react-json-view'
import {Formik} from "formik";
import TextField from "@material-ui/core/TextField";

class WizardFormFourthPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Generated Config</h4>

                <Formik
                    initialValues={{name: this.props.configName}}
                    onSubmit={() => {}}
                >
                    {({
                          values,
                          handleSubmit
                      }) => (
                        <div style={{marginBottom: '15px'}}>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    name="name"
                                    label="Config Name"
                                    value={values.name}
                                    onChange={(e) => {
                                        this.props.changeConfigName(e.target.value);
                                        values.name = e.target.value;
                                    }}
                                    margin="normal"
                                    variant="outlined"
                                    fullWidth
                                />
                            </form>
                        </div>
                    )}
                </Formik>

                <div>
                    <ReactJson
                        src={this.props.config}
                        theme="monokai"
                        displayDataTypes={false}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({});

export default connect(
    mapStateToProps,
    {}
)(WizardFormFourthPage);