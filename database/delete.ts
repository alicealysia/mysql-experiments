import { query_mysql } from './query'
import { Table } from './names'

class Delete <tbl extends keyof Table> {
    private table: string;
    private values: any[] = [];
    private _condition: string = '';

    constructor (tableName: tbl) {
        this.table = tableName;
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

    public execute () {
        return query_mysql(`DELETE FROM ${this.table} WHERE ${this._condition}`, this.values);
    }
}

export default Delete;