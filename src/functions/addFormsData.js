
const db = require('../../database/models')
const readGoogleSheets = require('../functions/readGoogleSheets')
const formsDataQueries = require('../functions/formsDataQueries')

async function addFormsData(dataToImport) {

    //delete last 50 records from database            
    const ids = await db.Forms_data.findAll({
        attributes: [['id','id']]
    })

    //import all data (last 5000 or all data)
    let idsToDelete = []
    if (dataToImport == 'allData') {
        idsToDelete = ids.slice(-5000)
    }

    var idsToDeleteArray = []

    idsToDelete.forEach(id => {
        idsToDeleteArray.push(id.id)                
    });

    await db.Forms_data.destroy({
        where:{id:idsToDeleteArray}
    })

    //read google sheets data
    let mdbData = await readGoogleSheets.mdbData()

    //find first row to add to database
    //database qty
    const formsData = await db.Forms_data.findAll({raw:true})
    const firstRowToAdd =  formsData.length + 1 // add one row because data includes titles

    //slice mdbData
    mdbData = mdbData.slice(firstRowToAdd)
    
    //structure data
    let structuredData = []
    for (let i = 0; i < mdbData.length; i++) {
        //get date
        const dateString = mdbData[i][0].split(' ')[0]
        const dateArray = dateString.split('/')
        const date = new Date( dateArray[2], dateArray[1] - 1, dateArray[0])
        const dateTimestamp = date.getTime()

        //get student code
        const courseCode = mdbData[i][3] == '' ? 0 : parseInt(mdbData[i][3])
        const studentCode = await formsDataQueries.studentCode(courseCode)

        //get grade
        let grade = 0
        if (!isNaN(parseFloat(mdbData[i][2]))) {
            grade = parseFloat(mdbData[i][2]).toFixed(2)
        }

        structuredData.push({
            date:dateTimestamp,
            email:mdbData[i][1],
            grade:grade,
            last_name:mdbData[i][4],
            first_name:mdbData[i][5],
            company:mdbData[i][7],
            dni:mdbData[i][6] == '' ? 0 : parseInt(mdbData[i][6]),
            form_name:mdbData[i][8] == '' || mdbData[i][8] == null ? 'Sin Form' : mdbData[i][8],
            course_code:courseCode,
            student_code:studentCode,
            observations:mdbData[i][9]
        })
    }

    //add data to database
    await db.Forms_data.bulkCreate(structuredData)

}

module.exports = {addFormsData}
