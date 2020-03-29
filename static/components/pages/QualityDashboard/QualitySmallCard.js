import React from "react";


export default (props) => {
    let categoryObj = props.data;
    let health = categoryObj["health"];
    let backgroundColor = "rgba(22,185,50, .72)";
    if (health < 60 || health === "fail") {
        backgroundColor = "rgba(237, 91, 74, .77)";
    } else if (health < 90) {
        backgroundColor = "rgba(255, 153, 20, .78)";
    }
    let healthIcon = health + "%";
    if (props.title === "Performance" || props.title === "System") {
        healthIcon = (
            <div style={{display: "flex", alignItems: "center"}}>
                <span>{categoryObj["failure_count"]}</span>
                <i className="material-icons error-icon">error_outline</i>
            </div>
        )
    }
    let date = <span/>;
    if (categoryObj["period"]) {
        date = <span>{categoryObj["period"]}</span>;
    }
    return (
        <div className="small-card" style={{backgroundColor}}>
            <div className="small-card-title">{props.title}</div>
            <div className="small-card-health">{healthIcon}</div>
            <div className="small-card-date">{date}</div>
        </div>
    )
}
