import {Injectable} from '@angular/core';
import {Apollo, gql} from "apollo-angular";
import {ComplaintsFilter} from "../../common/transport/filters/complaint-filter";
import {map, Observable} from "rxjs";
import {Complaint} from "../../common/transport/models/complaint";
import {UserService} from "./user.service";
import {AuthService} from "./auth.service";
import {UpdateProvider} from "../../common/transport/models/update-provider";

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {

    constructor(readonly apollo: Apollo, readonly authService: AuthService) {
    }

    getComplaints(filter: ComplaintsFilter): Observable<[Complaint[], number]> {
        return this.apollo.query<any>({
            query: gql`
                query getComplaints($filter: ComplaintsFilter){
                    getComplaints(filter: $filter){
                        complaintId
                        created
                        description
                        phone
                        processed {
                            name
                            avatar
                        }
                        processedTime
                        session {
                            login
                            house {
                                address
                            }
                        }
                    }
                    getTotalComplaints(filter: $filter)
                }
            `, fetchPolicy: "network-only", variables: {filter}
        }).pipe(map(data => [data.data.getComplaints, data.data.getTotalComplaints]))
    }

    getTotalComplaints(filter: ComplaintsFilter): Observable<number> {
        return this.apollo.query<any>({
            query: gql`
                query getTotalComplaints($filter: ComplaintsFilter){
                    getTotalComplaints(filter: $filter)
                }
            `, fetchPolicy: "network-only", variables: {filter}
        }).pipe(map(data => data.data.getTotalComplaints));
    }

    doProcessed(id: number) {
        const username = this.authService.getUsername()
        return this.apollo.mutate({
            mutation: gql`
                mutation doProcessedComplaint($id: Int, $username: String){
                    doProcessedComplaint(id:$id, username:$username)
                }
            `, variables: {id, username}
        })
    }

    updateComplaints(): Observable<UpdateProvider<Complaint>> {
        return this.apollo.subscribe<any>({
            query: gql`
                subscription {
                    updateComplaints {
                        updateType
                        object {
                            complaintId
                            created
                            phone
                            description
                            processedTime
                            processed {
                                name
                                avatar
                            }
                            session {
                                house {
                                    address
                                }
                                login
                            }
                        }
                    }
                }
            `
        }).pipe(map(data => data.data.updateComplaints));
    }
}
