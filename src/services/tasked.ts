const { add } = require('lodash')
const {v4: uuidv4} = require('uuid')
const fs = require('fs')
const YAML = require('yaml')

export function Retry (tempDir: string, _txn: string = null) {

    let step = 0
    const txn = _txn == null ? uuidv4().replace(/-/g,'').toUpperCase() : _txn
    const ctx = _txn == null ? {} : YAML.parse(fs.readFileSync(`${tempDir}/${txn}.yaml`, {encoding:'utf-8'}))
    const tasks : any = []

    const clone = ((c:any) => JSON.parse(JSON.stringify(c)))

    const updateContext = () => {
        fs.writeFileSync(`${tempDir}/${txn}.yaml`, YAML.stringify(ctx))
    }

    const runTask = async function (task:any) {
        const tag = "[" + txn + "  " + task.name + "]"
        ctx[task.name] = { state: 'starting' }
        updateContext()
        await task.func(clone(ctx), ...task.args).then((out:any) => {
            ctx[task.name] = { state: 'ok', out: out }
            console.log(`${tag} OK ${JSON.stringify(out)}`)
            updateContext()
        }).catch((err:any) => {
            ctx[task.name] = { state: 'failed', err: err }
            updateContext()
            console.log(`${tag} ERROR ${JSON.stringify(err)}`)
            throw(err)
        })
    }

    const start = async function Start() {
        while (step < tasks.length) {
            const task : any = tasks[step]

            if (!(task.name in ctx) || ctx[task.name].state !== 'ok') {
                await runTask (task)
            } else {
                console.log("SKIPPING " + task.name)
            }

            step++
        }
    }

    return {
        start: start,
        add: function add(name:string, func:any, ...args: any) {
            tasks.push({name: name, func: func, args: args})
            return this
        }
    }
}
