class Task {
    constructor(name, category, deadline, description, type) {
        this.name = name
        this.category = category
        this.deadline = deadline
        this.description = description
        this.type=type
    }
    static CreateTaskCard(task) {
        const container = document.createElement('div')
        container.dataset.name=task.name
        container.innerHTML = `
            <h4>${task.name}</h4>
            <img data-task='type' src="./assets/${task.type}.png"></img>
            <div>
            <div data-task='category'>${task.category}</div>
            <div data-task='deadline'>${task.deadline}</div>
            <div data-task='description'>${task.description}</div>
        </div>
        <div>
            <input data-name='${task.name}' data-action="modify" type="button" value="Modify">
            <input data-name='${task.name}' data-action="delete" type="button" value="Delete">
        </div>
    `
        return container
    }
}


const taskDialog = document.getElementById('taskDialog')
/**
 * @type {HTMLFormElement}
 */
const taskForm = document.forms['taskForm']

const req = indexedDB.open('ToDoList')
/**
 * @type {IDBDatabase}
 */
let db
req.onupgradeneeded = function () {
    const db = req.result
    const taskStore = db.createObjectStore('task',{autoIncrement:true,keyPath:'name'})
    Object.keys(new Task()).forEach
    (
        propName=>{
            taskStore.createIndex(propName,propName)
        }
    )
}
req.onsuccess=function () {
    db=req.result
    db.transaction('task','readonly').objectStore('task').getAll()
    .onsuccess=(res)=>
        {
            const container = document.querySelector('section')
            res.target.result.forEach(task=>
                {
                    container.append(Task.CreateTaskCard(task))
                }
            )
        }
    
}
req.onerror=function (err) {
    console.error(err)
}



taskForm.addEventListener('submit', function (e) {
    if (e.submitter.value == 'Cancel') {
        return
    }

    const data = new FormData(this)
    e.target.reset()
    const task = new Task(data.get('name'), data.get('category'), data.get('deadline'), data.get('description'), data.get('type'))

    const action = taskDialog.dataset.action
    if (action == 'create') {
        db.transaction('task','readwrite').objectStore('task').add(task)
        .onerror=err=>console.log('Error: '+err)
        document.querySelector('section').append(Task.CreateTaskCard(task))
        return
    }
    if (action == 'modify') {
        const req = db.transaction('task','readwrite').objectStore('task').put(task)
        req.onerror=err=>console.log('Error: '+err)
        req.onsuccess=ev=>
            {
                console.log(ev.target.result);
                const container = document.querySelector('section').querySelector(`div[data-name=${task.name}]`)
                console.log(container);
                container.querySelector('*[data-task="type"]').src=`./assets/${task.type}.png`
                // container.querySelector('*[data-task="category"]').innerHTML=task.category
                // container.querySelector('*[data-task="name"]').innerHTML=task.name
                // container.querySelector('*[data-task="deadline"]').innerHTML=task.deadline
                // container.querySelector('*[data-task="description"]').innerHTML=task.description
            }
        return
    }
        e.preventDefault()

})
document.getElementById('btnNewTask').addEventListener('click', () => {
    taskForm.reset()
    taskDialog.showModal()
    taskDialog.setAttribute('data-action', 'create')
    taskForm.elements.btnSubmit.value = 'Add task'
}
)
document.querySelector('section').addEventListener('click', function (e) {
    const target = e.target
    if (!(target instanceof HTMLInputElement)) {
        e.preventDefault()
        return
    }
    const value = target.dataset.action
    const taskName = target.dataset.name
    if (value == 'modify') {
        db.transaction('task').objectStore('task').get(taskName)
        .onsuccess=(ev)=>
            {
                taskDialog.showModal()
                taskDialog.setAttribute('data-action', 'modify')
                taskForm.elements.btnSubmit.value = 'Modify'
                const task = ev.target.result
                Object.getOwnPropertyNames(new Task()).forEach(propName=>{
                    taskForm.elements[propName].value=task[propName]})
            }
        return
    }
    if (value == 'delete') {
        db.transaction('task','readwrite').objectStore('task').delete(taskName)
        .onerror=ev=>console.error('Error deleting: '+ev)

    }
})