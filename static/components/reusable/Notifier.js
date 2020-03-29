import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withSnackbar} from 'notistack';
import * as PropTypes from "prop-types";
import {removeSnackbar} from "../../actions/generalData";

class Notifier extends Component {
    displayed = [];

    storeDisplayed = (id) => {
        this.displayed = [...this.displayed, id];
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const {notifications: newSnacks = []} = nextProps;
        if (!newSnacks.length) {
            this.displayed = [];
            return false;
        }

        const {notifications: currentSnacks} = this.props;
        let notExists = false;
        for (let i = 0; i < newSnacks.length; i += 1) {
            const newSnack = newSnacks[i];
            if (newSnack.dismissed) {
                this.props.closeSnackbar(newSnack.key);
                this.props.removeSnackbar(newSnack.key);
            }

            if (notExists) continue;
            notExists = notExists || !currentSnacks.filter(({key}) => newSnack.key === key).length;
        }
        return notExists;

    }

    componentDidUpdate() {
        const {notifications = []} = this.props;

        notifications.forEach(({key, message, options = {}}) => {
            // Do nothing if snackbar is already displayed
            if (this.displayed.includes(key)) return;
            // Display snackbar using notistack
            this.props.enqueueSnackbar(message, {
                ...options,
                onClose: (event, reason, key) => {
                    if (options.onClose) {
                        options.onClose(event, reason, key);
                    }
                    // Dispatch action to remove snackbar from redux store
                    this.props.removeSnackbar(key);
                }
            });
            // Keep track of snackbars that we've displayed
            this.storeDisplayed(key);
        });
    }

    render() {
        return null;
    }
}

Notifier.propTypes = {
    enqueueSnackbar: PropTypes.func.isRequired,
    closeSnackbar: PropTypes.func.isRequired,
    removeSnackbar: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    notifications: state.generalData.notifications,
});

export default withSnackbar(connect(mapStateToProps, {
        removeSnackbar
    }
)(Notifier));