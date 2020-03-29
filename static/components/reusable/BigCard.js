import React from "react";
import "../../css/Dashboard.css";


export default (props) => {
    return (
        <div className="big-card">
            <div style={{display: "flex", justifyContent: "center"}}>{props.title}</div>
            {props.children}
        </div>
    )
}
