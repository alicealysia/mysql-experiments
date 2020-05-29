import { query_mysql } from './query';
import {Table} from './names';

export class Query <tbl extends keyof Table, params extends Table[tbl]> {
    private table: tbl;
    private paramList: params = {} as params;
    private rows: params[] = [];
    private rawConstraint: string = '';
    private parameters: { [key:string]: Partial<params> }[] = [];
    private constraints: { [key:string]: Partial<params> }[] = [];
    constructor (table: tbl) {
        this.table = table;
    }
    public WHERE (parameter: string) {
        this.rawConstraint = parameter;
    }
    public async findOne (params?: (keyof Partial<params>)[] | keyof Partial<params>) {
        const where = this.setWhere();
        const parameters = params? Array.isArray(params)? params.join(', ') : params.toString(): '*';
        this.paramList = await query_mysql(`SELECT ${parameters} FROM ${this.table} ${where}`).then(results => results[0]); 
        return this.paramList;
    }
    public async find (params?: keyof Partial<params>[]) {
        const where = this.setWhere();
        const parameters = params? Array.isArray(params)? params.join(', ') : params.toString(): '*';
        this.rows = await query_mysql(`SELECT ${parameters} FROM ${this.table} ${where}`); 
        return this.rows;
    }
    public async insert () {
        const values = Object.values(this.parameters);
        const sqlPlaceholder = Array(values.length).fill('?').join(', ');
        await query_mysql(`INSERT INTO ${this.table}(${Object.keys(this.parameters)}) VALUES(${sqlPlaceholder})`, values);
    }
    public async delete () {
        const where = this.setWhere();
        await query_mysql(`DELETE FROM ${this.table} ${where}`);
    }
    public async update () {
        const where = this.setWhere();
        const keys = Object.keys(this.parameters).map(value => `${value} = ?`).join(', ');
        const values = Object.values(this.parameters);
        await query_mysql(`UPDATE ${this.table} SET ${keys} ${where}`, values);
    }
    private parameterHandler = {
        set: <T extends keyof Partial<params>> (obj: params, prop: T, value: params[T]) => {
            this.parameters.push({
                [prop]: value
            })
            return true;
        }
    }
    private constraintHandler = {
        set: <T extends keyof Partial<params>> (obj: params, prop: T, value: params[T]) => {
            this.constraints.push({
                [prop]: value
            })
            return true;
        }
    }
    private setWhere () {
        if (this.rawConstraint !== '') {
            return this.rawConstraint;
        }
        const entries = Object.entries(this.constraints).map(value => `${value[0]} = ${value[1]}`).join(' AND ');
        if (!entries || entries === '') {
            return '';
        }
        return `WHERE ${entries}`;
    }

    /** setter only!!!
     * set up the parameters for an insert or update.
     */
    public parameter = new Proxy(this.paramList, this.parameterHandler);
    /** setter only!!!
     * set the constraints for a simple where clause.
     */
    public constraint = new Proxy(this.paramList, this.constraintHandler);
}