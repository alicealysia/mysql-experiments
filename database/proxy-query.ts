import { query_mysql } from './query';
import {Table} from './names';

export class Query <tbl extends keyof Table, params extends Table[tbl]> {
    private table: tbl;
    private paramList: Partial<params> = {} as params;
    private rows: params[] = [];
    private rawConstraint: string = '';
    private parameters: { [key:string]: Partial<params> }[] = [];
    private constraints: { [key:string]: Partial<params> }[] = [];
    /**
     * begin your query
     * @param table name of the table you wish to query
     */
    constructor (table: tbl) {
        this.table = table;
    }
    /**
     * Set a definite where statement, use this when working with complex constraints
     * @param parameter the where query you wish to work with
     */
    public WHERE (parameter: string) {
        this.rawConstraint = parameter;
    }
    /**
     * find a single row.
     * @param params parameters you wish to scope your query by. leave blank for a wildcard.
     */
    public async findOne (params?: (keyof Partial<params>)[] | keyof Partial<params>) {
        const where = this.setWhere();
        const parameters = params? Array.isArray(params)? params.join(', ') : params.toString(): '*';
        const queryResults: params = await query_mysql(`SELECT ${parameters} FROM ${this.table} ${where}`).then(results => results[0]); 
        return queryResults;
    }
    /**
     * find all rows which match the specified constraints
     * @param params parameters you wish to scope your query by. leave blank for a wildcard.
     */
    public async find (params?: keyof Partial<params>[]) {
        const where = this.setWhere();
        const parameters = params? Array.isArray(params)? params.join(', ') : params.toString(): '*';
        this.rows = await query_mysql(`SELECT ${parameters} FROM ${this.table} ${where}`); 
        return this.rows;
    }
    /**
     * insert specified parameters, constraints will not be used by this.
     */
    public async insert () {
        const values = Object.values(this.parameters);
        const sqlPlaceholder = Array(values.length).fill('?').join(', ');
        await query_mysql(`INSERT INTO ${this.table}(${Object.keys(this.parameters)}) VALUES(${sqlPlaceholder})`, values);
    }
    /**
     * delete any rows which match the specified constraints.
     */
    public async delete () {
        const where = this.setWhere();
        await query_mysql(`DELETE FROM ${this.table} ${where}`);
    }
    /**
     * update the table with the specified parameters where the specified constraints are matched.
     */
    public async update () {
        const where = this.setWhere();
        const keys = Object.keys(this.parameters).map(value => `${value} = ?`).join(', ');
        const values = Object.values(this.parameters);
        await query_mysql(`UPDATE ${this.table} SET ${keys} ${where}`, values);
    }

    //the handlers for parameters and constraints.
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