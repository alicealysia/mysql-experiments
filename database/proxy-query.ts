import {Table} from './names';
import { query_mysql } from './query';

class Query <tbl extends keyof Table, params extends Table[tbl]> {
    private table: tbl;
    private parameters: params;
    private constraints: params;
    constructor (table: tbl) {
        this.table = table;
        this.parameters = {} as params;
        this.constraints = {} as params;
    }
    private constraintHandler = {
        set: <T extends keyof Partial<params>> (obj: params, prop: T, value: params[T]) => {
            obj[prop] = value
            return true;
        }
    }
    private parameterHandler = {
        get: async <T extends keyof Partial<params>> (target: params, prop: T) => {
            const constraintString = Object.entries(this.constraints).filter(value => value[1]).map(value => `${value[0]} = ${value[1]}`).join(' AND ');
            return await query_mysql(`SELECT ${prop} FROM ${this.table} ${constraintString || ''}`);
        }
    }
    public constraint = new Proxy<params>(this.constraints, this.constraintHandler);
}