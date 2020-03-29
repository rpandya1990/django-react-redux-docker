import React from "react";
import {Link} from "react-router-dom";

const NavItem = (props) => {
    return (
        props.category === "react" ?
        <Link to={props.link} style={{textDecoration: "none"}} className="nav-item" onClick={props.handleClick} onMouseLeave={props.handleMouseLeave} onMouseEnter={(e) => props.handleMouseEnter(e, props.name)}>
            <i className="material-icons">{props.icon_name}</i>
            <span className="nav-item-label">{props.name}</span>
        </Link> :
            <a href={props.link} style={{textDecoration: "none"}} className="nav-item" onClick={props.handleClick} onMouseLeave={props.handleMouseLeave} onMouseEnter={(e) => props.handleMouseEnter(e, props.name)}>
                <i className="material-icons">{props.icon_name}</i>
                <span className="nav-item-label">{props.name}</span>
            </a>
    );
};


export default NavItem;
