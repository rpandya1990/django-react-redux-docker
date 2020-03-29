import React from "react";
import ReactDOM from "react-dom";


const modalRoot = document.getElementById("modal");

class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.ele = document.createElement("div");
        this.ele.className = "modal-container";

    }

    componentDidMount() {
        modalRoot.appendChild(this.ele);
    }

    componentWillUnmount() {
        modalRoot.removeChild(this.ele);
    }

    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.ele,
        );
    }
}

export default Modal;
