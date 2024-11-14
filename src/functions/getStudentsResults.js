const formsDataQueries = require('../functions/formsDataQueries')
const coursesQueries = require('../functions/coursesQueries')
const associatedFormsQueries = require('../dbQueries/associatedFormsQueries')

async function getStudentsResults() {

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let formsData = await formsDataQueries.getData()

    //order results
    formsData = formsData.map(fd => {
        if (fd.results) {
            fd.results.sort((a, b) => b.id - a.id)
        }
        return fd
    });

    //add expiration date and passed
    formsData = formsData.map(fd => {
        if (fd.results && fd.results[0]) {
            const expirationDate = new Date(fd.results[0].date)
            expirationDate.setMonth(expirationDate.getMonth() + fd.forms_data_courses.validity)
            const date = new Date()
            const dateArg = new Date(date.getTime() + (-3 * 60 * 60 * 1000))
            const daysToExpiration = (expirationDate - dateArg) / (1000 * 60 * 60 * 24)
            fd.results[0].expirationDate = expirationDate.toISOString();
            fd.results[0].daysToExpiration = parseInt(daysToExpiration);
            fd.results[0].passed = (parseFloat(fd.forms_data_courses.pass_grade,2)/100) > parseFloat(fd.results[0].grade,2) ? 0 : 1;
        }

        return fd
    })

    const formsDataToExpire = formsData.filter( fd => fd.results[0].daysToExpiration == 90 || fd.results[0].daysToExpiration == 60 || fd.results[0].daysToExpiration == 30 || fd.results[0].daysToExpiration == 10 )

    const prueba1 = formsData.filter(fd => fd.dni == 24609781 && fd.form_name == 'Amoladora Teórico')[0]
    const prueba2 = formsData.filter(fd => fd.dni == 32744559 && fd.form_name == 'Analista de Gases')[0]

    console.log(formsDataToExpire[0].results[0].daysToExpiration)
    console.log(formsDataToExpire[1].results[0].daysToExpiration)




    // //add course data
    // studentsResults = await Promise.all(studentsResults.map(async (sr) => {
    //     const courseData = await coursesQueries.courseDataByName(sr.form_name)
    //     const associatedForms = await associatedFormsQueries.getAssociatedForms(courseData.id)
    //     let associatedIds = [
    //         ...new Set(associatedForms.map(af => af.id_forms)),
    //         ...new Set(associatedForms.map(af => af.id_associated_form)),
    //     ]
    //     associatedIds = associatedIds.filter( a  => a != courseData.id)
    //     const associatedResults = []
    //     for (let i = 0; i < associatedIds.length; i++) {
    //         const results = formsDataQueries.getDataFiltered(sr.form_name,sr.dni)
            
    //     }
        

    //     return {
    //         ...sr,
    //         courseData,
    //         associatedIds

    //     };
    //}));

    return today

}

module.exports = {getStudentsResults}
