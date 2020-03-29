import React from "react";
import "../../css/Dashboard.css";


export const Arrow = (props) => {
    if (props.defaultState === "up") {
        let transform = props.flip ? "rotate(90deg)" : "rotate(-90deg)";
        return <i className="material-icons climb arrow" style={{transform, ...props.style}}>chevron_right</i>;
    }
    let transform = props.flip ? "rotate(-90deg)" : "rotate(90deg)";
    return <i className="material-icons drop arrow" style={{transform, ...props.style}}>chevron_right</i>;
};
