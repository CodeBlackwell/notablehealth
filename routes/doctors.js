var express = require('express')
var Airtable = require('airtable')
const { restoreDefaultPrompts } = require('inquirer')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
const physiciansTable = base('Doctors')
const appointmentsTable = base('Appointments')
// instantiate router
const router = express.Router()

router.get('/', (req, res) => {
    const doctorNames = []
    base('Doctors').select({
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function(record) {
            doctorNames.push({
                name: record.get('Name'),
                physicianID: record.get('PhysicianID')
            });
            console.log(doctorNames)
        });
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    
    }, function done(err) {
        if (err) {
            console.error(err); return; 
            res.status(500).json(err)
        }
        else {
            res.status(200).json(doctorNames)
        }
    });
})

router.get('/:physician_id', async (req, res) => {
    let appointments;
    
    const findAppointmentRecordById = async (id) => {
        await base('Appointment').find(id, (err, record) => {
            if (err) { res.status(500).json(err); console.error(err); return; }
            return record
        })
    }

    const appointmentIdList = await base('Doctors').find(req.params.physician_id, async (err, physician_record) => {
        if (err) { res.status(500).json(err); console.error(err); return; }
        let appointment_ids = JSON.stringify(physician_record.fields.Appointments)
        console.log(appointment_ids)
        return appointment_ids
    })
    console.log(appointmentIdList, "OOF")
    // console.log(findAppointmentRecordById({recordId: 'recw1LExZnN41QryV'}, (err, res) => { console.log(res)}))
    
    
})
    // .put( (req, res) => {
    //     res.send(`update user with id ${req.params.id}`)
    // })
    // .delete( (req, res) => {
    //     res.send(`delete user with id ${req.params.id}`)
    // })

module.exports = router