import { Table } from './names';
import { query_mysql } from './query';

class Update <tbl extends keyof Table> {
    private table: string;
    private parameters: string[] = [];
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
    /**
     * @param parameter the parameter to update
     * @param value
     */
    public value <T extends keyof Partial<Table[tbl]>, K extends Table[tbl]> (parameter: T, value: K[T]) {
        this.parameters.push(`${parameter.toString()} = ?`);
        this.values.push(value);
        return this;
    }

    public execute () {
        return query_mysql(`UPDATE ${this.table} ${this.parameters.join(', ')} WHERE ${this._condition}`, this.values);
    }
}

export default Update;