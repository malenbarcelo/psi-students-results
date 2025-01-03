
const formsDataQueries = require('../../functions/formsDataQueries')
const coursesQueries = require('../../functions/coursesQueries')
const associatedFormsQueries = require('../../dbQueries/associatedFormsQueries')

const resultsController = {
  getData: async(req,res) =>{
    try{
      
      const data = await formsDataQueries.studentsResults()

      return res.status(200).json(data)

    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
  associatedFormsData: async(req,res) =>{
    try{

      const courseId = req.params.courseId
      const company = req.session.userLogged.users_companies.company_name

      //get associated forms data
      const formsData = await associatedFormsQueries.courseAssociatedForms(courseId)


      //get associated forms results
      const forms = formsData.map( d => d.course_data.course_name)

      //let results = await formsDataQueries.studentsResults()
      //results = results.filter( r => forms.includes(r.form_name) )
      //results = company == 'PSI Smart Services' ? results : results.filter(r => r.company == company)

      let results = await formsDataQueries.courseResults(forms,company)
      
      const groupedResults = results.reduce((acc, result) => {
        const { dni, company, form_name } = result;
        
        // Generamos una clave única basada en dni, company y form_name
        const key = `${dni}-${company}-${form_name}`;
        
        // Si ya existe un grupo para esa clave, agregamos el resultado a su array "results"
        if (!acc[key]) {
          acc[key] = { dni, company, form_name, results: [] };
        }
        
        acc[key].results.push(result);
        
        return acc;
      }, {});

      results = Object.values(groupedResults)

      const data = {
        formsData,
        results
      }

      return res.status(200).json(data)

    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
}
module.exports = resultsController

