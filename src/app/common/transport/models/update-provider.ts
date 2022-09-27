import {ListMutationTypes} from "../enums/list-mutation-types";

export class UpdateProvider<T> {
    public updateType = ListMutationTypes.ADD;
    public object?: T;
}
