var express = require('express')
var Airtable = require('airtable')
const { restoreDefaultPrompts } = require('inquirer')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)

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

router.get('/:physician_id', (req, res) => {
    let appointment_ids;
    let appointments;
    
    base('Doctors').find(req.params.physician_id, function(err, physician_record) {
        if (err) { res.status(500).json(err); console.error(err); return; }
        appointment_ids = physician_record.get('Appointments')
    })
    base('Appointments').select({
        view: "Grid view",
        appointmentID: appointment_ids
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        appointments = records.fields
        console.log(records)
        records.forEach(function(record) {
            console.log('Retrieved', record.get('Name'));
        });
    
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    
    }, function done(err) {
        if (err) { console.error(err); return; }
        res.status(200).send("appointments")
    });

})
    // .put( (req, res) => {
    //     res.send(`update user with id ${req.params.id}`)
    // })
    // .delete( (req, res) => {
    //     res.send(`delete user with id ${req.params.id}`)
    // })

module.exports = router