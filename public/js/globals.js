let g = {
    formatter:new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 0,
        useGrouping: true
    }),
    predictedElements:[],
    focusedElement:-1,
    elementToFocus:'',
    elementToUnfocus:''

}

export default g