import { Table } from './names';
import { query_mysql } from './query';

class Find <tbl extends keyof Table> {
    private table: tbl;
    private operation: string;
    private _condition: string = '';
    private values: any[] = [];
    /**
     * Create a new query
     * @param table of the table you wish to query FROM (not join)
     * @param params the parameters you wish to find
     */
    constructor (table: tbl, params: (keyof Partial<Table[tbl]>)[]) {
        this.table = table;
        this.operation = `SELECT ${params.join(', ')} FROM ${this.table}`;
    }
    /**
     * Repeatable condition you wish to be met (WHERE)
     * @param parameter column name
     * @param operation =, !=, etc.
     * @param value the value to compare
     * @param connector OR, AND, etc.
     */
    public condition <T extends keyof Partial<Table[tbl]>, K extends Table[tbl]> (parameter: T, operation: string, value: K[T], connector?: string) {
        this._condition += `${parameter} ${operation} ? ${connector || ''}`;
        this.values.push(value)
        return this;
    }
    /** return query results */
    public async execute () {
        if (this._condition === '') {
            return query_mysql(`${this.operation}`);
        }
        return query_mysql(`${this.operation} WHERE ${this._condition}`, this.values);
    }
    public async findOne () {
        return await this.execute().then(results => results[0]);
    }
}

export default Find;