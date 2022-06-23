var express = require('express')
var Airtable = require('airtable')
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
            doctorNames.push(record.get('Name'));
        });
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    
    }, function done(err) {
        if (err) { console.error(err); return; }
        else {
            res.status(200).json(doctorNames)
        }
    });
    
})

router.route('/:id')
    .get( (req, res) => {
        res.send(`get user with id ${req.params.id}`)
    })

    .put( (req, res) => {
        res.send(`update user with id ${req.params.id}`)
    })
    .delete( (req, res) => {
        res.send(`delete user with id ${req.params.id}`)
    })

module.exports = router