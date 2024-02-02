const initialState = {
  locations: [],
  polygons: [],
  filters: {
    status: 'All',
  }
}

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case "ADD_LOCATION":
        return { ...state, locations: [...state.locations, action.payload]}
    case "ADD_POLYGON":
        return { ...state, polygons: [...state.locations, action.payload]}
    default:
      return state
  }
}