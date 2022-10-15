import {Injectable} from '@angular/core';
import {Apollo, gql} from "apollo-angular";
import {ComplaintsFilter} from "../../common/transport/filters/complaint-filter";
import {catchError, map, Observable, of, retry, switchMap} from "rxjs";
import {Complaint} from "../../common/transport/models/complaint";
import {AuthService} from "./auth.service";
import {UpdateProvider} from "../../common/transport/models/update-provider";
import {FilterRequestParams} from "../../common/interfaces/pageing/pageable";
import {Page} from "../../common/transport/models/page";
import {buildRetryFunction} from "@apollo/client/link/retry/retryFunction";

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {

    constructor(readonly apollo: Apollo, readonly authService: AuthService) {
    }

    getComplaints(filter: FilterRequestParams<Complaint>): Observable<Page<Complaint>> {
        return this.apollo.query<any>({
            query: gql`
                query getComplaints($matchingObject: IComplaint, $dateFilter: ITimeRange, $limits: IPagination, $isProcessed: Boolean){
                    getComplaints(matchingObject: $matchingObject, dateFilter: $dateFilter, limits: $limits, isProcessed:$isProcessed){
                        content {
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
                        totalElements
                    }
                }
            `, fetchPolicy: "network-only", variables: {
                matchingObject: filter.matchingObject,
                dateFilter: filter.extras ? filter.extras['dateFilter'] : undefined,
                limits: filter.limits,
                isProcessed: filter.extras ? filter.extras['isProcessed'] : undefined
            }
        }).pipe(map(data => data.data.getComplaints))
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
