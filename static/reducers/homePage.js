import {
    GET_ITEMS
} from "../actions/types";


const initialState = {
    items: []
};

export default (state = initialState, action) => {
    let stateCopy = {...state};
    switch (action.type) {
        case(GET_ITEMS):
                stateCopy.items = {...stateCopy.items, ...action.payload};
                break;
        default:
            break;
    }
    return stateCopy;
}
