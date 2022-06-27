var express = require('express')
var Airtable = require('airtable')
const { restoreDefaultPrompts } = require('inquirer')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
const appointmentsTable = base('Appointments')
// instantiate router
const router = express.Router()

const getAppointmentById = async (id) => {
    return await appointmentsTable.find(id)
}

const createAppointments = async (req, res) => {
    const validMinutes = {"0": true, "15": true, "30": true, "45": true}
    try {
        let convertedDate = new Date(req.body.date)
        if (validMinutes[convertedDate.getMinutes()] === undefined){
            res.status(400).send("Appointments can only be made at 15 minute intervals (0, 15, 30, 45)")
        }
        if (req.body.physicianID === undefined){
            res.status(404).send("Appointments can only be made with a physician id provided in the body")
        }
        if (req.body.patientID === undefined){
            res.status(404).send("Appointments can only be made with a patient id provided in the body")
        }
        if (req.body.date === undefined ) {
            res.status(404).send("Appointments can only be made with a date provided in the body")
        }


        appointmentsTable.create(req.body, function(err, newRecord) {
            if (err) {
                console.error(err);
                return;
            }
            newRecord.forEach(function (record) {
                console.log(record.getId());
            });
        });
    } catch (error) {
        console.log("Check for Invalid date format. Refer to JS Date() docs https://www.w3schools.com/js/js_date_formats.asp")
        res.status(404).send(error)
        return error
    }
}



const listAllAppointments = async (req, res)=> {
    const AppointmentDetails = []
    let queryParams = {}

    console.log("Current query params === ", !!Object.keys(req.body).length)
    if (
        "date" in req.body &&
        "physician_id" in req.body) {
        //@TODO: Trying to get the correct Formula is proving difficult.

        // example data
        /**
         * req.body.date = "06/15/2022"
         * req.body.physicianID = "rec9RDBizzyXWZT07"
         * -- expected output
         * ->  Donald Darkwing Follow-Up with Jake Schmidtt @ 2022-06-15T13:10:00.000Z
         */
        let filterFormula = ` AND(IF(FIND(${req.body.date}, {Date})), IF(FIND(${req.body.physicianID}, {Physician_ID})))`
        queryParams = {
            filterByFormula: filterFormula
        }
    }
        await appointmentsTable.select(queryParams).eachPage(async (records, fetchNextPage) => {
            records.forEach(record => {
                AppointmentDetails.push({
                    name: record.get('Name'),
                    appointmentID: record.get('Appointment_ID')
                })
            })
            fetchNextPage();
        },function done(err) {
            if (err) {
                console.error(err);
                res.status(500).json(err)
            }
            else {
                res.status(200).json(AppointmentDetails)
            }
        })

}

const deleteAppointmentById = async (id) => {
    try {
        const table = base('Appointments')
        return await table.destroy(id)
    } catch(err) {
        console.log(err)
    }
}

/**
 * List all Appointments on the Appointments' table indiscriminately
 */
router.get('/', async(req, res) => {
    await listAllAppointments(req, res)
})

router.route('/:appointment_id')
    /**
     * Retrieve appointment details by specifying the appointment ID.
     */
    .get(async (req, res) => {
    console.log(getAppointmentById(req.params.appointment_id))
    res.status(200).json(await getAppointmentById(req.params.appointment_id))
    })
    /**
     * Delete an appointment by specifying the appointment ID.
     */
    .delete(async (req, res) => {
    await deleteAppointmentById(req.params.appointment_id)
    res.status(200).send(`Appointment: ${req.params.appointment_id} has been deleted`)
    })
    /**
     * Create an Appointment: Provide appointment details in the request body.
     */

router.post( '/create', async(req, res) => {
    await createAppointments(req, res)
})
module.exports = router