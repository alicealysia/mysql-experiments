import { query_mysql } from './query';
import {Table} from './names';

interface KeyParamPair <T> {
    [key: string]: Partial<T>
}

interface KeyAsPair <T> {
    [key: string]: string
}

export const query = <tbl extends keyof Table, params extends Table[tbl]> (table: tbl) => {
    return new Query(table);
}

class Query <tbl extends keyof Table, params extends Table[tbl]> {
    private table: tbl;
    private paramList: Partial<params> = {} as params;
    private rawConstraint: string = '';
    private parameters: KeyParamPair<params> = {};
    private constraints: KeyParamPair<params> = {};
    private orders : {[key:string]: string} = {};
    private renames : KeyAsPair<params> = {};
    public limit: number = 0;
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
    public async findOne (...params: (keyof Partial<params>)[]) {
        const where = this.setWhere();
       const parameters = params.length > 0? params.join(', ') : '*';
        const queryResults: params = await query_mysql(`SELECT ${parameters} FROM ${this.table} ${where}`).then(results => results[0]); 
        return queryResults;
    }
    /**
     * find all rows which match the specified constraints
     * @param params parameters you wish to scope your query by. leave blank for a wildcard.
     */
    public async find (...params: (keyof Partial<params>)[]) {
        
        const where = this.setWhere();
        const parameters = params.length > 0? params.join(', ') : '*';

        const queryResults: (params)[] = await query_mysql(`SELECT ${parameters} FROM ${this.table} ${where}`);
        
        return queryResults;
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

    public setParameters (parameters: Partial<params>) {
        Object.keys(parameters).forEach(param => {
            this.parameters[param] = parameters[param];
        })
        return this;
    }
    public setConstraints (parameters: Partial<params>) {
        Object.keys(parameters).forEach(param => {
            this.constraints[param] = parameters[param];
        })
        return this;
    }
    public setLimit (limit: number) {
        this.limit = limit;
        return this;
    }

    //the handlers for parameters and constraints.
    private parameterHandler = {
        set: <T extends keyof Partial<params>> (obj: params, prop: T, value: params[T]) => {
            this.parameters[prop.toString()] = value;
            console.log(this.parameters);
            return true;
        }
    }
    private constraintHandler = {
        set: <T extends keyof Partial<params>> (obj: params, prop: T, value: params[T]) => {
            this.constraints[prop.toString()] = value;
            return true;
        }
    }
    public orderBy <T extends keyof Partial<params>> (parameter: T, value: 'ASC' | 'DESC') {
        this.orders[parameter.toString()] = value;
        return this;
    }
    private setWhere () {
        if (this.rawConstraint !== '') {
            return this.rawConstraint;
        }
        const constraints = Object.entries(this.constraints).length > 0? `WHERE ${Object.entries(this.constraints).map(value => `${value[0]} = ${typeof value[1] === 'string'? `"${value[1]}"`: value[1]}`).join(' AND ')} `: '';
        const orders = Object.entries(this.orders).length > 0? `ORDER BY ${Object.entries(this.orders).map(value => `${value[0]} "${value[1]}"`).join(', ')} `: '';
        const limit = this.limit !== 0? ` LIMIT ${this.limit}` : '';
        return `${constraints}${orders}${limit}`;
    }

    /** setter only!!!
     * set up the parameters for an insert or update.
     */
    public parameter = new Proxy(this.paramList, this.parameterHandler);
    /** setter only!!!
     * set the constraints for a simple where clause.
     */
    public constraint = new Proxy(this.paramList, this.constraintHandler);
    /** setter only!!!
     * set one or more objects to order by.
     */
}