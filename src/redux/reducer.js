const initialState = {
  locations: [],
  polygons: [],
  filters: {
    status: 'All',
  }
}

// Use the initialState as a default value
export default function appReducer(state = initialState, action) {
  // The reducer normally looks at the action type field to decide what happens
  switch (action.type) {
    // Do something here based on the different types of actions
    case "ADD_LOCATION":
        return { ...state, locations: [...state.locations, action.payload]}
    case "ADD_POLYGON":
        return { ...state, polygons: [...state.locations, action.payload]}
    default:
      // If this reducer doesn't recognize the action type, or doesn't
      // care about this specific action, return the existing state unchanged
      return state
  }
}