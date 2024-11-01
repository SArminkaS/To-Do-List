class Task {
    constructor(name, category, deadline, description, type) {
        this.name = name
        this.category = category
        this.deadline = deadline
        this.description = description
        this.type=type
    }
    static CreateTaskCard(task) {
        if (!(task instanceof this)) { throw new TypeError(task + "is not a" + Task) }
        const container = document.createElement('div')
        container.dataset.name=task.name
        container.innerHTML = `
            <h4>${task.name}</h4>
            <img src="./assets/${task.type}.png"></img>
            <div>
            <div>${task.category}</div>
            <div>${task.deadline}</div>
            <div>${task.description}</div>
        </div>
        <div>
            <input data-name=${task.name} data-action="modify" type="button" value="Modify">
            <input data-name=${task.name} data-action="delete" type="button" value="Delete">
        </div>
    `
        return container
    }
}

/**
 * @type {Set<Task>}
 */
const tasks = new Set()
const taskDialog = document.getElementById('taskDialog')
/**
 * @type {HTMLFormElement}
 */
const taskForm = document.forms['taskForm']
/**
 * @type {IDBDatabase}
 */
let db=null
const req = indexedDB.open("ToDoList")
req.onerror=()=>console.error('Please enable IndexDb!')
req.onsuccess=ev=>{
    db=ev.target.result
    db.onerror=ev=>console.error(`Database error: ${ev.target.error?.message}`)
}



taskForm.addEventListener('submit', function (e) {
    const data = new FormData(this)
    e.target.reset()
        const task = new Task(data.get('name'), data.get('category'), data.get('deadline'), data.get('description'), data.get('type'))
    if (e.submitter.value == 'Cancel') {
        return
    }
    const action = taskDialog.dataset.action
    if (action == 'create') {
        tasks.add(task)
        document.querySelector('section').append(Task.CreateTaskCard(task))
        return
    }
    if (action == 'modify') {

    }
        e.preventDefault()

})
document.getElementById('btnNewTask').addEventListener('click', () => {
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
    
    if (value == 'modify') {
        taskDialog.showModal()
        taskDialog.setAttribute('data-action', 'modify')
        taskForm.elements.btnSubmit.value = 'Modify'
        tasks.forEach((v)=>{
    if(v.name==target.dataset.name)
        {
            for (let i = 0; i < taskForm.elements.length; i++) {
                const s = taskForm[i]
                if(v.hasOwnProperty(s.name))
                    {
                        s.setAttribute('value',v[s.name])
                    }
            }
            return
        }
})
        return
    }
    if (value == 'delete') {
        const taskName = target.dataset.name
tasks.forEach(v=>{if(v.name==taskName){return tasks.delete(v)}})
    }
})