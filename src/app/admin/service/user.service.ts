import {query} from "@angular/animations";
import {Injectable} from "@angular/core";
import {FetchResult} from "@apollo/client/core";
import {Apollo, gql, MutationResult} from "apollo-angular";
import {map, Observable} from "rxjs";
import {RoleGroup} from "src/app/common/transport/models/role";
import {UpdateProvider} from "src/app/common/transport/models/update-provider";
import {User} from "src/app/common/transport/models/user";

@Injectable({
    providedIn: "root",
})
export class UserService {
    constructor(readonly apollo: Apollo) {
    }

    getUserByUsername(username: String): Observable<User> {
        return this.apollo
        .query<any>({
            query: gql`
                query getUserByUsername($username: String) {
                    getUserByUsername(username: $username) {
                        name
                        avatar
                    }
                }
            `,
            variables: {username},
        })
        .pipe(map((data) => data.data?.getUserByUsername));
    }

    getAllUsers(): Observable<User[]> {
        return this.apollo
        .query<any>({
            query: gql`
                {
                    getAllUsers {
                        userId
                        username
                        role {
                            description
                            roleId
                        }
                        name
                        created
                        avatar
                        password
                    }
                }
            `,
            fetchPolicy: "network-only",
        })
        .pipe(
            map((result) => {
                return [...result.data?.getAllUsers];
            }),
        );
    }

    getAllRoles(): Observable<RoleGroup[]> {
        return this.apollo
        .query<any>({
            query: gql`
                {
                    getAllRoles {
                        roleId
                        description
                    }
                }
            `,
            fetchPolicy: "network-only",
        })
        .pipe(
            map((result) => {
                return [...result.data?.getAllRoles];
            }),
        );
    }

    createUser(user: User): Observable<MutationResult<any>> {
        return this.apollo.mutate<any>({
            mutation: gql`
                mutation createUser($user: IUser) {
                    createUser(user: $user) {
                        userId
                    }
                }
            `,
            variables: {user},
        });
    }

    editUser(user: User): Observable<MutationResult<any>> {
        return this.apollo.mutate<any>({
            mutation: gql`
                mutation editUser($user: IUser) {
                    editUser(user: $user) {
                        userId
                    }
                }
            `,
            variables: {user},
        });
    }

    deleteUser(userId: number): Observable<MutationResult<any>> {
        return this.apollo.mutate<any>({
            mutation: gql`
                mutation deleteUser($userId: Int) {
                    deleteUser(userId: $userId) {
                        userId
                    }
                }
            `,
            variables: {userId},
        });
    }

    updateUsers(): Observable<UpdateProvider<User>> {
        return this.apollo
        .subscribe<any>({
            query: gql`
                subscription {
                    updateUsers {
                        updateType
                        object {
                            userId
                            name
                            username
                            password
                            avatar
                            role {
                                roleId
                                description
                            }
                        }
                    }
                }
            `,
        })
        .pipe(
            map((result) => {
                return result.data?.updateUsers;
            }),
        );
    }

    validateLogin(login: string): Observable<Boolean> {
        return this.apollo
        .query<any>({
            query: gql`
                query validator($login: String) {
                    validateLogin(login: $login)
                }
            `,
            variables: {
                login,
            },
            fetchPolicy: "network-only",
        })
        .pipe(map((result) => result.data?.validateLogin));
    }
}
