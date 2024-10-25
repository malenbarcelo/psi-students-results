const { google } = require('googleapis');
const credentials = require('../credentials/credentialsGoogleSheets.json')

// auth configuration 
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

const readMDBSheet = {
    mdbData: async() => {

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = '11QFK7UFuwY6GQnScu5ds7B0icuIuH-5qUW_6pJyrFlg';
        const range = 'MDB!A:K';

        try{
            const mdbData = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            })

            const values = mdbData.data.values;
            return values;

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    }
}

module.exports = readMDBSheet