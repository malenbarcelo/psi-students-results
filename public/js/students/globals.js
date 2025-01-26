let g = {
    popups:[espp],
    tableIcons: [
        {
            icon:esppIcon,
            right:'7.5%'
        }
    ],
    elementsToPredict:[
        {
            input: company,
            list: companyUl,
            apiUrl: 'apis/predict/students/companies/',
            name: 'company',
            elementName: 'company'
        }
    ],
    elementsToOrder:[company_ASC, company_DESC, last_name_ASC, last_name_DESC, first_name_ASC, first_name_DESC],
    students:[],
    filters:{
        page:'',
        size:'',
        company:'',
        dni:'',
        last_name:'',
        first_name:'',
        email:'',
        order:{
            element: 'last_name',
            type: 'ASC'
        }
    },
    pages:0,
    idStudent:0
}

export default g