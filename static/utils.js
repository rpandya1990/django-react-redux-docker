import * as _ from "lodash";

export const extractGetParams = (props) => {
    const params = new URLSearchParams(props.location.search);
    let propParams = {};
    for (const param of new Set(params.keys())) {
        propParams[param] = params.getAll(param);
    }
    return propParams;
};


export const getSearchParams = (props, keys = Object.keys(props)) => {
    const params = new URLSearchParams();
    for (const key of keys) {
        if (props.hasOwnProperty(key)) {
            if (props[key] === undefined) {
                continue;
            }
            if (props[key] instanceof Array) {
                props[key].forEach(value => {
                    params.append(key, value);
                });
            } else if (props[key] instanceof String || typeof (props[key]) === "string") {
                params.set(key, props[key]);
            } else if (props[key] instanceof Number || typeof (props[key]) === "number") {
                params.set(key, props[key]);
            } else if ((props[key] instanceof Boolean || typeof (props[key]) === "boolean") && props[key] === true) {
                params.set(key, "");
            }
        }
    }
    return params;
};


export const uniqueArrayEquals = (arr1, arr2) => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    for (const ele1 of set1) {
        if (!set2.has(ele1)) {
            return false;
        }
    }
    for (const ele2 of set2) {
        if (!set1.has(ele2)) {
            return false;
        }
    }
    return true;
};


export const isSubset = (a, b, merge = false) => {
    const assign = merge ? _.merge : _.assign;
    const c = assign(_.cloneDeep(b), a);
    return _.isEqual(b, c);
};


export const isJSON = (str) => {
    return !_.isError(_.attempt(JSON.parse, str));
};


export const clearChildren = (node) => {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
};


export const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};


export const preventInputCursorChange = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
    }
};

export const isURL = (str) => {
  let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
};

export const getCall = () => {
    // refactor saga boiler plate in here
};