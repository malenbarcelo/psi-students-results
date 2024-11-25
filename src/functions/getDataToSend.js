const formsDataQueries = require('./formsDataQueries')
const coursesQueries = require('./coursesQueries')
const usersQueries = require('./usersQueries')
const associatedFormsQueries = require('../dbQueries/associatedFormsQueries')

async function getDataToSend() {

    const data = await formsDataQueries.studentsResults()

    //get data to send
    let dataFiltered = data.filter( d => d.results[0].days_to_expiration == 90 || d.results[0].days_to_expiration == 60 || d.results[0].days_to_expiration == 30 || d.results[0].days_to_expiration == 1)

    console.log(dataFiltered[0].results)
    
    dataFiltered = dataFiltered.map(df => ({ form_name: df.form_name, company: df.company, days_to_expiration: df.results[0].days_to_expiration }))

    let emailsToSend = Array.from(
        new Map(dataFiltered.map(item => [JSON.stringify(item), item])).values()
    )

    const response = await fetch('https://psi-courses-management.wnpower.host/apis/users/get-users', {
        method: 'GET', 
        headers: {
            'Authorization': 'Bearer l)Zmi#S$FEB4'
        }
    })

    const users = await response.json()

    emailsToSend.forEach(async(element) => {
        element.studentsQty = dataFiltered.filter(df => df.form_name == element.form_name && df.company == element.company).length
        const usersToSend = users.filter(u => u.users_companies.company_name == element.company)
        const emails = usersToSend.length == 0 ? [] : usersToSend.map(u => u.email) 
        element.emails = emails
    })

    





    //console.log(emailsToSend)

    // //get associated results
    // await Promise.all(dataFiltered.map(async (df) => {
    //     await Promise.all(df.forms_data_courses.associated_courses.map(async (ac) => {
    //         const dni = df.dni;
    //         const idCourse = ac.id_associated_form;
    //         const company = df.company;
    
    //         const results = await formsDataQueries.studentResults(idCourse, dni, company);
    //         ac.results = results;
    //     }));
    // }));

    //console.log(dataFiltered[0])
    // console.log(dataFiltered[0].results)
    //console.log(dataFiltered[0].forms_data_courses.associated_courses[0])

    return data

}

module.exports = {getDataToSend}
