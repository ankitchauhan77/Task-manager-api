const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const auth = require('../middleware/auth');


// GET /tasks?completed=true
// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    match.owner = req.user._id;
    if (req.query.completed) match.completed = req.query.completed === 'true';
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1);
    }
    try {
        const tasks = await Task.find(match, null, {limit : parseInt(req.query.limit), skip : parseInt(req.query.skip),
            sort
        });
        // await req.user.populate("tasks");
        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }   
});


router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    try {
        const task = await Task.findOne({_id, owner : req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
});


router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner : req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});


router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
    
    if (!isValidUpdate) {
        return res.status(404).send({error : 'Invalid update'});
    }

    try {
        const task = await Task.findOne({_id : req.params.id, owner : req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch(e) {
        res.status(400).send(e);
    }
});


router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
});




module.exports = router;