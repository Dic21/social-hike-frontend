import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    list: [],
    details: null,
    visibles: 2,
    eventList: [],
    cmList: [],
    modalDisplay: false,
    comment: "",
    picFile: []
};

export const placeSlice = createSlice({
    name: "place",
    initialState: { ...initialState },
    reducers: {
        showList: function (state, action) {
            state.list = action.payload;
        },
        showDetails: function(state,action){
            state.details = action.payload;
        },
        showEvents: function(state, action){
            state.eventList = action.payload;
        },
        setVisibles:function(state, action){
            state.visibles = action.payload;
        },
        showComments: function(state,action){
            state.cmList = action.payload;
        },
        showModal: function(state,action){
            state.modalDisplay = action.payload;
        },
        updateText: function(state,action){
            state.comment = action.payload;
        },
        updatePicFile: function(state, action){
            state.picFile = action.payload;
        }
    }
});

export const {
    showList,
    showDetails,
    showEvents,
    setVisibles,
    showComments,
    showModal,
    updateText,
    updatePicFile
} = placeSlice.actions;
  
export default placeSlice.reducer;
  