import { Table } from './names';
import { query_mysql } from './query';

class Insert <tbl extends keyof Table> {
    private table: string;
    private parameters: string[] = [];
    private values: any[] = [];

    constructor (tableName: tbl) {
        this.table = tableName;
    }

    public value <T extends keyof Partial<Table[tbl]>, K extends Table[tbl]> (parameter: T, value: K[T]) {
        this.parameters.push(parameter.toString());
        this.values.push(value);
        return this;
    }

    public execute () {
        const len = this.values.length;
        const sqlPlaceholder = Array(len).fill('?').join(',');
        return query_mysql(`INSERT INTO ${this.table} (${this.parameters.join(', ')}) VALUES (${sqlPlaceholder})`, this.values);
    }
}

export default Insert;