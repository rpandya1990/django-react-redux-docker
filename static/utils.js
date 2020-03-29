import * as _ from "lodash";
import {CHANGE_TR_TRIAGE_STATUS_ENDPOINT} from "./api/endpoints";
import {CHANGE_TR_TRIAGE_STATUS_SUCCESS} from "./actions/types";

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


export const BrikVersion = (version_str) => {
    const RE_VERSION = /([\d\.]+(-p(\d+))?)(~(([a-zA-Z]+)(\d+)?))?(-([a-zA-Z.]+))?-(\w+)/g;

    const ReleaseType = (type) => {
        switch (type) {
            case 'private':
                return 0;
            case 'dev':
                return 1;
            case 'EA':
                return 2;
            case 'DA':
                return 3;
            case 'GA':
                return 4;
        }
    };

    const get_release_type = (release, name) => {
        if (name) {
            return ReleaseType('private');
        } else if (!release) {
            return ReleaseType('GA');
        }
        return ReleaseType(release);
    };

    const match = RE_VERSION.exec(version_str);

    const release_type = get_release_type(match[6], match[9]);
    const version = match[1];
    const release_number = match[7] ? parseInt(match[7]) : 0;
    const build_id = match[10] ? parseInt(match[10]) : match[10];

    return [version, release_type, release_number, build_id];
};

export const PolarisVersion = (version_str) => {
    const RE_VERSION_1 = /(v)([1-3][0-9]{3})(0[0-9]|1[012])(0[1-9]|[12][0-9]|3[01])(-)?(beta)?(-?)(\d*)/g;
    const RE_VERSION_2 = /(master)(-?)(\d*)/g;

    const match_1 = RE_VERSION_1.exec(version_str);
    if (match_1) {
        const build_id = match_1[8] ? parseInt(match_1[8]) : match_1[8];
        return [build_id]
    }

    const match_2 = RE_VERSION_2.exec(version_str);
    if (!match_2) {
        return [1]
    }
    const build_id = match_2[3] ? parseInt(match_2[3]) : match_2[3];
    return [build_id]
};

export const validIssue = (version_str) => {
    const RE_VALID_VERSION = /\w+-\d+/g;
    const match_1 = RE_VALID_VERSION.exec(version_str);
    return match_1
};

export const focusStatusMap = (focuses) => {
    let statusMap = {
        "Success": ["success"],
        "Skip": ["skip"],
        "Fail": ["xfail", "error", "fail", "uxpass"],
        "Not Run": ["notrun"]
    };
    let filters = [];
    for (const focus of focuses) {
        filters.push(...statusMap[focus])
    }
    return filters;
};


export const getTestCaseData = (testCase) => {
    return {
        id: _.isNull(testCase) || _.isNull(testCase.id) ? null : testCase.id,
        name: _.isNull(testCase) || _.isNull(testCase.name) ? '' : testCase.name,
        repo: _.isNull(testCase) || _.isNull(testCase.repo) ? '' : testCase.repo.id,
        product: _.isNull(testCase) || _.isNull(testCase.product) ? '' : testCase.product.id,
        branch: _.isNull(testCase) || _.isNull(testCase.branch) ? '' : testCase.branch.id,
        version: _.isNull(testCase) || _.isNull(testCase.version) ? '' : testCase.version.id,
        owner: _.isNull(testCase) || _.isNull(testCase.owner) ? '' : testCase.owner.id,
        description: _.isNull(testCase) || _.isNull(testCase.description) ? '' : testCase.description,
        steps: _.isNull(testCase) || _.isNull(testCase.steps) ? '' : testCase.steps,
        test_category: _.isNull(testCase) || _.isNull(testCase.test_category) ? '' : testCase.test_category,
        test_module: _.isNull(testCase) || _.isNull(testCase.test_module) ? '' : testCase.test_module,
        test_class: _.isNull(testCase) || _.isNull(testCase.test_class) ? '' : testCase.test_class,
        test_method: _.isNull(testCase) || _.isNull(testCase.test_method) ? '' : testCase.test_method,
        test_spec: _.isNull(testCase) || _.isNull(testCase.test_spec) ? {} : testCase.test_spec,
        data: _.isNull(testCase) || _.isNull(testCase.data) ? {} : testCase.data,
        effective_status: _.isNull(testCase) || _.isNull(testCase.effective_status) ? '' : testCase.effective_status,
        flakiness_percentage: _.isNull(testCase) || _.isNull(testCase.flakiness_percentage) ? '' : testCase.flakiness_percentage,
        last_five_fail_percentage: _.isNull(testCase) || _.isNull(testCase.last_five_fail_percentage) ? '' : testCase.last_five_fail_percentage,
        test_type: _.isNull(testCase) || _.isNull(testCase.test_type) ? '' : testCase.test_type,
        test_tags: _.isNull(testCase) || _.isNull(testCase.test_tags) ? [] : testCase.test_tags.map(tag => tag.id),
    }
};


export const getTestResultData = (testResult) => {
    return {
        id: _.isNull(testResult) || _.isNull(testResult.id) ? null : testResult.id,
        test_case: _.isNull(testResult) || _.isNull(testResult.test_case) ? '' : testResult.test_case.name.split("::").splice(2).join('.'),
        repo: _.isNull(testResult) || _.isNull(testResult.repo) ? '' : testResult.repo.id,
        product: _.isNull(testResult) || _.isNull(testResult.product) ? '' : testResult.product.id,
        branch: _.isNull(testResult) || _.isNull(testResult.branch) ? '' : testResult.branch.id,
        version: _.isNull(testResult) || _.isNull(testResult.version) ? '' : testResult.version.id,
        build_version: _.isNull(testResult) || _.isNull(testResult.build_version) ? '' : testResult.build_version,
        start_time: _.isNull(testResult) || _.isNull(testResult.start_time) ? null : testResult.start_time,
        end_time: _.isNull(testResult) || _.isNull(testResult.end_time) ? null : testResult.end_time,
        status: _.isNull(testResult) || _.isNull(testResult.status) ? '' : testResult.status,
        status_message: _.isNull(testResult) || _.isNull(testResult.status_message) ? '' : testResult.status_message,
        stack_trace: _.isNull(testResult) || _.isNull(testResult.stack_trace) ? '' : testResult.stack_trace,
        triage_status: _.isNull(testResult) || _.isNull(testResult.triage_status) ? '' : testResult.triage_status,
        triage_resolution: _.isNull(testResult) || _.isNull(testResult.triage_resolution) ? '' : testResult.triage_resolution,
        triage_comment: _.isNull(testResult) || _.isNull(testResult.triage_comment) ? '' : testResult.triage_comment,
        issue_tracker_url: _.isNull(testResult) || _.isNull(testResult.issue_tracker_url) ? [] : testResult.issue_tracker_url,
        data: _.isNull(testResult) || _.isNull(testResult.data) ? {} : testResult.data,
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